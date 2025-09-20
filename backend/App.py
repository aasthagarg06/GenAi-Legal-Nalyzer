# app.py
import time
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
import json
import re # Import the regular expression module
import fitz # PyMuPDF
from dotenv import load_dotenv

# Load environment variables from a .env file
load_dotenv()

# --- Boilerplate Setup ---
app = Flask(__name__)
CORS(app) 

# Configure the Gemini API client
API_KEY = os.getenv("GOOGLE_API_KEY")
if not API_KEY:
    raise ValueError("GOOGLE_API_KEY environment variable not set. Please set it in a .env file.")
genai.configure(api_key=API_KEY)

# Define the model to use
model = genai.GenerativeModel('gemini-1.5-flash')

# --- Helper Function for Robust JSON Parsing ---
def extract_and_parse_json(text):
    """
    Extracts a JSON object from a string that may contain extra text,
    and returns a Python dictionary.
    """
    # Use a regex to find a JSON block starting with { and ending with }
    match = re.search(r'\{.*\}', text, re.DOTALL)
    
    if match:
        json_string = match.group(0)
        try:
            return json.loads(json_string)
        except json.JSONDecodeError as e:
            print(f"Failed to decode JSON: {e}")
            print(f"Problematic JSON string: {json_string}")
            return None # Return None if parsing fails
    else:
        print("No JSON object found in the text.")
        return None

# --- THE REAL API ENDPOINT ---
@app.route("/analyzeDocument", methods=['POST'])
def analyze_document():
    
    print("File received! Analyzing document with Gemini AI...")
    
    # 1. Get the uploaded file
    if 'document' not in request.files:
        return jsonify({"error": "No document part in the request"}), 400
    
    file = request.files['document']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    # 2. Extract text based on file type
    filename = file.filename
    document_content = ""
    
    if filename.endswith('.pdf'):
        try:
            print("Attempting to extract text from PDF...")
            doc = fitz.open(stream=file.read(), filetype="pdf")
            for page in doc:
                document_content += page.get_text()
            doc.close()
            print("PDF text extraction successful.")
        except Exception as e:
            print(f"Error extracting text from PDF: {e}")
            return jsonify({"error": "Could not read the PDF file."}), 400
            
    elif filename.endswith('.txt'):
        document_content = file.read().decode('utf-8', errors='ignore')
    
    else:
        return jsonify({"error": "Unsupported file type. Please upload a PDF or TXT file."}), 400

    if not document_content.strip():
        return jsonify({"error": "The file is empty or contains no readable text."}), 400

    # 3. Craft the Gemini API prompt
    system_prompt = """
    You are a legal document analysis bot. Your task is to provide a detailed, plain-English analysis of a legal document, such as a rental agreement or a contract.

Follow these strict instructions for your output:
- **SUMMARY**: Write a comprehensive paragraph that outlines the document's main purpose, key parties involved, and the most important terms and conditions. Be specific and include any numbers or percentages mentioned.

- **RISK FLAGS**: Identify any clauses that are highly unusual, disadvantageous to the user, or represent a significant commitment.
    - **Red Flags**: Clauses that are highly unfavorable or risky.
    - **Yellow Flags**: Clauses that are standard but should be carefully reviewed.
    - For each flag, provide a clear title and a simple explanation of why it is a risk.

- **KEY CLAUSES**: Choose the most important 3-5 clauses from the document.
    - **Original Text**: Extract the exact legal text for each key clause.
    - **Simplified Text**: Rewrite each clause in simple, easy-to-understand language. Do not use legal jargon. The goal is clarity for a layperson.

Provide the entire output as a single, valid JSON object, adhering strictly to the following schema. Do not include any other text, markdown, or commentary outside of the JSON object.

JSON Structure:
{
  "summary": "<The comprehensive summary you created.>",
  "riskFlags": [
    {
      "level": "<'Red' or 'Yellow'>",
      "title": "<A concise title for the risk.>",
      "explanation": "<A plain-English explanation.>"
    }
  ],
  "keyClauses": [
    {
      "title": "<A simple, descriptive title for the clause.>",
      "originalText": "<The exact, original legal text of the clause.>",
      "simplifiedText": "<A plain-English summary of the clause's meaning.>"
    }
  ]
}

Analyze the legal document and return the analysis in the JSON format above.
    """
    
    prompt_parts = [system_prompt, f"Analyze the following legal document:\n\n{document_content}"]

    try:
        # 4. Call the Gemini API
        response = model.generate_content(prompt_parts)
        
        # 5. Extract and parse the JSON output from the raw text
        raw_response_text = response.text
        
        print(f"\n--- Raw API Response Start ---\n{raw_response_text}\n--- Raw API Response End ---\n")
        
        analysis_dict = extract_and_parse_json(raw_response_text)
        
        if analysis_dict:
            print("Analysis complete. Sending data to frontend.")
            return jsonify(analysis_dict)
        else:
            return jsonify({"error": "Failed to parse API response. Please check the terminal."}), 500

    except Exception as e:
        print(f"Error during Gemini API call: {e}")
        return jsonify({
            "error": "Failed to analyze document. Please check the document format or try again."
        }), 500

# --- Start the Server ---
if __name__ == "__main__":
    app.run(debug=True, port=5000)