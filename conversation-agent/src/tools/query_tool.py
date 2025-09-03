import streamlit as st
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# -----------------------------
# Database connection
# -----------------------------
# Replace DB name without spaces
db_uri = "postgresql+psycopg2://postgres:12345678@localhost:5432/version 1"
engine = create_engine(db_uri)

# -----------------------------
# Lambda / function for SQL generation
# -----------------------------
def build_query(table, filters=None, columns="*"):
    """
    Generate SQL query from table and filters dictionary.
    Numeric values or expressions are passed as-is, strings are quoted.
    """
    sql = f"SELECT {columns} FROM {table}"
    if filters and isinstance(filters, dict) and filters:
        conditions = []
        for k, v in filters.items():
            # If value is a string and does NOT start with a comparison operator
            if isinstance(v, str) and not re.match(r"^[<>!=]", v):
                conditions.append(f"{k}='{v}'")
            else:
                conditions.append(f"{k} {v}" if isinstance(v, str) else f"{k}={v}")
        sql += " WHERE " + " AND ".join(conditions)
    return sql

# -----------------------------
# Streamlit UI
# -----------------------------
st.set_page_config(page_title="🩸 Blood Bank Chatbot", layout="centered")
st.title("🩸 Blood Bank Management Chatbot")

user_query = st.text_input(
    "Ask me about donors, blood groups, availability, etc.", 
    placeholder="Example: Show me all O+ donors in Chennai"
)

if st.button("🔍 Search Database"):
    if not user_query.strip():
        st.warning("⚠️ Please enter a query.")
    else:
        with st.spinner("Searching database..."):
            try:
                # -----------------------------
                # Simple keyword mapping
                # -----------------------------
                filters = {}
                table = "donors"  # default table

                # Map blood groups (add more if needed)
                if "O+" in user_query.upper():
                    filters["blood_group_id"] = 1
                elif "A+" in user_query.upper():
                    filters["blood_group_id"] = 2
                elif "B+" in user_query.upper():
                    filters["blood_group_id"] = 3
                elif "AB+" in user_query.upper():
                    filters["blood_group_id"] = 4

                # Map locations / states
                if "CHENNAI" in user_query.upper():
                    filters["state"] = "Tamil Nadu"

                # Example: Age filter
                import re
                age_match = re.search(r"above (\d+)", user_query.lower())
                if age_match:
                    filters["age"] = f"> {age_match.group(1)}"

                # Generate SQL query
                sql_query = build_query(table, filters)
                st.write(f"**Generated SQL:** `{sql_query}`")  # optional for debugging

                # Execute query
                with engine.connect() as conn:
                    result = conn.execute(text(sql_query))
                    rows = result.fetchall()

                # Display results
                if rows:
                    st.success("✅ Query complete!")
                    st.write("**Results:**")
                    for row in rows:
                        st.write(dict(row._mapping))  # safe conversion
                else:
                    st.info("No records found for your query.")

            except Exception as e:
                st.error(f"❌ Failed: {e}")
