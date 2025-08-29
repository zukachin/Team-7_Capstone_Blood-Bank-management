import streamlit as st
from langchain_community.llms import Ollama
from langchain.agents import create_sql_agent
from langchain_community.agent_toolkits import SQLDatabaseToolkit
from langchain_community.utilities import SQLDatabase
from sqlalchemy import create_engine

# --------------------------
# DB + LLM Setup
# --------------------------
db_uri = "postgresql+psycopg2://postgres:12345678@localhost:5432/version 1"  
db = SQLDatabase.from_uri(db_uri)

# Use local mistral model via Ollama
llm = Ollama(model="mistral")

toolkit = SQLDatabaseToolkit(db=db, llm=llm)
agent_executor = create_sql_agent(llm=llm, toolkit=toolkit, verbose=False)

# --------------------------
# Streamlit UI
# --------------------------
st.set_page_config(page_title="DB Chat with Mistral", page_icon="🗄️", layout="centered")

st.title("🗄️ Chat with your PostgreSQL DB")
st.markdown("Ask questions in natural language and let **Mistral + LangChain** fetch results!")

# Chat history
if "messages" not in st.session_state:
    st.session_state["messages"] = []

# Input
user_input = st.chat_input("Ask me something about the database...")

if user_input:
    # Display user message
    st.session_state["messages"].append({"role": "user", "content": user_input})

    with st.spinner("Thinking..."):
        try:
            response = agent_executor.invoke({"input": user_input})
            answer = response["output"]
        except Exception as e:
            answer = f"❌ Error: {str(e)}"

    st.session_state["messages"].append({"role": "assistant", "content": answer})

# Display messages
for msg in st.session_state["messages"]:
    if msg["role"] == "user":
        st.chat_message("user").write(msg["content"])
    else:
        st.chat_message("assistant").write(msg["content"])
