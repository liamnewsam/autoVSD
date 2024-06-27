import cv2
import numpy as np

def bounding_box(mask):
    true_coords = np.argwhere(mask)
    if true_coords.size == 0:
        return None, None
    top_left = true_coords.min(axis=0)
    bottom_right = true_coords.max(axis=0)
    return tuple(top_left), tuple(bottom_right)

def extract_and_resize(image, mask, cell_size):
    top_left, bottom_right = bounding_box(mask)
    if top_left is None or bottom_right is None:
        # Return a blank white cell with an alpha channel if no True values
        return np.ones((cell_size[1], cell_size[0], 4), dtype=np.uint8) * 255

    # Extract the region
    region = image[top_left[0]:bottom_right[0]+1, top_left[1]:bottom_right[1]+1]
    region_mask = mask[top_left[0]:bottom_right[0]+1, top_left[1]:bottom_right[1]+1]

    # Add an alpha channel based on the mask
    alpha_channel = (region_mask.astype(np.uint8) * 255)
    region_with_alpha = cv2.cvtColor(region, cv2.COLOR_BGR2BGRA)
    region_with_alpha[:, :, 3] = alpha_channel

    # Calculate the aspect ratio
    region_height, region_width = region_with_alpha.shape[:2]
    aspect_ratio = region_width / region_height

    # Determine new size while preserving aspect ratio
    if aspect_ratio > 1:
        new_width = cell_size[1]
        new_height = int(cell_size[1] / aspect_ratio)
    else:
        new_height = cell_size[0]
        new_width = int(cell_size[0] * aspect_ratio)

    resized_region = cv2.resize(region_with_alpha, (new_width, new_height), interpolation=cv2.INTER_LINEAR)

    # Create a blank cell with an alpha channel and place the resized region at the center
    cell = np.ones((cell_size[0], cell_size[1], 4), dtype=np.uint8) * 255
    cell[:, :, 3] = 0  # Set alpha channel to fully transparent
    start_x = (cell_size[1] - new_width) // 2
    start_y = (cell_size[0] - new_height) // 2
    cell[start_y:start_y + new_height, start_x:start_x + new_width] = resized_region

    return cell


def create_grid_image(image, masks, grid_size=(4, 4), cell_size=(100, 100)):
    img_height = grid_size[0] * cell_size[0]
    img_width = grid_size[1] * cell_size[1]
    grid_image = np.ones((img_height, img_width, 4), dtype=np.uint8) * 255
    grid_image[:, :, 3] = 0  # Set alpha channel to fully transparent

    mask_idx = 0
    for i in range(grid_size[0]):
        for j in range(grid_size[1]):
            start_x = j * cell_size[1]
            start_y = i * cell_size[0]

            if mask_idx < len(masks):
                cutout = extract_and_resize(image, masks[mask_idx], cell_size)
                grid_image[start_y:start_y + cell_size[0], start_x:start_x + cell_size[1]] = cutout
                mask_idx += 1

            cell_number = i * grid_size[1] + j + 1
            cv2.putText(grid_image, str(cell_number), (start_x + 3, start_y + 16), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0, 255), 1, cv2.LINE_AA)
    # Draw gridlines
    for i in range(1, grid_size[0]):
        y = i * cell_size[0]
        cv2.line(grid_image, (0, y), (img_width, y), (0, 0, 0, 255), 1)
    for j in range(1, grid_size[1]):
        x = j * cell_size[1]
        cv2.line(grid_image, (x, 0), (x, img_height), (0, 0, 0, 255), 1)
    
    return grid_image


