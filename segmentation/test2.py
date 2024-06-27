import mmcv
from mmdet.apis import init_detector, inference_detector
from mmengine.visualization import Visualizer
import cv2
import torch

# Load the object detection model
det_config_file = 'configs/faster_rcnn/faster-rcnn_r50_fpn_1x_coco.py'
det_checkpoint_file = './faster_rcnn_r50_fpn_1x_coco_20200130-047c8118.pth'
det_model = init_detector(det_config_file, det_checkpoint_file, device='cpu')

'''
# Load the instance segmentation model
seg_config_file = 'configs/mask_rcnn/mask_rcnn_r50_fpn_1x_coco.py'
seg_checkpoint_file = 'checkpoints/mask_rcnn_r50_fpn_1x_coco_20200205-d4b0c5d6.pth'
seg_model = init_detector(seg_config_file, seg_checkpoint_file, device='cpu')
'''
# Perform inference on the image to detect trees
image = '../samplePhotos/img7.jpg'
det_result = inference_detector(det_model, image)

# Assuming det_result is a DetDataSample object
# Access detections using appropriate method or attribute
detections = det_result.get('pred_instances').get('bboxes')
labels = det_result.get('pred_instances').get('labels')
scores = det_result.get('pred_instances').get('scores')

# Load the image using mmcv
image = mmcv.imread(image,channel_order='rgb')
visualizer = Visualizer(image=image)
# single bbox formatted as [xyxy]
# draw multiple bboxes
visualizer.draw_bboxes(torch.stack([bbox for (i, bbox) in enumerate(detections) if scores[i].item() > 0]))
visualizer.show()
