import uvicorn
import config
from dotenv import load_dotenv

load_dotenv()


if __name__ == "__main__":
    uvicorn.run("api:app", host=config.fast_api["host"], port=config.fast_api["port"], reload=True)
