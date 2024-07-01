from flask import Flask, request, jsonify
from flask_cors import CORS
from main import *

import time
import random
def write_image(fileName, image_data):
    if image_data.startswith('data:image/png;base64,'):
        image_data = image_data.replace('data:image/png;base64,', '')
    
    # Decode the base64 string
    decoded_data = base64.b64decode(image_data)
    
    # Convert the byte data to a numpy array
    np_arr = np.frombuffer(decoded_data, np.uint8)
    
    # Decode the numpy array to an image
    image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    
    # Save the image
    cv2.imwrite(fileName, image)

def hotspot_to_json(hs):
    return {"hotspotName": hs.hotspotName, "options": hs.options, "id": random.randint(1, 500), "points": []}

app = Flask(__name__)
CORS(app)

@app.route('/')
def hello():
    return 'Hello, World!'


user_img_url = "./userImage.png"


@app.route('/api/send-data', methods=['POST'])
def receive_data():
    image_data = request.json  # Assuming JSON data is sent
    write_image(user_img_url, image_data)
    
    hotspots = retrieve_data(user_img_url)
    print(hotspots)

    return jsonify([hotspot_to_json(hs) for hs in hotspots])

@app.route('/api/send-mask', methods=['POST'])
def receive_mask():
    image_data = request.json
    write_image(user_img_url, image_data)
    return

app.run()
