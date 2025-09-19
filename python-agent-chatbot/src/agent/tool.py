# tool.py
import requests

BASE_LOCATIONS = "http://localhost:4000/api/locations"
BASE_CENTRES = "http://localhost:4001/api/centres/public/by-district"
BASE_CAMPS = "http://localhost:4001/api/camps/public/by-district"

def get_state_id(state_name):
    try:
        response = requests.get(f"{BASE_LOCATIONS}/states")
        response.raise_for_status()
        states = response.json().get("states", [])
        for state in states:
            if state_name.lower() == state["state_name"].lower():
                return state["state_id"]
    except requests.RequestException as e:
        print(f"Error fetching states: {e}")
    return None

def get_district_id(state_id, district_name):
    try:
        response = requests.get(f"{BASE_LOCATIONS}/states/{state_id}/districts")
        response.raise_for_status()
        districts = response.json().get("districts", [])
        for district in districts:
            if district_name.lower() == district["district_name"].lower():
                return district["district_id"]
    except requests.RequestException as e:
        print(f"Error fetching districts: {e}")
    return None

def get_centres(district_id):
    try:
        response = requests.get(f"{BASE_CENTRES}?district_id={district_id}")
        response.raise_for_status()
        centres = response.json().get("centres", [])
        if not centres:
            return "No blood donation centers found."
        output = f"There are {len(centres)} blood donation centers:\n"
        for idx, c in enumerate(centres, start=1):
            output += f"{idx}. {c['centre_name']} - {c['address']}\n"
        return output.strip()
    except requests.RequestException as e:
        return f"Error fetching centers: {e}"

def get_camps(district_id):
    try:
        response = requests.get(f"{BASE_CAMPS}?district_id={district_id}")
        response.raise_for_status()
        camps = response.json().get("camps", [])
        if not camps:
            return "No blood donation camps found."
        output = f"There are {len(camps)} blood donation camps:\n"
        for idx, c in enumerate(camps, start=1):
            output += f"{idx}. {c['camp_name']} - {c['address']} (Date: {c.get('date', 'N/A')})\n"
        return output.strip()
    except requests.RequestException as e:
        return f"Error fetching camps: {e}"

def run_tool():
    print("=== Blood Donation Locator Tool ===")
    city_name = input("Enter city/district name: ")
    
    # Optional: Try all states to find district
    try:
        states_response = requests.get(f"{BASE_LOCATIONS}/states")
        states_response.raise_for_status()
        states = states_response.json().get("states", [])
    except requests.RequestException as e:
        print(f"Error fetching states: {e}")
        return
    
    district_id = None
    for state in states:
        state_id = state["state_id"]
        try:
            districts_response = requests.get(f"{BASE_LOCATIONS}/states/{state_id}/districts")
            districts_response.raise_for_status()
            districts = districts_response.json().get("districts", [])
            for district in districts:
                if city_name.lower() == district["district_name"].lower():
                    district_id = district["district_id"]
                    break
            if district_id:
                break
        except requests.RequestException as e:
            continue
    
    if not district_id:
        print(f"District/City '{city_name}' not found.")
        return
    
    print("\n" + get_centres(district_id))
    print("\n" + get_camps(district_id))

if __name__ == "__main__":
    run_tool()
