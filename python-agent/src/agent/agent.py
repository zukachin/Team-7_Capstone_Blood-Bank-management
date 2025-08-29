import os
import streamlit as st
from dotenv import load_dotenv
from sqlalchemy import create_engine
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.utilities import SQLDatabase
from langchain.agents import create_sql_agent
from langchain.agents.agent_toolkits import SQLDatabaseToolkit

# Load env vars
load_dotenv()

st.set_page_config(page_title="Blood Bank Chatbot", page_icon="🩸", layout="wide")
st.title("🩸 Blood Bank Conversational Agent")

# --- Database connection (fixed, no sidebar UI) ---
DB_URI = "postgresql+psycopg2://postgres:12345678@localhost:5432/version 1"
engine = create_engine(DB_URI)
db = SQLDatabase(engine)

# --- Gemini LLM ---
llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",  # use flash for speed/quota efficiency
    google_api_key=os.getenv("GOOGLE_API_KEY"),
    temperature=0
)

# --- SQL Agent ---
toolkit = SQLDatabaseToolkit(db=db, llm=llm)
agent_executor = create_sql_agent(
    llm=llm,
    toolkit=toolkit,
    verbose=True,
    agent_type="openai-tools"
)

# --- Streamlit Chat UI ---
if "messages" not in st.session_state:
    st.session_state["messages"] = []

# Display chat history
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

# Input
if user_query := st.chat_input("Ask me about donors, blood inventory, requests..."):
    # Show user query
    st.session_state.messages.append({"role": "user", "content": user_query})
    with st.chat_message("user"):
        st.markdown(user_query)

    # Run query through agent
    with st.chat_message("assistant"):
        with st.spinner("Thinking..."):
            try:
                response = agent_executor.run(user_query)
                st.markdown(response)
                st.session_state.messages.append({"role": "assistant", "content": response})
            except Exception as e:
                st.error(f"❌ Error: {e}")
