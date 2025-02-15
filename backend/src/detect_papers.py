import sys
import cv2
import json
import base64

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

def highlight_corners(image, papers):
    for paper in papers:
        x1, y1, x2, y2 = paper
        cv2.circle(image, (x1, y1), 5, (0, 0, 255), -1)  # Top-left corner
        cv2.circle(image, (x2, y1), 5, (0, 0, 255), -1)  # Top-right corner
        cv2.circle(image, (x1, y2), 5, (0, 0, 255), -1)  # Bottom-left corner
        cv2.circle(image, (x2, y2), 5, (0, 0, 255), -1)  # Bottom-right corner
    return image

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

    final_results = []
    for idx, (x1, y1, x2, y2) in enumerate(final_papers):
        displaced = all(abs(x1 - ix1) >= 10 or abs(y1 - iy1) >= 10 for ix1, iy1, ix2, iy2 in initial_papers)
        final_results.append({
            'id': idx + 1,
            'status': 'mishandled' if displaced else 'unchanged',
            'coordinates': [x1, y1, x2, y2]
        })

    initial_edges = cv2.Canny(cv2.cvtColor(initial_image, cv2.COLOR_BGR2GRAY), 50, 150)
    final_edges = cv2.Canny(cv2.cvtColor(final_image, cv2.COLOR_BGR2GRAY), 50, 150)

    initial_image_with_corners = highlight_corners(cv2.cvtColor(initial_edges, cv2.COLOR_GRAY2BGR), initial_papers)
    final_image_with_corners = highlight_corners(cv2.cvtColor(final_edges, cv2.COLOR_GRAY2BGR), final_papers)

    _, initial_image_buffer = cv2.imencode('.png', initial_image_with_corners)
    _, final_image_buffer = cv2.imencode('.png', final_image_with_corners)

    initial_image_base64 = base64.b64encode(initial_image_buffer).decode('utf-8')
    final_image_base64 = base64.b64encode(final_image_buffer).decode('utf-8')

    print(json.dumps({
        'initial_image': initial_image_base64,
        'final_image': final_image_base64,
        'initial_papers': results,
        'final_papers': final_results
    }))
except Exception as e:
    print(json.dumps({"error": str(e)}))
    sys.exit(1)
