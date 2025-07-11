# Introduction 
Our project is an chatbot designed to assist users with document-based information retrieval. This bot allows users to upload PDF files and query the content using the Haystack framework. It is built with a user-friendly interface.

## Table of Contents
- [About the Project](#about-the-project)
- [Installation](#installation)
- [Usage](#usage)
- [Localhost URL](#localhost-url)

## About the Project
 Advance Information Retrival is capable of indexing and querying document contents, enabling users to extract precise information efficiently.


## Installation
### Steps
1. Clone the repository:
   ```bash
   git clone https://llamaInpocket@dev.azure.com/llamaInpocket/CitizenServices/_git/ragApps
   cd ragApps
  

2. Create a virtual environment and activate it:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`

3. Install Dependencies:
   ```bash
   pip install -r requirements.txt

4. Set up Environment Variables:  <br>
    Create a .env file with the necessary API keys or configurations<br>
    
    1. Run Qdrant in Docker:Ensure you have Docker installed. Run the following command to start the Qdrant container.<br>
    This will start Qdrant and make it available at http://127.0.0.1:6333.
    ```bash
    docker run -d --name qdrant -p 6333:6333 qdrant/qdrant  

## Usage
1. Run the Application:
   ```bash
   python app.py

## Localhost URL 
Once the server is up and running, you can access the application at:

Local URL: http://127.0.0.1:8000
