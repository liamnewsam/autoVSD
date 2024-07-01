import base64
import requests

# OpenAI API Key
with open("../gpt_key.txt") as keyFile:
    api_key = keyFile.read().strip()

# Function to encode the image
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

class Message:
    def __init__(self, text, role="user",imgPaths=[][:]):
        self.role = role
        self.text = text
        self.imgStrings = []
        self.imgPaths = imgPaths
        if imgPaths:
            self.imgStrings = [encode_image(imgPath) for imgPath in imgPaths]
            
class Conversation:
    def __init__(self, headers=None, payload=None):
        self.conversation = []
        if headers:
            self.headers = headers
        else:
            self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
            }
        if payload:
            self.payload = payload
        else:
            self.payload = {
            "model": "gpt-4o",
            "max_tokens": 500,
            "messages": []
            }
    def message_to_json(self, message):
        msg = {"role":message.role, "content": [{"type":"text","text":message.text}]}
        if message.imgStrings:
            for img in message.imgStrings:
                msg["content"].append({"type":"image_url", "image_url": {"url":f"data:image/jpeg;base64,{img}"}})
        return msg
    
    def speak(self, message):
        self.conversation.append(message)
        
        msg = self.message_to_json(message)

        self.payload["messages"].append(msg)
        
        reply = requests.post("https://api.openai.com/v1/chat/completions", headers=self.headers, json=self.payload).json()

        #print(reply)
        
        gpt_message = Message(reply["choices"][0]["message"]["content"],role=reply["choices"][0]["message"]["role"])
        self.payload["messages"].append(self.message_to_json(gpt_message))
        self.conversation.append(gpt_message)

        print(gpt_message.text + "\n____________________________\n\n")
        return gpt_message.text

    def copy(self):
        return Conversation(headers=self.headers, payload=self.payload)



'''
conversation = Conversation()
message = Message("hi, my name is liam")
print(conversation.speak(message))'''
