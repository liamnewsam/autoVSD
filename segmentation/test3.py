from segment_anything import SamPredictor, sam_model_registry, SamAutomaticMaskGenerator
import cv2

import numpy as np
from scipy.ndimage import label

import torch
import matplotlib.pyplot as plt

import time

import grid
times = [time.time()]

def show_mask(mask, ax, random_color=False):
    if random_color:
        color = np.concatenate([np.random.random(3), np.array([0.6])], axis=0)
    else:
        color = np.array([1, 0, 0, 0.6])
    h, w = mask.shape[-2:]
    mask_image = mask.reshape(h, w, 1) * color.reshape(1, 1, -1)
    ax.imshow(mask_image)
    
def show_points(coords, labels, ax, marker_size=375):
    #pos_points = coords[labels==1]
    #neg_points = coords[labels==0]
    pos_points=coords
    ax.scatter(pos_points[:, 0], pos_points[:, 1], color='green', marker='*', s=marker_size, edgecolor='white', linewidth=1.25)
    #ax.scatter(neg_points[:, 0], neg_points[:, 1], color='red', marker='*', s=marker_size, edgecolor='white', linewidth=1.25)   



def count_true_islands(array):
    def dfs_iterative(start_x, start_y):
        stack = [(start_x, start_y)]
        while stack:
            x, y = stack.pop()
            if x < 0 or x >= array.shape[0] or y < 0 or y >= array.shape[1] or not array[x, y] or visited[x, y]:
                continue
            visited[x, y] = True
            directions = [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (1, 1), (-1, 1), (1, -1)]
            for dx, dy in directions:
                stack.append((x + dx, y + dy))

    visited = np.zeros_like(array, dtype=bool)
    island_count = 0

    for i in range(array.shape[0]):
        for j in range(array.shape[1]):
            if array[i, j] and not visited[i, j]:
                island_count += 1
                dfs_iterative(i, j)

    return island_count


def keep_n_largest_islands(array, n):
    # Label the connected components (islands)
    labeled_array, num_features = label(array)
    
    # Calculate the size of each island
    island_sizes = [(i, np.sum(labeled_array == i)) for i in range(1, num_features + 1)]
    
    # Sort the islands by size in descending order and keep the n largest
    largest_islands = sorted(island_sizes, key=lambda x: x[1], reverse=True)[:n]
    largest_island_labels = {label for label, size in largest_islands}
    
    # Create a new array to keep only the n largest islands
    new_array = np.zeros_like(array, dtype=bool)
    for label_value in largest_island_labels:
        new_array[labeled_array == label_value] = True
    
    return new_array

def is_enclosed_with_tolerance(inner, outer, threshold=0.6):
    """Check if inner is enclosed within outer with a certain degree of similarity."""
    overlap = np.logical_and(inner, outer)
    overlap_count = np.sum(overlap)
    inner_count = np.sum(inner)
    
    # Check if the proportion of matching True values exceeds the threshold
    return overlap_count / inner_count >= threshold


def generate(sam, image, resolution, maskSimilarityForRejection):
    points = []
    for i in range(resolution+1):
        for j in range(resolution+1):
            yPos = int((len(image) * 1.0 / resolution) * i)
            xPos = int((len(image[0]) * 1.0 / resolution) * j)
            points.append([xPos, yPos])
    times.append(time.time())
    predictor = SamPredictor(sam)
    predictor.set_image(image)

    times.append(time.time())

    
    data = [predictor.predict(point_coords=np.array([point]),point_labels=np.array([1]),multimask_output=True) for point in points]
    data.sort(key=lambda datum: np.sum(datum[0][2]), reverse=True)
    return data

def hamming_distance(arr1, arr2):
    """Compute the Hamming distance between two 2D boolean numpy arrays."""
    return np.sum(arr1 != arr2)

def mask_size(arr):
    return np.sum(arr)

def filter_data(data):
    '''
    for i in range(len(data)):
        for j in range(i+1, len(data)):
            print(hamming_distance(data[i][0][2], data[j][0][2]))
    '''

    for datum in data:
        datum[0][2] = keep_n_largest_islands(datum[0][2], 4)
    
    initial = 0
    terminal = 1
    while initial < len(data)-1:
        terminal = initial+1
        while terminal < len(data):
            d1, d2 = data[initial][0][2], data[terminal][0][2]
            hamDistance = hamming_distance(d1, d2)
            if hamDistance < 0.75 * max(mask_size(d1),mask_size(d2)) or is_enclosed_with_tolerance(d2, d1):
                data.pop(terminal)
                continue
            terminal += 1
        initial += 1

def compute_masks_and_grid(img_url, sam_url="./sam_vit_h_4b8939.pth"):
    img1 = cv2.imread(img_url)
    img1 = cv2.cvtColor(img1, cv2.COLOR_BGR2RGB)
    sam = sam_model_registry["default"](checkpoint=sam_url)
    #times.append(time.time())
    data = generate(sam, img1, 10, 0)
    #times.append(time.time())
    filter_data(data)
    #times.append(time.time())
    #time_differences = [times[i] - times[i-1] for i in range(1, len(times))]
    #print(time_differences)

    grid_image = grid.create_grid_image(img1, [datum[0][2] for datum in data])
    return data, grid_image

def show_image(img):
    plt.figure(figsize=(10,10))
    plt.imshow(img)
    plt.show()
'''
img1 = cv2.imread('../samplePhotos/img6.jpg')
img1 = cv2.cvtColor(img1, cv2.COLOR_BGR2RGB)
plt.figure(figsize=(10,10))
plt.imshow(img1)
plt.show()
'''

'''
    for mask in masks:
        plt.figure(figsize=(10,10))
        plt.imshow(img1)
        show_mask(mask, plt.gca())
        plt.axis('off')
        plt.show()
    print("next mask!")'''
    



'''
predictor = SamPredictor(sam)
predictor.set_image(img1)

input_point = np.array([[122, 287]])
input_label = np.array([1])

print("HI")
masks, scores, logits = predictor.predict(
    point_coords=input_point,
    point_labels=input_label,
    multimask_output=True,
)
print("GOODBYE")

i=1

plt.figure(figsize=(10,10))
plt.imshow(img1)
show_mask(masks[i], plt.gca())
show_points(input_point, input_label, plt.gca())
plt.title(f"Mask {i+1}, Score: {scores[i]:.3f}", fontsize=18)
plt.axis('off')
plt.show()  
'''
