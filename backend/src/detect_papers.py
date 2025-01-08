import sys
import cv2
import json

def detect_papers(image):
    try:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        papers = []
        for contour in contours:
            approx = cv2.approxPolyDP(contour, 0.02 * cv2.arcLength(contour, True), True)
            if len(approx) == 4 and cv2.isContourConvex(approx):
                x, y, w, h = cv2.boundingRect(approx)
                if 0.8 < w / h < 1.2:  # Rectangular aspect ratio filter
                    papers.append((x, y, x + w, y + h))
        return papers
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

try:
    initial_image_path = sys.argv[1]
    final_image_path = sys.argv[2]

    initial_image = cv2.imread(initial_image_path)
    final_image = cv2.imread(final_image_path)

    if initial_image is None or final_image is None:
        raise ValueError("Failed to load one or both images.")

    initial_papers = detect_papers(initial_image)
    final_papers = detect_papers(final_image)

    results = []
    for idx, (x1, y1, x2, y2) in enumerate(initial_papers):
        displaced = all(abs(x1 - fx1) >= 10 or abs(y1 - fy1) >= 10 for fx1, fy1, fx2, fy2 in final_papers)
        results.append({
            'id': idx + 1,
            'status': 'mishandled' if displaced else 'unchanged',
            'coordinates': [x1, y1, x2, y2]
        })

    print(json.dumps({ 'papers': results }))
except Exception as e:
    print(json.dumps({"error": str(e)}))
    sys.exit(1)
