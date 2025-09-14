from datetime import datetime
from contextlib import contextmanager
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(levelname)s:     [%(name)s]  %(message)s'
)

@contextmanager
def log_duration(task_name: str, logging):
    start = datetime.now()
    logging.info(f"{task_name} - Start: {start.strftime('%Y-%m-%d %H:%M:%S')}")
    try:
        yield
    finally:
        end = datetime.now()
        duration = (end - start).total_seconds()
        logging.info(f"{task_name} - End: {end.strftime('%Y-%m-%d %H:%M:%S')}")
        logging.info(f"{task_name} - Duration: {duration:.2f} seconds")