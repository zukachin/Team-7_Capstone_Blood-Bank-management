// rareBloodExpiryAlert.js
const { Pool } = require('pg');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
require('dotenv').config();

// -------------------- CONFIG --------------------
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

// Define rare blood types (based on your blood_groups table)
const RARE_BLOOD_GROUPS = [
  'AB-', 'B-', 'A-', 'O-'  // Rh-negative types are generally considered rare
];

// Alert thresholds (days before expiry)
const ALERT_THRESHOLDS = {
  CRITICAL: 1,    // 1 day before expiry
  URGENT: 3,      // 3 days before expiry  
  WARNING: 7      // 7 days before expiry
};

const SEARCH_CONFIG = {
  INITIAL_RADIUS_KM: 5,
  MAX_RADIUS_KM: 50,
  RADIUS_STEP: 10
};

// -------------------- EMAIL CONFIG --------------------
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// -------------------- MOCK DATA SETUP --------------------
async function setupMockData() {
  try {
    // Add rare blood group flag to existing blood_groups table
    await pool.query(`
      ALTER TABLE blood_groups 
      ADD COLUMN IF NOT EXISTS is_rare BOOLEAN DEFAULT false;
    `);

    // Update existing blood groups to mark rare ones
    await pool.query(`
      UPDATE blood_groups 
      SET is_rare = CASE 
        WHEN group_name IN ('O-', 'A-', 'B-', 'AB-') THEN true
        ELSE false
      END;
    `);

    // Insert some test rare blood groups if they don't exist
    await pool.query(`
      INSERT INTO blood_groups (group_name, is_rare) VALUES 
        ('O-', true), ('A-', true), ('B-', true), ('AB-', true)
      ON CONFLICT DO NOTHING;
    `);

    // Create some test users with rare blood types
    const { rows: rareGroups } = await pool.query(`
      SELECT id FROM blood_groups WHERE is_rare = true LIMIT 2
    `);

    if (rareGroups.length > 0) {
      await pool.query(`
        INSERT INTO users (name, email, phone, blood_group_id, address, state_id, district_id, gender, is_verified, created_at, updated_at, age) VALUES 
          ('Test Rare Donor 1', 'raredonor1@test.com', '9999999991', $1, 'Chennai Test Address 1', 1, 1, 'Male', true, NOW(), NOW(), 25),
          ('Test Rare Donor 2', 'raredonor2@test.com', '9999999992', $2, 'Chennai Test Address 2', 1, 1, 'Female', true, NOW(), NOW(), 30)
        ON CONFLICT (email) DO NOTHING;
      `, [rareGroups[0].id, rareGroups[1] ? rareGroups[1].id : rareGroups[0].id]);

      // Get the inserted user IDs
      const { rows: testUsers } = await pool.query(`
        SELECT id, blood_group_id FROM users WHERE email IN ('raredonor1@test.com', 'raredonor2@test.com')
      `);

      // Create donors for these users
      for (const user of testUsers) {
        await pool.query(`
          INSERT INTO donors (user_id, first_name, last_name, dob, age, gender, mobile_no, email, blood_group_id, 
                            address, state_id, district_id, centre_id, registration_type, donated_previously, 
                            willing_future_donation, contact_preference, created_at, updated_at) 
          VALUES ($1, 'Test', 'Donor', '1990-01-01', 30, 'Male', '9999999999', 'test@example.com', $2, 
                  'Test Address', 1, 1, 'CENTRE001', 'Centre', true, true, true, NOW(), NOW())
          ON CONFLICT (user_id) DO NOTHING;
        `, [user.id, user.blood_group_id]);
      }

      // Create blood collections with various expiry scenarios
      const { rows: donors } = await pool.query(`
        SELECT donor_id, blood_group_id FROM donors WHERE user_id IN (${testUsers.map(u => u.id).join(',')})
      `);

      for (const [index, donor] of donors.entries()) {
        const collectionId = 5000 + index;
        
        await pool.query(`
          INSERT INTO blood_collection (collection_id, donor_id, centre_id, bag_size, collected_amount, 
                                      lot_number, collection_date, donor_reaction, created_at) 
          VALUES ($1, $2, 'CENTRE001', '450ml', 450, $3, NOW() - INTERVAL '35 days', 'None', NOW())
          ON CONFLICT (collection_id) DO NOTHING;
        `, [collectionId, donor.donor_id, `LOT${collectionId}`]);

        // Create blood segregation entries with different expiry dates
        const components = ['RedBloodCells', 'Plasma', 'Platelets'];
        const expiryDays = [42, 365, 5]; // Different expiry periods for each component

        for (const [compIndex, component] of components.entries()) {
          const segregationId = collectionId * 10 + compIndex;
          const daysFromCollection = expiryDays[compIndex];
          
          await pool.query(`
            INSERT INTO blood_segregation (segregation_id, collection_id, component, volume_ml, units, 
                                         expiry_date, status, centre_id, segregated_at, updated_at) 
            VALUES ($1, $2, $3, 150, 1, (NOW() - INTERVAL '35 days') + INTERVAL '${daysFromCollection} days', 
                    'Available', 'CENTRE001', NOW(), NOW())
            ON CONFLICT (segregation_id) DO NOTHING;
          `, [segregationId, collectionId, component]);
        }
      }
    }

    console.log('✅ Mock data setup completed with existing schema');
  } catch (error) {
    console.error('❌ Error setting up mock data:', error);
  }
}

