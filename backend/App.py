# app.py (FINAL, CORRECTED VERSION)

from flask import Flask, request, jsonify
from flask_cors import CORS # Make sure Flask-Cors is installed with 'pip install Flask-Cors'
import google.generativeai as genai
import os
import json
import re
import fitz # PyMuPDF
from dotenv import load_dotenv

# Load environment variables from a .env file
load_dotenv()

# --- App Setup ---
app = Flask(__name__)
# THIS IS THE FIX: A more robust CORS setup
CORS(app, resources={r"/*": {"origins": "*"}}) 

# --- Configure the Gemini API ---
API_KEY = os.getenv("GOOGLE_API_KEY")
if not API_KEY:
    raise ValueError("GOOGLE_API_KEY environment variable not set. Please set it in a .env file.")
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

# --- Helper Functions ---
def extract_and_parse_json(text):
    match = re.search(r'\{.*\}', text, re.DOTALL)
    if match:
        json_string = match.group(0)
        try:
            return json.loads(json_string)
        except json.JSONDecodeError as e:
            print(f"JSON Decode Error: {e}\nProblematic string: {json_string}")
            return None
    return None

def extract_text_from_file(file):
    filename = file.filename
    if filename.endswith('.pdf'):
        try:
            doc = fitz.open(stream=file.read(), filetype="pdf")
            text = "".join(page.get_text() for page in doc)
            doc.close()
            return text
        except Exception as e:
            print(f"Error reading PDF: {e}")
            return None
    elif filename.endswith('.txt'):
        return file.read().decode('utf-8', errors='ignore')
    return None

# --- API Endpoint for Document Analysis ---
@app.route("/analyzeDocument", methods=['POST'])
def analyze_document():
    if 'document' not in request.files:
        return jsonify({"error": "No document part in the request"}), 400
    file = request.files['document']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    document_content = extract_text_from_file(file)
    if not document_content:
        return jsonify({"error": "Could not extract text from the file."}), 400

    system_prompt = """
    You are a legal document analysis bot. Analyze the provided document and return a single, valid JSON object.
    
    JSON Structure:
    {
      "summary": "<Comprehensive summary of the document>",
      "riskFlags": [
        { "level": "<'Red' or 'Yellow'>", "title": "<Risk Title>", "explanation": "<Risk Explanation>" }
      ],
      "keyClauses": [
        { "title": "<Clause Title>", "originalText": "<Original Clause Text>", "simplifiedText": "<Simplified Explanation>" }
      ]
    }
    """
    try:
        response = model.generate_content([system_prompt, f"Analyze this document:\n\n{document_content}"])
        analysis_dict = extract_and_parse_json(response.text)
        if analysis_dict:
            return jsonify(analysis_dict)
        else:
            return jsonify({"error": "Failed to parse API response."}), 500
    except Exception as e:
        print(f"Error during Gemini API call: {e}")
        return jsonify({"error": "Failed to analyze document."}), 500

# --- API Endpoint for Q&A Chat ---
@app.route("/askQuestion", methods=['POST'])
def ask_question():
    data = request.get_json()
    if not data or 'question' not in data or 'context' not in data:
        return jsonify({"error": "Missing question or context"}), 400

    question = data['question']
    document_context = data['context']

    prompt = f"""
    Based ONLY on the document text provided below, answer the user's question in a simple and direct way. 
    If the answer is not in the document, say "I'm sorry, I cannot find the answer to that in this document."
    ---
    DOCUMENT TEXT: {document_context}
    ---
    USER'S QUESTION: "{question}"
    """
    try:
        response = model.generate_content(prompt)
        return jsonify({"answer": response.text})
    except Exception as e:
        print(f"Error during Q&A API call: {e}")
        return jsonify({"error": "Failed to get an answer."}), 500

# --- Start the Server ---
if __name__ == "__main__":
    app.run(debug=True, port=5000)