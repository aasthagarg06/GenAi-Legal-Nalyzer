# app.py

import time
from flask import Flask, request, jsonify
from flask_cors import CORS

# --- Boilerplate Setup ---
app = Flask(__name__)
# This allows your frontend (running on a different origin) to talk to this backend.
CORS(app) 

# --- THE MOCK API ENDPOINT ---
# This is the heart of your mock backend. It listens for POST requests at the '/analyzeDocument' URL.
@app.route("/analyzeDocument", methods=['POST'])
def analyze_document():
    
    print("File received! Simulating AI analysis...")

    # This checks if a file was actually uploaded in the request.
    if 'document' not in request.files:
        return jsonify({"error": "No document part in the request"}), 400
    
    file = request.files['document']

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # --- !!! IMPORTANT FOR YOUR TEAMMATE !!! ---
    # TODO: Your teammate will replace this entire 'mock_analysis_result' dictionary
    # with the actual response from the Google Gemini API.
    mock_analysis_result = {
        "summary": "This is a standard 12-month residential rental agreement. It outlines your responsibilities as a tenant and the landlord's obligations. The key financial components are a monthly rent of ₹25,000 and a security deposit of ₹50,000.",
        "riskFlags": [
            {
                "level": "Red",
                "title": "Automatic Rent Increase Clause",
                "explanation": "Clause 7.2 allows the landlord to increase the rent by up to 10% after 6 months with only 15 days notice. This is highly unusual and not in your favor."
            },
            {
                "level": "Yellow",
                "title": "Full Maintenance Responsibility",
                "explanation": "You are responsible for all appliance repairs, including normal wear and tear (Clause 11.5). You should try to negotiate this to cover only damages you cause."
            }
        ],
        "keyClauses": [
            {
                "title": "Security Deposit (Clause 4.1)",
                "originalText": "The tenant shall deposit a sum of Fifty Thousand Rupees (₹50,000) as a security deposit, refundable at the end of the lease term, subject to deductions for damages.",
                "simplifiedText": "You need to pay a ₹50,000 security deposit. You'll get it back when you move out, unless you've damaged the property."
            },
            {
                "title": "Termination Clause (Clause 15.3)",
                "originalText": "The tenant must provide a written notice of at least sixty (60) days prior to the expiration of the lease term to terminate this agreement.",
                "simplifiedText": "If you want to move out at the end of the year, you must tell your landlord in writing at least 2 months beforehand."
            }
        ]
    }
    # --- End of data to be replaced ---

    # We use a sleep to simulate the 2-3 seconds it would take for a real AI to process the document.
    # This makes your frontend's loading spinner look realistic.
    time.sleep(2.5) # sleep for 2.5 seconds

    print("Analysis complete. Sending mock data to frontend.")
    return jsonify(mock_analysis_result) # Send the fake JSON data back as the response


# --- Start the Server ---
if __name__ == "__main__":
    # Our backend will run on port 5000 by default
    app.run(debug=True, port=5000)