// -------------------- CORE ALERT FUNCTIONS --------------------
async function checkExpiringRareBlood() {
  console.log(`🔍 Starting rare blood expiry check at ${new Date().toISOString()}`);
  
  try {
    const query = `
      SELECT 
        bs.segregation_id,
        bs.collection_id,
        bs.component,
        bs.volume_ml,
        bs.units,
        bs.expiry_date,
        bs.centre_id,
        bg.group_name as blood_group_name,
        bg.is_rare,
        bc.collection_date,
        EXTRACT(days FROM (bs.expiry_date - NOW()))::integer as days_to_expiry,
        d.first_name,
        d.last_name,
        d.mobile_no
      FROM blood_segregation bs
      JOIN blood_collection bc ON bs.collection_id = bc.collection_id
      JOIN donors d ON bc.donor_id = d.donor_id
      JOIN blood_groups bg ON d.blood_group_id = bg.id
      WHERE bs.status = 'Available'
        AND bg.is_rare = true
        AND bs.expiry_date > NOW()
        AND bs.expiry_date <= NOW() + INTERVAL '7 days'
      ORDER BY bs.expiry_date ASC;
    `;

    const { rows: expiringUnits } = await pool.query(query);

    if (expiringUnits.length === 0) {
      console.log('✅ No expiring rare blood units found');
      return;
    }

    console.log(`🚨 Found ${expiringUnits.length} expiring rare blood units`);

    // Group alerts by priority
    const alertsByPriority = {
      CRITICAL: expiringUnits.filter(unit => unit.days_to_expiry <= ALERT_THRESHOLDS.CRITICAL),
      URGENT: expiringUnits.filter(unit => unit.days_to_expiry <= ALERT_THRESHOLDS.URGENT && unit.days_to_expiry > ALERT_THRESHOLDS.CRITICAL),
      WARNING: expiringUnits.filter(unit => unit.days_to_expiry <= ALERT_THRESHOLDS.WARNING && unit.days_to_expiry > ALERT_THRESHOLDS.URGENT)
    };

    // Process each priority level
    for (const [priority, units] of Object.entries(alertsByPriority)) {
      if (units.length === 0) continue;
      
      console.log(`📋 Processing ${units.length} ${priority} alerts`);
      await processAlertsByPriority(units, priority);
    }

    await logSystemActivity('rare_blood_check', `Processed ${expiringUnits.length} expiring units`);
    
  } catch (error) {
    console.error('❌ Error in checkExpiringRareBlood:', error);
    await logSystemActivity('rare_blood_check_error', error.message);
  }
}

async function processAlertsByPriority(units, priority) {
  for (const unit of units) {
    console.log(`🩸 ${priority} Alert: ${unit.blood_group_name} ${unit.component} (${unit.units} units) expires in ${unit.days_to_expiry} days`);
    
    // Find nearby hospitals and blood centres
    const recipients = await findAlertRecipients(unit.centre_id, unit.blood_group_name);
    
    if (recipients.length === 0) {
      console.log(`⚠️ No recipients found for ${unit.blood_group_name} ${unit.component}`);
      continue;
    }

    // Send alerts to recipients
    for (const recipient of recipients) {
      await sendAlert(recipient, unit, priority);
      await logNotification(unit.segregation_id, recipient.id, recipient.type, priority, 
        `${unit.blood_group_name} ${unit.component} expiring in ${unit.days_to_expiry} days`);
    }

    // For critical alerts, also notify blood bank management
    if (priority === 'CRITICAL') {
      await sendManagementAlert(unit);
      await notifyAdmins(unit, priority);
    }
  }
}

