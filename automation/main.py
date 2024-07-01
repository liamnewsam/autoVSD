from Conversation import *
from Segmentation import *

import time
import os
import threading
import shutil

class Hotspot:
    def __init__(self, hotspotName='', options=[]):
        self.hotspotName = hotspotName
        self.options = options

    def print(self):
        print (f"{self.hotspotName}: {self.options}")

def delete_files_in_directory(directory_path):
   try:
     files = os.listdir(directory_path)
     for file in files:
       file_path = os.path.join(directory_path, file)
       if os.path.isfile(file_path):
         os.remove(file_path)
     print("All files deleted successfully.")
   except OSError:
     print("Error occurred while deleting files.")

def delete_all_directories_within(path):
    # Ensure the path exists
    if not os.path.exists(path):
        print(f"Path {path} does not exist.")
        return

    # Iterate over the items in the directory
    for item in os.listdir(path):
        item_path = os.path.join(path, item)
        if os.path.isdir(item_path):
            # Remove the directory and its contents
            shutil.rmtree(item_path)
        else:
            print(f"Skipping non-directory item: {item_path}")

def create_directories(path, new_directories):
    # Ensure the path exists
    if not os.path.exists(path):
        print(f"Path {path} does not exist.")
        return
    
    for dir_name in new_directories:
        new_dir_path = os.path.join(path, dir_name)
        os.makedirs(new_dir_path, exist_ok=True)
        print(f"Created directory: {new_dir_path}")

def copy_files_to_directory(src_files, dest_dir):
    for src_file in src_files:
        shutil.copy(src_file, dest_dir)


def get_masks(img_url, sam_url, dataObject):
    data, mask_images = compute_masks(img_url, sam_url)

    delete_files_in_directory("./masks")
    for (i, mask_image) in enumerate(mask_images):
        cv2.imwrite(f"./masks/mask{i+1}.png",mask_image)
    print("finished masking")

    dataObject.extend(data)

def parse_hotspots(gpt_response):
    '''
Assuming the following format:
Hotspot 1:
- Option 1:
- Option 2:
    '''
    gpt_response = gpt_response.split('\n')
    hotspots = []
    currHotspot = None
    for line in gpt_response:
        lowerLine = line.lower()
        if "hotspot" in lowerLine and ":" in lowerLine:
            if currHotspot:
                hotspots.append(currHotspot)
            currHotspot = Hotspot(hotspotName=line.split(": ")[1], options=[])
        elif "option" in lowerLine and ":" in lowerLine:
            currHotspot.options.append(line.split(": ")[1])

    if currHotspot:
        hotspots.append(currHotspot)
    return hotspots
    
def validate_mask(originalConversation, hotspots, hotspot_masks, message, lock):
    conversation = originalConversation.copy()
    conversation.speak(message)

    response = conversation.conversation[-1].text

    if "yes" in response.lower():
        with lock:
            for i in range(len(hotspots)):
                if hotspots[i].hotspotName in response:
                    hotspot_masks[i].append(message.imgPaths[1]) ## Important!!!, this is
                    break
            else:
                print("whatsapp dock")
    

img_url = "../samplePhotos/img6.jpg"
sam_url = "../sam_vit_h_4b8939.pth"

##conversation = Conversation()
##
##conversation.speak(Message('''In the provided image, please describe in as much detail what is depicted,
##and try to identify as many different things in the image as you can''', imgPaths=[img_url]))
##                   
##
test_prompt = '''I have presented you with the same image, as well as a mask. The mask is the original image, except most of the image is grayed out. However, a
part of the image is left untouched. ? Please consider all of the different
things you identified in your first response'''
##
###data = []
###get_masks(img_url, sam_url, data)
##
##for i in range(len(os.listdir('./masks'))):
##    conversation = conversation.copy()
##    message = Message(test_prompt, imgPaths=[img_url, f"./masks/mask{i+1}.png"])
##    conversation.speak(message)

hotspots_prompt = '''This photo was taken to be used in a visual screen display for a child.
The child using the visual screen display is pre-linguistic, they haven't begun to communicate verbally.
Please provide relevant hotspots (simplified as best you can!) in the image with accompanying contextually
relevant communication options if you are focused on building engagement in interactions and the emergence of words.
Only respond with the hotspot names and options, nothing more! Structure your response like the following:
Hotspot 1: Hotspot
- Option 1: Option
- Option 2: Option
etc.'''
hotspots_message = Message(hotspots_prompt, imgPaths=[img_url])

masks_prompt = '''I have presented you with the same image, as well as a mask. The mask is the original image, except most of the image is grayed out. However, a
part of the image is left untouched. Is this one of the
hotspots you provided in your previous response (state which one it is)? You are allowed to say no.'''

#conversation.speak(Message(masks_prompt, imgPaths=["masks/mask3.png"]))

def retrieve_data(user_img_url):
    conversation = Conversation()
    t1 = threading.Thread(target=conversation.speak, args=[Message(hotspots_prompt, imgPaths=[user_img_url])])
    t1.start()
    t1.join()
    hotspots = parse_hotspots(conversation.conversation[-1].text)
    
    return hotspots
                          

'''
if __name__ == "__main__":
    conversation = Conversation()

    t1 = threading.Thread(target=conversation.speak, args=[hotspots_message])
    maskData = []
    t2 = threading.Thread(target=get_masks, args=[img_url, sam_url, maskData])

    t1.start()
    t2.start()
    t1.join()
    t2.join();

    hotspots = parse_hotspots(conversation.conversation[-1].text)
    for hotspot in hotspots:
        hotspot.print()
    
    hotspot_masks = [[] for _ in range(len(hotspots))]
    lock = threading.Lock()
    mask_validation_threads = [threading.Thread(target=validate_mask, args=[conversation, hotspots, hotspot_masks,
                                Message(masks_prompt, imgPaths=[f"./masks/mask{i+1}.png"]), lock]) for i in range(len(os.listdir('./masks')))]

    mask_validation_threads = [threading.Thread(target=validate_mask, args=[conversation, hotspots, hotspot_masks,
                                Message(masks_prompt, imgPaths=[img_url, f"./masks/mask{i+1}.png"]), lock]) for i in range(len(os.listdir('./masks')))]
    for thread in mask_validation_threads:
        thread.start()

    for thread in mask_validation_threads:
        thread.join()

    
    delete_all_directories_within("./test")
    create_directories("./test", [hotspot.hotspotName for hotspot in hotspots])
    for i in range(len(hotspots)):
        copy_files_to_directory(hotspot_masks[i], f"./test/{hotspots[i].hotspotName}")

    print("Done!")
        
'''

    

    
