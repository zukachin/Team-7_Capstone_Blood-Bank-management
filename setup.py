from setuptools import setup, find_packages

setup(
    name="python_agent_chatbot",
    version="0.1.0",
    description="A LangChain-based chatbot agent with YAML-configurable prompts",
    author="Your Name",
    author_email="you@example.com",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    include_package_data=True,
    install_requires=[
        "langchain",
        "langgraph",
        "pyyaml",
        "uvicorn",
        "fastapi",   # Assuming you're using this
        "openai",    # If applicable
        "google-generativeai",  # If you're using Gemini
        # add any others here
    ],
    classifiers=[
        "Programming Language :: Python :: 3.10",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.10",
    entry_points={
    "console_scripts": [
        "python-agent-chatbot = your_module_path.main:main",  # Update this
    ],
},

)
