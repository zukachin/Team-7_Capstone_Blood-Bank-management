from langchain_community.llms import Ollama
from langchain.agents import create_sql_agent
from langchain_community.agent_toolkits import SQLDatabaseToolkit
from langchain_community.utilities import SQLDatabase
from sqlalchemy import create_engine

# 1. Connect to PostgreSQL
db_uri = "postgresql+psycopg2://postgres:12345678@localhost:5432/version 1"
db = SQLDatabase.from_uri(db_uri)

# 2. Use local Mistral with Ollama
llm = Ollama(model="mistral")

# 3. Create toolkit + agent
toolkit = SQLDatabaseToolkit(db=db, llm=llm)
agent_executor = create_sql_agent(llm=llm, toolkit=toolkit, verbose=False)

# 4. Ask a natural language question
response = agent_executor.invoke({"input": "How many donors are there in Chennai?"})
print(response["output"])
