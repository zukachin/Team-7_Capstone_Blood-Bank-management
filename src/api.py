from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from model import ChatRequest, ChatResponse
from agent.chat_agent import AgentService
import config

# Create FastAPI app instance
app = FastAPI(title=config.fast_api["name"])

# Create Agent instance
agent = AgentService()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # or ["http://localhost:8000"]
    allow_credentials=True,
    allow_methods=["*"],      # <--- allow all HTTP methods (includes OPTIONS)
    allow_headers=["*"],      # <--- allow all headers
)
# Define the POST endpoint
@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """Handle chat query via agent."""
    reply = agent.ask(query=request.query, thread_id=request.thread_id)
    return ChatResponse(response=reply)
