from langchain_google_genai import HarmBlockThreshold,HarmCategory
import os
from dotenv import load_dotenv


# Initialize LangChain's GoogleGenerativeAI wrapper for use with tools
agent = {
    "model": "gemini-1.5-flash",
    "google_api_key": os.getenv("GOOGLE_API_KEY"),
    "temperature": 0.1,
    "safety_settings": {
        HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
    }
}