// -------------------- RECIPIENT SEARCH --------------------
async function findAlertRecipients(centreId, bloodGroup) {
  const recipients = [];

  try {
    // Get nearby blood centres that might need this blood
    const centreQuery = `
      SELECT centre_id, centre_name, 'centre' as type,
             'bloodbank@' || LOWER(REPLACE(centre_name, ' ', '')) || '.com' as email
      FROM centres 
      WHERE centre_id != $1
      ORDER BY centre_id
      LIMIT 3;
    `;
    
    const { rows: centres } = await pool.query(centreQuery, [centreId]);
    recipients.push(...centres.map(c => ({
      id: c.centre_id,
      name: c.centre_name,
      email: c.email,
      type: 'centre'
    })));

    // Add mock hospitals (since hospitals table doesn't exist in your schema)
    const mockHospitals = [
      { id: 'H001', name: 'Apollo Hospital Chennai', email: 'tswetha3188@gmail.com', type: 'hospital' },
      { id: 'H002', name: 'Fortis Malar Hospital', email: 'sreerahane@gmail.com', type: 'hospital' },
      { id: 'H003', name: 'AIIMS Chennai', email: 'bloodbank@aiims.edu', type: 'hospital' }
    ];

    recipients.push(...mockHospitals);

    console.log(`🏥 Found ${recipients.length} recipients for ${bloodGroup}`);
    return recipients;

  } catch (error) {
    console.error('Error finding alert recipients:', error);
    return [];
  }
}

// -------------------- NOTIFICATION FUNCTIONS --------------------
async function sendAlert(recipient, unit, priority) {
  const subject = `${priority} ALERT: Rare Blood ${unit.blood_group_name} Expiring`;
  const html = generateEmailTemplate(recipient, unit, priority);

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: recipient.email,
      cc: 'bloodbank@centre001.com',
      subject: subject,
      html: html
    });

    console.log(`📧 ${priority} alert sent to ${recipient.name} (${recipient.type})`);
  } catch (error) {
    console.error(`Failed to send email to ${recipient.name}:`, error);
  }
}

