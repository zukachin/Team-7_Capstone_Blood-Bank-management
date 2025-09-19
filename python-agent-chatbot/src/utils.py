from datetime import datetime
from contextlib import contextmanager
import logging

# Configure logging once here
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | [%(name)s] %(message)s",
    handlers=[
        logging.FileHandler("agent.log", encoding="utf-8"),
        logging.StreamHandler()
    ]
)

@contextmanager
def log_duration(task_name: str, logger: logging.Logger):
    """
    Context manager to log the start, end, and duration of a task.
    Example:
        with log_duration("Agent Invocation", logger):
            agent.invoke(...)
    """
    start = datetime.now()
    logger.info(f"{task_name} - Start: {start.strftime('%Y-%m-%d %H:%M:%S')}")
    try:
        yield
    finally:
        end = datetime.now()
        duration = (end - start).total_seconds()
        logger.info(f"{task_name} - End: {end.strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info(f"{task_name} - Duration: {duration:.2f} seconds")
