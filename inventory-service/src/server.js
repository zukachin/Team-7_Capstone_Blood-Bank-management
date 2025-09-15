const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();


const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const centreRoutes = require('./routes/centreRoutes');
const locationRoutes= require('./routes/locationRoutes');
const bloodGroupRoutes=require('./routes/bloodGroupRoutes');
const apptRoutes = require('./routes/appointmentsRoutes');
const userApptRoutes = require('./routes/userAppointmentRoutes');
const campsRoutes = require('./routes/campRoutes');

const donorRoutes = require("./routes/donorRoutes");
const counselingRoutes = require("./routes/counselingRoutes");

const collectionsRoutes = require('./routes/collections');
const testingRoutes = require('./routes/testing');
const { startNotificationDispatcher } = require('./jobs/notificationDispatcher');
const segregationRoutes = require('./routes/segregation');
const inventoryRoutes = require('./routes/inventory');



const publicinventoryRoutes = require('./routes/inventoryRoutes');




// Start jobs
startNotificationDispatcher();

// require jobs so they start running
require('./jobs/appointmentRemainderJob');
require('./jobs/campReminder')

const app = express();
app.use(cors());
app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/centres', centreRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/appointments', apptRoutes);
app.use('/api/userappointments', userApptRoutes); 
app.use("/api", bloodGroupRoutes);
app.use('/api/camps', campsRoutes);
app.use("/api/donors", donorRoutes);
app.use("/api/counseling", counselingRoutes);

app.use(collectionsRoutes);
app.use(testingRoutes);

app.use(segregationRoutes);
app.use(inventoryRoutes)

app.use('/api/inventory', publicinventoryRoutes);



app.get('/', (req, res) => res.json({ message: 'Inventory service running' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Inventory service listening on port ${PORT}`);
});
