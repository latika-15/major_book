# text and book pdf summarizer backend app
from flask import Flask,request,jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS
from config import Config
from dotenv import load_dotenv
from urllib.parse import quote_plus
import fitz
import os
from openai import OpenAI

load_dotenv()
client=OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app=Flask(__name__)
CORS(app, origins=["http://localhost:3000"])


# MongoDB configuration

def get_mongo_uri():
    """Safely build MongoDB URI with proper error handling"""
    try:
        username = quote_plus(os.getenv('MONGO_USERNAME', ''))
        password = quote_plus(os.getenv('MONGO_PASSWORD', ''))
        host = os.getenv('MONGO_HOST', 'localhost')
        port = os.getenv('MONGO_PORT', '27017')
        db_name = os.getenv('MONGO_DB_NAME', 'bookbuddy')
        
        if username and password:
            if 'mongodb.net' in host:
                return f"mongodb+srv://{username}:{password}@{host}/{db_name}?retryWrites=true&w=majority"
            else:
                return f"mongodb://{username}:{password}@{host}:{port}/{db_name}?authSource=admin"
        else:
            return f"mongodb://{host}:{port}/{db_name}"
    except Exception as e:
        print(f"Error building MongoDB URI: {e}")
        return "mongodb://localhost:27017/bookbuddy"

app.config["MONGO_URI"] = get_mongo_uri()

try:
    mongo = PyMongo(app)
    print("MongoDB connected successfully!")
except Exception as e:
    print(f"MongoDB connection failed: {e}")
    mongo = None

# get summary

def get_summary(prompt):
    try:
        response=client.chat.completions.create(
            model="gpt-4o-mini",
          messages=[
                {"role": "system", "content": "You are a helpful assistant that summarizes text."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,
            temperature=0.7
        )
        if hasattr(response, "choices") and response.choices and hasattr(response.choices[0], "message") and hasattr(response.choices[0].message, "content"):
            return response.choices[0].message.content
        else:
            return "Error: No summary returned from OpenAI."
    
    except Exception as e:
        print("Error:", e)
        return "Error: Unable to summarize at the moment. Please try again later."


@app.route("/summarize/text", methods=["POST"])
def summarize_text():
    data=request.get_json()
    text=data.get("text","")
    if not text:
        return jsonify({"error":"No text provided"}),400
    prompt=f"Summarize the following text:\n\n{text}"
    summary=get_summary(prompt)
    return jsonify({"summary":summary})

@app.route("/summarize/pdf", methods=["POST"])
def summarize_pdf():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    try:
        # Save the uploaded file to a temporary location
        temp_path = "temp_uploaded.pdf"
        file.save(temp_path)
        # Open and extract text from the PDF
        doc = fitz.open(temp_path)
        full_texts = []
        for page in doc:
            full_texts.append(page.get_text())
        doc.close()
        os.remove(temp_path)
        full_text = ''.join(full_texts)
        prompt = f"Summarize the following text from the PDF content:\n\n{full_text}"
        summary = get_summary(prompt)
        return jsonify({"summary": summary})
    except Exception as e:
        return jsonify({"error": "Failed to process PDF file"}), 500
        return jsonify({"error":"Failed to process PDF file"}),500
           
if __name__=="__main__":
    debug_mode = os.getenv("FLASK_DEBUG", "False").lower() == "true"
    app.run(debug=debug_mode)
    app.run(debug=True)


