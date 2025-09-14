from pydantic import BaseModel

# Request and response models
class ChatRequest(BaseModel):
    query: str
    thread_id: str 

class ChatResponse(BaseModel):
    response: str

# Define the expected response schema
class AgentChatResponse(BaseModel):
    answer: str