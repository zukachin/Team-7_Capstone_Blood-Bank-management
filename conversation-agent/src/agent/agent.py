import streamlit as st
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import os
import re

# Gemini API
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()

# -----------------------------
# DB connection
# -----------------------------
db_uri = "postgresql+psycopg2://postgres:12345678@localhost:5432/version 1"
engine = create_engine(db_uri)

# -----------------------------
# Initialize Gemini (LLM)
# -----------------------------
llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    google_api_key=os.getenv("GOOGLE_API_KEY"),
    temperature=0.1
)

# -----------------------------
# SQL generation function
# -----------------------------
def build_query(table, filters=None, columns="*"):
    sql = f"SELECT {columns} FROM {table}"
    if filters and isinstance(filters, dict) and filters:
        conditions = []
        for k, v in filters.items():
            # Numeric comparisons
            if isinstance(v, str) and re.match(r"^[<>!=]", v):
                conditions.append(f"{k} {v}")
            # Booleans
            elif isinstance(v, bool):
                conditions.append(f"{k} = {str(v).upper()}")
            # Strings
            else:
                conditions.append(f"{k}='{v}'")
        sql += " WHERE " + " AND ".join(conditions)
    return sql

# -----------------------------
# Streamlit UI
# -----------------------------
st.set_page_config(page_title="🩸 Blood Bank Chatbot", layout="centered")
st.title("🩸 Blood Bank Management Chatbot - Conversational Output")

user_query = st.text_input(
    "Ask me about donors, blood groups, camps, or blood availability.",
    placeholder="Example: Show me all O+ donors in Chennai above 25"
)

if st.button("🔍 Get Answer"):
    if not user_query.strip():
        st.warning("⚠️ Please enter a query.")
    else:
        with st.spinner("Processing..."):
            try:
                # -----------------------------
                # Map keywords to filters
                # -----------------------------
                filters = {}
                table = "donors"  # default table

                # Blood group mapping
                blood_map = {"O+": 1, "A+": 2, "B+": 3, "AB+": 4}
                for bg, bg_id in blood_map.items():
                    if bg in user_query.upper():
                        filters["blood_group_id"] = bg_id

                # Location mapping
                if "CHENNAI" in user_query.upper():
                    filters["state"] = "Tamil Nadu"

                # Age
                age_match = re.search(r"above (\d+)", user_query.lower())
                if age_match:
                    filters["age"] = f"> {age_match.group(1)}"

                # Donated previously / willing for future donation
                if "donated previously" in user_query.lower():
                    filters["donated_previously"] = True
                if "willing future donation" in user_query.lower():
                    filters["willing_future_donation"] = True

                # -----------------------------
                # Generate SQL
                # -----------------------------
                sql_query = build_query(table, filters)
                st.write(f"**Generated SQL (for debug):** `{sql_query}`")

                # -----------------------------
                # Execute SQL
                # -----------------------------
                with engine.connect() as conn:
                    result = conn.execute(text(sql_query))
                    rows = result.fetchall()

                if rows:
                    data = [dict(row._mapping) for row in rows]

                    # -----------------------------
                    # Convert data to natural language
                    # -----------------------------
                    prompt = f"""
                    I have the following blood bank data:
                    {data}
                    Show only the data that user asked for.
                    Never reveal their sensitive information.
                    Please summarize it in a simple, conversational style, as if explaining to a person.
                    Format the output with clear bullet points for easy reading.
                    """
                    natural_response = llm.predict(prompt)

                    st.success("✅ Query complete!")
                    st.markdown("**Natural Language Answer:**")
                    st.write(natural_response)

                else:
                    st.info("No records found for your query.")

            except Exception as e:
                st.error(f"❌ Failed: {e}")

