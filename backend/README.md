markdown
Copy code
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

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/linkedin-message-bot.git
   cd linkedin-message-bot/backend
Set up a virtual environment:

bash
Copy code
python3 -m venv venv
source venv/bin/activate
Install Python dependencies:

bash
Copy code
pip install -r requirements.txt
Install Node.js dependencies:

bash
Copy code
npm install
Ensure MongoDB is running:

Start MongoDB if it is not already running:
bash
Copy code
mongod --config /usr/local/etc/mongod.conf
Configuration

Create a .env file in the backend directory and add your OpenAI API key:
bash
Copy code
echo "OPENAI_API_KEY=your_openai_api_key" > .env
Usage

Start the backend server:

bash
Copy code
node app.js
Upload a CSV file through the frontend interface or use a tool like Postman to send a 
POST request to the /upload endpoint:

Example CSV format:
csv
Copy code
username,role,messageType
johndoe,recruiter,connection_request
janedoe,user,dm
Verify that messages are generated and stored in MongoDB by visiting the /messages 
endpoint:

bash
Copy code
curl http://localhost:5001/messages
Python Script Usage

Run the Python script manually to generate messages:
bash
Copy code
source venv/bin/activate
python3 generate_messages.py /path/to/input.csv /path/to/output.csv
Directory Structure

go
Copy code
backend/
├── app.js
├── generate_messages.py
├── package.json
├── requirements.txt
├── uploads/
└── venv/
Troubleshooting

If you encounter issues with MongoDB, ensure it is running and accessible at 
localhost:27017.
For rate limit errors with the OpenAI API, ensure you have sufficient quota or handle 
rate limits appropriately in your code.
Contributing

To contribute to this project, follow these steps:

Fork the repository.
Create a new branch: git checkout -b feature-branch-name.
Make your changes and commit them: git commit -m 'Add some feature'.
Push to the branch: git push origin feature-branch-name.
Submit a pull request.
License

This project is licensed under the MIT License. See the LICENSE file for details.

bash
Copy code

### Steps for the Collaborator to Follow

1. **Clone the repository and navigate to the `backend` directory:**
   ```bash
   git clone https://github.com/yourusername/linkedin-message-bot.git
   cd linkedin-message-bot/backend
Set up a virtual environment and install dependencies:

bash
Copy code
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
npm install
Ensure MongoDB is running:

bash
Copy code
mongod --config /usr/local/etc/mongod.conf
Create a .env file with the OpenAI API key:

bash
Copy code
echo "OPENAI_API_KEY=your_openai_api_key" > .env
Start the backend server:

bash
Copy code
node app.js

