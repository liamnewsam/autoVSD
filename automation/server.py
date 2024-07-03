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

    return image.shape[1], image.shape[0]

def generate_final_mask(masks, imageWidth, imageHeight, index):
    final_mask = np.zeros((imageHeight, imageWidth), dtype=np.uint8)
    
    # Combine masks using bitwise_or
    
    for mask in masks:
        #mask_uint8 = mask.astype(np.uint8) * 255  # Convert boolean to 0/255 values
        #final_mask = cv2.bitwise_or(final_mask, mask_uint8)
        final_mask = np.logical_or(final_mask, mask)

    
    # Create an RGBA image
    im = np.zeros((imageHeight, imageWidth, 4), dtype=np.uint8)

    if len(masks) == 0:
        print("um, how did we get here?")
        print(type(final_mask))
        print(im.shape)

        _, img_encoded = cv2.imencode(".png", im)

        # Convert the encoded image data to a base64-encoded string
        img_base64 = base64.b64encode(img_encoded).decode('utf-8')

        return img_base64
    #im = np.zeros((len(masks[0]), len(masks[0][0]), 4), dtype=np.uint8)
    print("yessir yessir")
    print(type(final_mask))
    print(im.shape)

    #final_mask = masks[0]
    # Set the gray color with some transparency for True values in final_mask
    gray_value = 50
    alpha_value = 77  # Adjust this value for the desired transparency level

    # Set the RGBA values where the final mask is True
    im[final_mask] = [gray_value, gray_value, gray_value, alpha_value]
    #im[final_mask] = [200, 0, 0, 128]

    #print(im)

    # Save the image for debugging purposes
    cv2.imwrite(f"./hello/mask{index+1}.png", im)

    # Encode the image to PNG format
    _, img_encoded = cv2.imencode(".png", im)

    # Convert the encoded image data to a base64-encoded string
    img_base64 = base64.b64encode(img_encoded).decode('utf-8')

    return f"data:image/png;base64,{img_base64}"

def hotspot_to_json(hs):
    return {"hotspotName": hs.hotspotName, "options": hs.options, "id": random.randint(1, 500), "mask": hs.mask}

app = Flask(__name__)
CORS(app)

@app.route('/')
def hello():
    return 'Hello, World!'


user_img_url = "./userImage.png"


@app.route('/api/send-data', methods=['POST'])
def receive_data():
    image_data = request.json  # Assuming JSON data is sent
    imgWidth, imgHeight = write_image(user_img_url, image_data)
    
    hotspots = retrieve_data(user_img_url)

    return jsonify([hs.toJSON() for hs in hotspots])
    

@app.route('/api/send-mask', methods=['POST'])
def receive_mask():
    image_data = request.json
    write_image(user_img_url, image_data)
    return

app.run()