async function sendManagementAlert(unit) {
  const subject = `CRITICAL: Rare Blood Unit About to Expire`;
  const message = `
    URGENT ACTION REQUIRED:
    Blood Group: ${unit.blood_group_name}
    Component: ${unit.component}
    Units: ${unit.units}
    Volume: ${unit.volume_ml}ml
    Expires: ${unit.expiry_date.toDateString()}
    Days Left: ${unit.days_to_expiry}
    Centre: ${unit.centre_id}
    Donor: ${unit.first_name} ${unit.last_name}
    Contact: ${unit.mobile_no}
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'management@bloodcentre.com',
      subject: subject,
      text: message
    });
  } catch (error) {
    console.error('Failed to send management alert:', error);
  }
}

async function notifyAdmins(unit, priority) {
  try {
    // Get admins from the same centre
    const { rows: admins } = await pool.query(`
      SELECT admin_id, admin_name, email 
      FROM admins 
      WHERE centre_id = $1 OR centre_id IS NULL
    `, [unit.centre_id]);

    const message = `CRITICAL: Rare blood ${unit.blood_group_name} ${unit.component} expires in ${unit.days_to_expiry} day(s). Immediate action required!`;

    for (const admin of admins) {
      // Insert notification into your existing notifications table
      await pool.query(`
        INSERT INTO notifications (admin_id, message, is_read, created_at)
        VALUES ($1, $2, false, NOW())
      `, [admin.admin_id, message]);
    }

    console.log(`🔔 Notified ${admins.length} admins about critical expiry`);
  } catch (error) {
    console.error('Error notifying admins:', error);
  }
}

function generateEmailTemplate(recipient, unit, priority) {
  const urgencyColor = {
    'CRITICAL': '#ff4757',
    'URGENT': '#ff6348', 
    'WARNING': '#ffa502'
  };

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: ${urgencyColor[priority]}; color: white; padding: 20px; text-align: center;">
        <h1>${priority} ALERT</h1>
        <p>Rare Blood Component Expiring Soon</p>
      </div>
      
      <div style="padding: 20px; background-color: #f8f9fa;">
        <h2>Blood Component Details</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr style="border-bottom: 1px solid #ddd;"><td style="padding: 8px;"><strong>Blood Group:</strong></td><td style="padding: 8px;">${unit.blood_group_name}</td></tr>
          <tr style="border-bottom: 1px solid #ddd;"><td style="padding: 8px;"><strong>Component:</strong></td><td style="padding: 8px;">${unit.component}</td></tr>
          <tr style="border-bottom: 1px solid #ddd;"><td style="padding: 8px;"><strong>Volume:</strong></td><td style="padding: 8px;">${unit.volume_ml} ml</td></tr>
          <tr style="border-bottom: 1px solid #ddd;"><td style="padding: 8px;"><strong>Units Available:</strong></td><td style="padding: 8px;">${unit.units}</td></tr>
          <tr style="border-bottom: 1px solid #ddd;"><td style="padding: 8px;"><strong>Centre ID:</strong></td><td style="padding: 8px;">${unit.centre_id}</td></tr>
          <tr style="border-bottom: 1px solid #ddd;"><td style="padding: 8px;"><strong>Collection Date:</strong></td><td style="padding: 8px;">${unit.collection_date ? unit.collection_date.toDateString() : 'N/A'}</td></tr>
          <tr style="border-bottom: 1px solid #ddd;"><td style="padding: 8px;"><strong>Expiry Date:</strong></td><td style="padding: 8px;">${unit.expiry_date.toDateString()}</td></tr>
          <tr><td style="padding: 8px;"><strong>Days Remaining:</strong></td><td style="padding: 8px; color: ${urgencyColor[priority]}; font-weight: bold;">${unit.days_to_expiry} days</td></tr>
        </table>
        
        ${unit.first_name ? `
        <h3>Donor Information</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr style="border-bottom: 1px solid #ddd;"><td style="padding: 8px;"><strong>Donor Name:</strong></td><td style="padding: 8px;">${unit.first_name} ${unit.last_name}</td></tr>
          <tr><td style="padding: 8px;"><strong>Contact:</strong></td><td style="padding: 8px;">${unit.mobile_no}</td></tr>
        </table>
        ` : ''}
        
        <div style="margin-top: 20px; padding: 15px; background-color: #e3f2fd; border-left: 4px solid #2196f3;">
          <h3>Next Steps:</h3>
          <ul>
            <li>Contact the blood centre immediately if you need this unit</li>
            <li>Coordinate pickup/delivery arrangements</li>
            <li>Verify compatibility with your patient requirements</li>
            <li>Update your inventory system after transfer</li>
          </ul>
        </div>
        
        <div style="margin-top: 20px; text-align: center; background-color: #fff3cd; padding: 15px; border: 1px solid #ffeaa7;">
          <p><strong>Blood Centre Contact:</strong> +91-44-12345678</p>
          <p><strong>Emergency Line:</strong> +91-44-87654321</p>
          <p><strong>Email:</strong> bloodbank@centre001.com</p>
        </div>
      </div>
    </div>
  `;
}

// -------------------- LOGGING FUNCTIONS --------------------
async function logNotification(segregationId, recipientId, recipientType, priority, message) {
  try {
    // Log in existing notifications table
    await pool.query(`
      INSERT INTO notifications (message, is_read, created_at) 
      VALUES ($1, false, NOW())
    `, [`${priority}: ${message} - Sent to ${recipientType} ID: ${recipientId}`]);
  } catch (error) {
    console.error('Error logging notification:', error);
  }
}

async function logSystemActivity(activityType, details) {
  try {
    // Create a simple log entry (you can extend this based on your needs)
    console.log(`[${new Date().toISOString()}] ${activityType}: ${details}`);
  } catch (error) {
    console.error('Error logging system activity:', error);
  }
}

