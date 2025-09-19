import os
chat_agent = {
    "name": "AgentService",
    "model": "gemini-2.5-flash",
    "model_provider": "google_genai"
}
fast_api ={
    "name":"LangChain Chatbot API",
    "host": "0.0.0.0",
    "port": 8000
}   
postgres ={
    "PG_HOST":"localhost",
    "PG_PORT":"5432",
    "PG_USER":"postgres",
    "PG_PASSWORD":os.getenv("PG_PASSWORD"),
    "PG_DATABASE": "blood_bank_central_renga_updated",
}
