from Conversation import *
from Segmentation import *

import time
img_url = "../samplePhotos/img7.jpg"
sam_url = "../sam_vit_h_4b8939.pth"


hotspots_prompt = '''This photo was taken to be used in a visual screen display for a child.
                       The child using the visual screen display is pre-linguistic, they haven't begun to communicate verbally.
                       Please provide relevant hotspots (simplified as best you can!) in the image with accompanying contextually
                       relevant communication options if you are focused on building engagement in interactions and the emergence of words.
                       Only respond with the hotspot names and options, nothing more!'''

masks_prompt = '''If any of the four objects presented are one of the hotspots you prov
ided in your previous response, please respond with: "[Hotspot List Number]: [Grid Number found in top left of the grid cell!]"'''

conversation = Conversation()
conversation.speak(Message(hotspots_prompt, imgPath=img_url))


#data, grid_image = compute_masks_and_grid(img_url, sam_url)


#cv2.imwrite("grid.png",grid_image)


conversation.speak(Message(masks_prompt, imgPath="grid.png"))

