import re
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta

@dataclass
class QueryResult:
    sql: str
    params: Dict
    description: str
    result_type: str

class BloodBankQueryAgent:
    def __init__(self):
        # Blood group mappings with variations
        self.blood_groups = {
            'a+': ['a+', 'a positive', 'a pos', 'type a+'],
            'a-': ['a-', 'a negative', 'a neg', 'type a-'],
            'b+': ['b+', 'b positive', 'b pos', 'type b+'],
            'b-': ['b-', 'b negative', 'b neg', 'type b-'],
            'ab+': ['ab+', 'ab positive', 'ab pos', 'type ab+'],
            'ab-': ['ab-', 'ab negative', 'ab neg', 'type ab-'],
            'o+': ['o+', 'o positive', 'o pos', 'type o+'],
            'o-': ['o-', 'o negative', 'o neg', 'type o-']
        }
        
        # Component types
        self.components = {
            'whole blood': ['whole blood', 'whole', 'blood'],
            'plasma': ['plasma'],
            'platelets': ['platelets', 'platelet'],
            'red blood cells': ['rbc', 'red blood cells', 'red cells'],
            'white blood cells': ['wbc', 'white blood cells', 'white cells']
        }
        
        # Common location names (you can expand this based on your data)
        self.locations = {
            'chennai': ['chennai', 'madras'],
            'bangalore': ['bangalore', 'bengaluru'],
            'mumbai': ['mumbai', 'bombay'],
            'delhi': ['delhi', 'new delhi']
        }
        
        # Query patterns
        self.query_patterns = {
            'blood_availability': [
                r'how many.*?blood.*?available',
                r'.*?blood.*?stock',
                r'availability.*?blood',
                r'units.*?available',
                r'blood.*?inventory'
            ],
            'center_info': [
                r'.*?centers?.*?in',
                r'blood banks?.*?in',
                r'centres?.*?location',
                r'where.*?donate',
                r'nearest.*?center'
            ],
            'camp_info': [
                r'.*?camps?.*?in',
                r'blood.*?camps?',
                r'donation.*?camps?',
                r'upcoming.*?camps?',
                r'camp.*?schedule'
            ],
            'donor_stats': [
                r'how many.*?donors?',
                r'donor.*?count',
                r'total.*?donors?',
                r'registered.*?donors?'
            ],
            'appointment_info': [
                r'.*?appointments?',
                r'booking.*?available',
                r'schedule.*?donation',
                r'appointment.*?slots'
            ]
        }

    def parse_query(self, user_query: str) -> QueryResult:
        """Parse user query and return appropriate SQL"""
        query_lower = user_query.lower().strip()
        
        # Determine query type
        query_type = self._identify_query_type(query_lower)
        
        # Extract entities (blood group, location, etc.)
        entities = self._extract_entities(query_lower)
        
        # Generate SQL based on query type and entities
        return self._generate_sql(query_type, entities, query_lower)
    
    def _identify_query_type(self, query: str) -> str:
        """Identify the type of query based on patterns"""
        for query_type, patterns in self.query_patterns.items():
            for pattern in patterns:
                if re.search(pattern, query):
                    return query_type
        return 'general'
    
    def _extract_entities(self, query: str) -> Dict:
        """Extract blood group, location, component, etc. from query"""
        entities = {
            'blood_group': None,
            'location': None,
            'component': None,
            'time_period': None
        }
        
        # Extract blood group
        for standard_group, variations in self.blood_groups.items():
            for variation in variations:
                if variation in query:
                    entities['blood_group'] = standard_group
                    break
            if entities['blood_group']:
                break
        
        # Extract location
        for location, variations in self.locations.items():
            for variation in variations:
                if variation in query:
                    entities['location'] = location
                    break
            if entities['location']:
                break
        
        # Extract component
        for component, variations in self.components.items():
            for variation in variations:
                if variation in query and variation != 'blood':  # Avoid generic 'blood'
                    entities['component'] = component
                    break
            if entities['component']:
                break
        
        # Extract time references
        if any(word in query for word in ['today', 'this week', 'this month', 'upcoming']):
            entities['time_period'] = self._parse_time_period(query)
        
        return entities
    
    def _parse_time_period(self, query: str) -> Dict:
        """Parse time-related filters"""
        if 'today' in query:
            return {'type': 'today', 'date': datetime.now().date()}
        elif 'this week' in query:
            return {'type': 'this_week', 'start': datetime.now().date()}
        elif 'this month' in query:
            return {'type': 'this_month', 'start': datetime.now().replace(day=1).date()}
        elif 'upcoming' in query:
            return {'type': 'upcoming', 'start': datetime.now().date()}
        return None
    
    def _generate_sql(self, query_type: str, entities: Dict, original_query: str) -> QueryResult:
        """Generate SQL query based on type and entities"""
        
        if query_type == 'blood_availability':
            return self._build_blood_availability_query(entities)
        elif query_type == 'center_info':
            return self._build_center_info_query(entities)
        elif query_type == 'camp_info':
            return self._build_camp_info_query(entities)
        elif query_type == 'donor_stats':
            return self._build_donor_stats_query(entities)
        elif query_type == 'appointment_info':
            return self._build_appointment_info_query(entities)
        else:
            return self._build_general_query(entities, original_query)
    
    def _build_blood_availability_query(self, entities: Dict) -> QueryResult:
        """Build blood availability query"""
        base_query = """
        SELECT 
            bg.group_name as blood_group,
            bi.component,
            SUM(bi.units_available) as total_units,
            c.centre_name,
            d.district_name,
            s.state_name,
            bi.last_updated
        FROM blood_inventory bi
        JOIN blood_groups bg ON bi.blood_group_id = bg.id
        JOIN centres c ON bi.centre_id = c.centre_code
        JOIN districts d ON c.district_id = d.district_id
        JOIN states s ON d.state_id = s.state_id
        WHERE bi.units_available > 0
        """
        
        conditions = []
        params = {}
        
        if entities['blood_group']:
            conditions.append("LOWER(bg.group_name) = %(blood_group)s")
            params['blood_group'] = entities['blood_group']
        
        if entities['location']:
            conditions.append("(LOWER(d.district_name) LIKE %(location)s OR LOWER(c.centre_name) LIKE %(location)s)")
            params['location'] = f"%{entities['location']}%"
        
        if entities['component']:
            conditions.append("LOWER(bi.component::text) LIKE %(component)s")
            params['component'] = f"%{entities['component']}%"
        
        if conditions:
            base_query += " AND " + " AND ".join(conditions)
        
        base_query += """
        GROUP BY bg.group_name, bi.component, c.centre_name, d.district_name, s.state_name, bi.last_updated
        ORDER BY total_units DESC
        """
        
        description = f"Blood availability"
        if entities['blood_group']:
            description += f" for {entities['blood_group'].upper()} blood"
        if entities['location']:
            description += f" in {entities['location'].title()}"
        if entities['component']:
            description += f" ({entities['component']})"
        
        return QueryResult(base_query, params, description, "blood_availability")
    
    def _build_center_info_query(self, entities: Dict) -> QueryResult:
        """Build center information query"""
        base_query = """
        SELECT 
            c.centre_name,
            c.centre_code,
            c.address,
            d.district_name,
            s.state_name,
            COUNT(DISTINCT bi.blood_group_id) as blood_types_available,
            SUM(bi.units_available) as total_units
        FROM centres c
        JOIN districts d ON c.district_id = d.district_id
        JOIN states s ON d.state_id = s.state_id
        LEFT JOIN blood_inventory bi ON c.centre_code = bi.centre_id AND bi.units_available > 0
        """
        
        conditions = []
        params = {}
        
        if entities['location']:
            conditions.append("(LOWER(d.district_name) LIKE %(location)s OR LOWER(c.centre_name) LIKE %(location)s OR LOWER(s.state_name) LIKE %(location)s)")
            params['location'] = f"%{entities['location']}%"
        
        if conditions:
            base_query += " WHERE " + " AND ".join(conditions)
        
        base_query += """
        GROUP BY c.centre_name, c.centre_code, c.address, d.district_name, s.state_name
        ORDER BY total_units DESC NULLS LAST
        """
        
        description = f"Blood centers/centres"
        if entities['location']:
            description += f" in {entities['location'].title()}"
        
        return QueryResult(base_query, params, description, "center_info")
    
    def _build_camp_info_query(self, entities: Dict) -> QueryResult:
        """Build camp information query"""
        base_query = """
        SELECT 
            ca.camp_name,
            ca.location,
            ca.camp_date,
            ca.camp_time,
            ca.status,
            co.organization_name,
            co.contact_person,
            co.phone,
            c.centre_name,
            d.district_name,
            s.state_name
        FROM camps ca
        JOIN camp_organizers co ON ca.organizer_id = co.organizer_id
        JOIN centres c ON ca.centre_id = c.centre_id
        JOIN districts d ON ca.district_id = d.district_id
        JOIN states s ON ca.state_id = s.state_id
        """
        
        conditions = []
        params = {}
        
        if entities['location']:
            conditions.append("(LOWER(d.district_name) LIKE %(location)s OR LOWER(ca.location) LIKE %(location)s OR LOWER(s.state_name) LIKE %(location)s)")
            params['location'] = f"%{entities['location']}%"
        
        if entities['time_period']:
            if entities['time_period']['type'] == 'upcoming':
                conditions.append("ca.camp_date >= CURRENT_DATE")
            elif entities['time_period']['type'] == 'today':
                conditions.append("ca.camp_date = CURRENT_DATE")
            elif entities['time_period']['type'] == 'this_week':
                conditions.append("ca.camp_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'")
        
        if conditions:
            base_query += " WHERE " + " AND ".join(conditions)
        
        base_query += " ORDER BY ca.camp_date ASC"
        
        description = f"Blood donation camps"
        if entities['location']:
            description += f" in {entities['location'].title()}"
        if entities['time_period']:
            description += f" ({entities['time_period']['type'].replace('_', ' ')})"
        
        return QueryResult(base_query, params, description, "camp_info")
    
    def _build_donor_stats_query(self, entities: Dict) -> QueryResult:
        """Build donor statistics query"""
        base_query = """
        SELECT 
            bg.group_name as blood_group,
            d.gender,
            COUNT(*) as donor_count,
            AVG(d.age) as avg_age,
            dt.district_name,
            st.state_name
        FROM donors d
        JOIN blood_groups bg ON d.blood_group_id = bg.id
        JOIN districts dt ON d.district_id = dt.district_id
        JOIN states st ON d.state_id = st.state_id
        """
        
        conditions = []
        params = {}
        
        if entities['blood_group']:
            conditions.append("LOWER(bg.group_name) = %(blood_group)s")
            params['blood_group'] = entities['blood_group']
        
        if entities['location']:
            conditions.append("(LOWER(dt.district_name) LIKE %(location)s OR LOWER(st.state_name) LIKE %(location)s)")
            params['location'] = f"%{entities['location']}%"
        
        if conditions:
            base_query += " WHERE " + " AND ".join(conditions)
        
        base_query += """
        GROUP BY bg.group_name, d.gender, dt.district_name, st.state_name
        ORDER BY donor_count DESC
        """
        
        description = f"Donor statistics"
        if entities['blood_group']:
            description += f" for {entities['blood_group'].upper()} blood"
        if entities['location']:
            description += f" in {entities['location'].title()}"
        
        return QueryResult(base_query, params, description, "donor_stats")
    
    def _build_appointment_info_query(self, entities: Dict) -> QueryResult:
        """Build appointment information query"""
        base_query = """
        SELECT 
            a.appointment_date,
            a.appointment_time,
            a.status,
            COUNT(*) as appointment_count,
            c.centre_name,
            d.district_name
        FROM appointments a
        JOIN centres c ON a.centre_id = c.centre_code
        JOIN districts d ON a.district_id = d.district_id
        """
        
        conditions = []
        params = {}
        
        if entities['location']:
            conditions.append("(LOWER(d.district_name) LIKE %(location)s OR LOWER(c.centre_name) LIKE %(location)s)")
            params['location'] = f"%{entities['location']}%"
        
        if entities['time_period']:
            if entities['time_period']['type'] == 'upcoming':
                conditions.append("a.appointment_date >= CURRENT_DATE")
            elif entities['time_period']['type'] == 'today':
                conditions.append("a.appointment_date = CURRENT_DATE")
        
        if conditions:
            base_query += " WHERE " + " AND ".join(conditions)
        
        base_query += """
        GROUP BY a.appointment_date, a.appointment_time, a.status, c.centre_name, d.district_name
        ORDER BY a.appointment_date, a.appointment_time
        """
        
        description = f"Appointment information"
        if entities['location']:
            description += f" in {entities['location'].title()}"
        if entities['time_period']:
            description += f" ({entities['time_period']['type'].replace('_', ' ')})"
        
        return QueryResult(base_query, params, description, "appointment_info")
    
    def _build_general_query(self, entities: Dict, original_query: str) -> QueryResult:
        """Build a general query when pattern doesn't match"""
        # Default to blood availability if blood group mentioned
        if entities['blood_group']:
            return self._build_blood_availability_query(entities)
        
        # Default to center info if location mentioned
        if entities['location']:
            return self._build_center_info_query(entities)
        
        # Fallback general query
        base_query = """
        SELECT 
            'Total Blood Units' as metric,
            SUM(bi.units_available) as value,
            'units' as unit
        FROM blood_inventory bi
        WHERE bi.units_available > 0
        """
        
        return QueryResult(base_query, {}, "General blood bank statistics", "general")

# Usage Example
def main():
    agent = BloodBankQueryAgent()
    
    # Test queries
    test_queries = [
        "How many O+ bloods are available?",
        "How many AB+ bloods are available in Chennai?",
        "Show me blood centers in Bangalore",
        "Upcoming blood camps in Mumbai",
        "How many donors do we have?",
        "Appointments available today in Delhi",
        "Plasma availability in Tamil Nadu",
        "Blood donation camps this week"
    ]
    
    print("🩸 Blood Bank Query Agent - Test Results\n")
    print("="*60)
    
    for query in test_queries:
        print(f"\n🔍 Query: {query}")
        result = agent.parse_query(query)
        print(f"📋 Description: {result.description}")
        print(f"🔧 Result Type: {result.result_type}")
        print(f"📊 Parameters: {result.params}")
        print(f"🗃️ SQL Preview:")
        # Show first few lines of SQL
        sql_lines = result.sql.strip().split('\n')[:5]
        for line in sql_lines:
            print(f"    {line.strip()}")
        if len(result.sql.strip().split('\n')) > 5:
            print("    ...")
        print("-" * 40)

if __name__ == "__main__":
    main()