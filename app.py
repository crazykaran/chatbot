from flask import Flask, render_template, request, jsonify
from chat import get_response
import csv
import json
from dotenv import load_dotenv
import os
import firebase_admin
from firebase_admin import credentials, firestore, storage

app = Flask(__name__)
load_dotenv()
# Access environment variables
apiKey = os.getenv("apiKey")
authDomain = os.getenv("authDomain")
projectId = os.getenv("projectId")
storageBucket = os.getenv("storageBucket")
messagingSenderId = os.getenv("messagingSenderId")
appId = os.getenv("appId")

type = os.getenv("type")
project_id = os.getenv("project_id")
private_key_id = os.getenv("private_key_id")
private_key = os.getenv("private_key")
client_email = os.getenv("client_email")
client_id = os.getenv("client_id")
auth_uri = os.getenv("auth_uri")
token_uri = os.getenv("token_uri")
auth_provider_x509_cert_url = os.getenv("auth_provider_x509_cert_url")
client_x509_cert_url = os.getenv("client_x509_cert_url")
universe_domain = os.getenv("universe_domain")

json_data=r'''
{{
  "type": "{type}",
  "project_id": "{project_id}",
  "private_key_id": "{private_key_id}",
  "private_key": "{private_key}",
  "client_email": "{client_email}",
  "client_id": "{client_id}",
  "auth_uri": "{auth_uri}",
  "token_uri": "{token_uri}",
  "auth_provider_x509_cert_url": "{auth_provider_x509_cert_url}",
  "client_x509_cert_url": "{client_x509_cert_url}",
  "universe_domain": "{universe_domain}"
}}
'''.format(type=type,project_id=project_id,private_key_id=private_key_id,private_key=private_key,client_email=client_email,client_id=client_id,auth_uri=auth_uri,token_uri=token_uri,auth_provider_x509_cert_url=auth_provider_x509_cert_url,client_x509_cert_url=client_x509_cert_url,universe_domain=universe_domain)


data = json.loads(json_data)
with open('serviceAccountKey.json', 'w') as json_file:
    json.dump(data, json_file, indent=4)

# Initialize Firebase Admin SDK
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred, {
    "apiKey": apiKey,
    "authDomain": authDomain,
    "projectId": projectId,
    "storageBucket": storageBucket,
    "messagingSenderId": messagingSenderId,
    "appId": appId
})
db = firestore.client()
variable=1



@app.route('/')
def homePage():
    return render_template('index.html')

conversation = [["Name", "Message"]] 

@app.route('/predict', methods=["POST"])
def predict():
    global conversation
    global variable
    message= request.get_json().get("message")
    conversation.append(["User",message])

    if message=="quit":
        filename = f"conversation_{variable}.csv"
        with open('conversation.csv', 'w', newline='') as csvfile:
            csv_writer = csv.writer(csvfile)
            csv_writer.writerows(conversation)
        bucket = storage.bucket()  
        blob = bucket.blob(filename)
        blob.upload_from_filename('conversation.csv')

        # Make the file public to access
        blob.make_public()
        # Get the public URL of the uploaded file
        url = blob.public_url
        # Add the URL to Firestore or Realtime Database
        db.collection('files').add({'url': url})
        variable+=1
        # reset conversation list 
        conversation = [["Name", "Message"]] 
        return jsonify({"answer":"Thanks for talking with us!!"})

    response=get_response(message)
    conversation.append(["Bot",response])
    message={"answer":response}
    return jsonify(message)

@app.route("/csv_files",methods=["GET"])
def get_csv_files():
    files_ref = db.collection('files')
    docs = files_ref.stream()

    # Construct a list of URLs
    urls = [doc.to_dict().get('url') for doc in docs if doc.exists]

    # Return the URLs as JSON
    return jsonify(urls)

@app.route("/login")
def login():
    return render_template("login.html")


#commented for deployment purpose
#remove comment of want to run in localhost
# if __name__=='__main__':
#     app.run(debug=True)
