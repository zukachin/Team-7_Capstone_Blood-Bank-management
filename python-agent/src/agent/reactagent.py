from langchain_community.llms import Ollama
from langchain.agents import create_react_agent, AgentExecutor
from langchain_core.prompts import PromptTemplate
from langchain_community.utilities import SQLDatabase
from langchain.tools import Tool

# 1. Connect to PostgreSQL
db = SQLDatabase.from_uri("postgresql+psycopg2://postgres:12345678@localhost:5432/version 1")

# 2. Use local Mistral
llm = Ollama(model="mistral:7b-instruct")

# 3. Define tool for querying the DB
def run_query(query: str) -> str:
    """Execute a raw SQL query and return results as string"""
    try:
        result = db.run(query)
        return str(result)
    except Exception as e:
        return f"Error: {e}"

query_tool = Tool(
    name="DatabaseQuery",
    func=run_query,
    description="Run SQL queries on the donors database to answer questions."
)

# 4. Define correct ReAct system prompt
prompt = PromptTemplate.from_template("""
You are a helpful assistant that answers natural language questions using the database.
You have access to the following tools:
{tools}

Use the following format:

Question: the input question you must answer
Thought: think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Final Answer: the answer to the original question, in natural language

Begin!

Question: {input}
{agent_scratchpad}
""")

# 5. Create ReAct agent
agent = create_react_agent(llm=llm, tools=[query_tool], prompt=prompt)

# 6. Wrap in executor
agent_executor = AgentExecutor(agent=agent, tools=[query_tool], verbose=False)

# 7. Ask a question
query = "How many donors are there in Chennai?"
response = agent_executor.invoke({"input": query})

print("\nQ:", query)
print("A:", response["output"])
