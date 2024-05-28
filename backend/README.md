# LinkedIn Message Bot - Backend

This project is a backend service for generating personalized LinkedIn messages using 
the OpenAI API. The service includes the following functionalities:

- Uploading CSV files with user information
- Generating personalized messages using the OpenAI API
- Storing generated messages in MongoDB
- Viewing and sending messages through the LinkedIn API

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js installed on your machine
- Python 3.8 or higher installed on your machine
- MongoDB installed and running on your machine
- An OpenAI API key

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/linkedin-message-bot.git
    cd linkedin-message-bot/backend
    ```

2. Set up a virtual environment:
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

3. Install Python dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4. Install Node.js dependencies:
    ```bash
    npm install
    ```

5. Ensure MongoDB is running:
    ```bash
    mongod --config /usr/local/etc/mongod.conf
    ```

## Configuration

Create a `.env` file in the `backend` directory and add your OpenAI API key:
```bash
echo "OPENAI_API_KEY=your_openai_api_key" > .env


