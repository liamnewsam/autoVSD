import base64
import requests

# OpenAI API Key
api_key = "" #get from gpt_key.txt

# Function to encode the image


def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')


def submit_request(imgPath, text):
    # Path to your image
    image_path = imgPath

    # Getting the base64 string
    base64_image = encode_image(image_path)

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }

    payload = {
        "model": "gpt-4-vision-preview",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": text
                    },
##                    {
##                        "type": "image_url",
##                        "image_url": {
##                            "url": f"data:image/jpeg;base64,{base64_image}"
##                        }
##                    }
                ]
            }
        ],
        "max_tokens": 500
    }

    return requests.post(
        "https://api.openai.com/v1/chat/completions", headers=headers, json=payload)


def process_request(response):
    res = response['choices'][0]
    comm_options = res['message']['content']
    return comm_options


imgPath = "design.png"
text1 = '''This photo was taken to be used in a visual screen display for a child.
                                   The child using the visual screen display is pre-linguistic, they haven't begun to communicate verbally.
                                   Please provide relevant hotspots (simplified as best you can!) in the image with accompanying contextually
                                   relevant communication options if you are focused on building engagement in interactions and the emergence of words.
                                   Only respond with the hotspot names and options, nothing more!'''

text2 = '''I am trying to create a web app using react. It should have an image which can be drawn over in the top-left,
a region for editing text in the bottom left, and 8 squares displaying text on the right half of the screen. Can you give me an outline of what I need to do?
'''
text3 = "I am doing css, and I have the red button in a <li> element. How do I get the <li> element (grey box) to completely cover the button?"
text4 = """React: Is this allowed?: let [hotspotSetters, setHotspotSetters] = useState<
    React.Dispatch<React.SetStateAction<HotSpotData>>[]
  >([]);"""
print(process_request(submit_request("question1.png", text4).json()))
