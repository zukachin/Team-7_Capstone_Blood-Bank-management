from langchain_community.llms import Ollama
from langchain.prompts import PromptTemplate
import psycopg2

# Connect to PostgreSQL
conn = psycopg2.connect(
    dbname="version 1",
    user="postgres",
    password="12345678",
    host="localhost",
    port="5432"
)
cursor = conn.cursor()

# Initialize Ollama LLM
llm = Ollama(model="mistral")

# Prompt template: generate SQL internally
prompt = PromptTemplate.from_template("""
You are blood bank assistant, you need to answer the questions,
you can take the information from the database and provide the results accurately.

Question: {question}
""")

def ask_db(question):
    formatted_prompt = prompt.format(question=question)
    response = llm.invoke(formatted_prompt)
    return response

print(ask_db("How many people in chennai are registered as blood donors?"))