// -------------------- SCHEDULER --------------------
function startScheduledAlerts() {
  console.log('🚀 Starting rare blood alert scheduler');
  
  // Run every day at 8 AM IST
  cron.schedule('0 8 * * *', async () => {
    console.log('🕰️ Running scheduled rare blood expiry check');
    await checkExpiringRareBlood();
  }, {
    timezone: 'Asia/Kolkata'
  });

  // Run every 4 hours for critical alerts
  cron.schedule('0 */4 * * *', async () => {
    console.log('🚨 Running critical alerts check');
    const query = `
      SELECT COUNT(*) as critical_count
      FROM blood_segregation bs
      JOIN blood_collection bc ON bs.collection_id = bc.collection_id
      JOIN donors d ON bc.donor_id = d.donor_id
      JOIN blood_groups bg ON d.blood_group_id = bg.id
      WHERE bs.status = 'Available'
        AND bg.is_rare = true
        AND bs.expiry_date <= NOW() + INTERVAL '1 day'
        AND bs.expiry_date > NOW()
    `;
    
    const { rows } = await pool.query(query);
    if (rows[0].critical_count > 0) {
      console.log(`Found ${rows[0].critical_count} critical units, running check...`);
      await checkExpiringRareBlood();
    }
  }, {
    timezone: 'Asia/Kolkata'
  });

  console.log('✅ Scheduler started - Daily checks at 8 AM IST, Critical checks every 4 hours');
}

// -------------------- INVENTORY MANAGEMENT --------------------
async function updateInventoryAfterExpiry() {
  try {
    // Mark expired units as 'Expired' in blood_segregation
    const expiredQuery = `
      UPDATE blood_segregation 
      SET status = 'Expired', updated_at = NOW()
      WHERE status = 'Available' AND expiry_date < NOW()
      RETURNING segregation_id, component, centre_id;
    `;
    
    const { rows: expiredUnits } = await pool.query(expiredQuery);
    
    if (expiredUnits.length > 0) {
      console.log(`⚠️ Marked ${expiredUnits.length} units as expired`);
      
      // Log the expiry in blood_usage_log
      for (const unit of expiredUnits) {
        await pool.query(`
          INSERT INTO blood_usage_log (segregation_id, action, action_time, notes)
          VALUES ($1, 'Expired', NOW(), 'Automatically expired due to date')
        `, [unit.segregation_id]);
      }
      
      // Update blood_inventory counts
      await updateInventoryCounts();
    }
  } catch (error) {
    console.error('Error updating expired inventory:', error);
  }
}

async function updateInventoryCounts() {
  try {
    // Update inventory counts based on current available segregations
    await pool.query(`
      INSERT INTO blood_inventory (centre_id, blood_group_id, component, units_available, last_updated)
      SELECT 
        bs.centre_id,
        d.blood_group_id,
        bs.component,
        COUNT(*) as units_available,
        NOW()
      FROM blood_segregation bs
      JOIN blood_collection bc ON bs.collection_id = bc.collection_id
      JOIN donors d ON bc.donor_id = d.donor_id
      WHERE bs.status = 'Available'
      GROUP BY bs.centre_id, d.blood_group_id, bs.component
      ON CONFLICT (centre_id, blood_group_id, component) 
      DO UPDATE SET units_available = EXCLUDED.units_available, last_updated = NOW();
    `);
    
    console.log('✅ Inventory counts updated');
  } catch (error) {
    console.error('Error updating inventory counts:', error);
  }
}

// -------------------- MAIN EXECUTION --------------------
async function main() {
  try {
    console.log('🩸 Initializing Rare Blood Alert System');
    
    await setupMockData();
    
    // Run immediate check
    await checkExpiringRareBlood();
    
    // Update expired inventory
    await updateInventoryAfterExpiry();
    
    // Start scheduler
    if (process.env.NODE_ENV !== 'test') {
      startScheduledAlerts();
      
      // Also schedule inventory updates daily at midnight
      cron.schedule('0 0 * * *', async () => {
        console.log('🔄 Running daily inventory cleanup');
        await updateInventoryAfterExpiry();
      }, {
        timezone: 'Asia/Kolkata'
      });
      
      console.log('🔄 System running... Press Ctrl+C to stop');
      
      // Keep the process alive
      process.stdin.resume();
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

// Export for testing
module.exports = {
  checkExpiringRareBlood,
  findAlertRecipients,
  setupMockData,
  updateInventoryAfterExpiry,
  main
};

// Run if called directly
if (require.main === module) {
  main();
}