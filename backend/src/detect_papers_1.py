import sys
import cv2
import json
import base64


def detect_papers(image):
    """
    Detects papers in the image and returns a list of bounding boxes.
    Each bounding box is represented as (x1, y1, x2, y2).
    """
    try:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        papers = []
        for contour in contours:
            approx = cv2.approxPolyDP(contour, 0.02 * cv2.arcLength(contour, True), True)
            if len(approx) == 4 and cv2.isContourConvex(approx):
                x, y, w, h = cv2.boundingRect(approx)
                if w > 50 and h > 50:  # Filter out very small objects
                    papers.append((x, y, x + w, y + h))  # Top-left and bottom-right points
        return papers
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)


def draw_paper_boxes(image, papers, displaced_papers):
    """
    Draws boxes around papers: Green for unchanged, Red for displaced.
    """
    for paper in papers:
        x1, y1, x2, y2 = paper
        color = (0, 0, 255) if paper in displaced_papers else (0, 255, 0)  # Red for displaced, Green for unchanged
        cv2.rectangle(image, (x1, y1), (x2, y2), color, 3)  # Draw rectangle with thicker border
    return image


try:
    # Paths to the images passed as command-line arguments
    initial_image_path = sys.argv[1]
    final_image_path = sys.argv[2]
    
    # Load the initial and final images
    initial_image = cv2.imread(initial_image_path)
    final_image = cv2.imread(final_image_path)
    
    if initial_image is None or final_image is None:
        raise ValueError("Failed to load one or both images.")

    # Detect papers in both images
    initial_papers = detect_papers(initial_image)
    final_papers = detect_papers(final_image)

    # Identify displaced and unchanged papers
    displaced_initial = []
    for paper in initial_papers:
        x1, y1, x2, y2 = paper
        displaced = all(abs(x1 - fx1) >= 10 or abs(y1 - fy1) >= 10 for fx1, fy1, fx2, fy2 in final_papers)
        if displaced:
            displaced_initial.append(paper)

    displaced_final = []
    for paper in final_papers:
        x1, y1, x2, y2 = paper
        displaced = all(abs(x1 - ix1) >= 10 or abs(y1 - iy1) >= 10 for ix1, iy1, ix2, iy2 in initial_papers)
        if displaced:
            displaced_final.append(paper)

    # Draw rectangles on both images
    initial_image_with_boxes = draw_paper_boxes(initial_image.copy(), initial_papers, displaced_initial)
    final_image_with_boxes = draw_paper_boxes(final_image.copy(), final_papers, displaced_final)

    # Encode images to Base64
    _, initial_image_buffer = cv2.imencode('.png', initial_image_with_boxes)
    _, final_image_buffer = cv2.imencode('.png', final_image_with_boxes)

    initial_image_base64 = base64.b64encode(initial_image_buffer).decode('utf-8')
    final_image_base64 = base64.b64encode(final_image_buffer).decode('utf-8')

    # Output JSON structure remains unchanged
    print(json.dumps({
        'initial_image': initial_image_base64,
        'final_image': final_image_base64,
        'initial_papers': [
            {'id': idx + 1, 'status': 'mishandled' if paper in displaced_initial else 'unchanged', 'coordinates': paper}
            for idx, paper in enumerate(initial_papers)
        ],
        'final_papers': [
            {'id': idx + 1, 'status': 'mishandled' if paper in displaced_final else 'unchanged', 'coordinates': paper}
            for idx, paper in enumerate(final_papers)
        ]
    }))

except Exception as e:
    print(json.dumps({"error": str(e)}))
    sys.exit(1)
