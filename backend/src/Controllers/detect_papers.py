import sys
import cv2
import json

# Read image paths from arguments
initial_image_path = sys.argv[1]
final_image_path = sys.argv[2]

# Function to detect papers in an image
def detect_papers(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    papers = []
    for contour in contours:
        approx = cv2.approxPolyDP(contour, 0.02 * cv2.arcLength(contour, True), True)
        if len(approx) == 4 and cv2.isContourConvex(approx):
            x, y, w, h = cv2.boundingRect(approx)
            if 0.8 < w / h < 1.2:  # Filter rectangular shapes (aspect ratio)
                papers.append((x, y, x + w, y + h))
    return papers

# Read and process images
initial_image = cv2.imread(initial_image_path)
final_image = cv2.imread(final_image_path)

initial_papers = detect_papers(initial_image)
final_papers = detect_papers(final_image)

# Compare papers and determine status
results = []
for idx, (x1, y1, x2, y2) in enumerate(initial_papers):
    displaced = True
    for fx1, fy1, fx2, fy2 in final_papers:
        if abs(x1 - fx1) < 10 and abs(y1 - fy1) < 10:
            displaced = False
            break
    results.append({
        'id': idx + 1,
        'status': 'mishandled' if displaced else 'unchanged',
        'coordinates': [x1, y1, x2, y2]
    })

# Output results as JSON
print(json.dumps({ 'papers': results }))