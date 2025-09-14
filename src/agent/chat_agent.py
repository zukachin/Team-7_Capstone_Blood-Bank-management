from typing import List, Dict

from langchain.chat_models import init_chat_model
from langchain_core.messages import HumanMessage, BaseMessage
from langgraph.prebuilt import create_react_agent

from agent.tool import get_weather
from model import AgentChatResponse
import agent.prompt as chat_prompt 
from utils import log_duration, logging
import config

class AgentService:
    """Encapsulates the agent logic and logging in a class."""

    def __init__(self):
        # Initialize chat model and agent once
        self.logger = logging.getLogger(config.chat_agent["name"])

        self.model = init_chat_model(config.chat_agent["model"], model_provider=config.chat_agent["model_provider"])
        self.prompt = chat_prompt

        self.agent = create_react_agent(
            model=self.model,
            tools=[get_weather],
            response_format=AgentChatResponse,
            prompt= self.prompt.system_prompt
        )
        self.logger.info("Agent Inilized")

    def ask(self, query: str, thread_id: str = "abc123") -> str:
        """
        Send a message to the agent and return the final response string.
        """
        input_messages: List[BaseMessage] = [HumanMessage(content=query)]
        config: Dict[str, object] = {"configurable": {"thread_id": thread_id}}

        self.logger.info(f"Input Messages: {query}, thread_id: {thread_id}")

        with log_duration("Agent Invocation", logging=self.logger):
            response = self.agent.invoke({"messages": input_messages}, config=config)

        return response["messages"][-1].content
