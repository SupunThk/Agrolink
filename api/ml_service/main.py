import os
import io
import re
import numpy as np
from PIL import Image
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

# Use ai-edge-litert (TFLite) — no full TensorFlow needed
try:
    from ai_edge_litert.interpreter import Interpreter
except ImportError:
    # Fallback for older package name
    from tflite_runtime.interpreter import Interpreter

app = FastAPI(title="AgroLink Disease Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the TFLite model (converted from colorModelnew.keras via convert_model.py)
TFLITE_MODEL_PATH = os.path.join(os.path.dirname(__file__), "colorModel.tflite")

if not os.path.exists(TFLITE_MODEL_PATH):
    raise FileNotFoundError(
        f"TFLite model not found at {TFLITE_MODEL_PATH}. "
        "Run convert_model.py first using a Python 3.12 environment with TensorFlow installed."
    )

interpreter = Interpreter(model_path=TFLITE_MODEL_PATH)
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

IMG_SIZE = (224, 224)

# Provided labels
LABELS = [
    'Cherry_(including_sour)___Powdery_mildew',
    'Apple___Cedar_apple_rust',
    'Potato___Early_blight',
    'Potato___Late_blight',
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
    'Tomato___Spider_mites Two-spotted_spider_mite',
    'Orange___Haunglongbing_(Citrus_greening)',
    'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)',
    'Tomato___Bacterial_spot',
    'Pepper,_bell___Bacterial_spot',
    'Tomato___Septoria_leaf_spot',
    'Tomato___Late_blight',
    'Tomato___Target_Spot',
    'Apple___Black_rot',
    'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot',
    'Corn_(maize)___Northern_Leaf_Blight',
    'Squash___Powdery_mildew',
    'Corn_(maize)___Common_rust_',
    'Tomato___Early_blight',
    'Grape___Esca_(Black_Measles)',
    'Strawberry___Leaf_scorch',
    'Tomato___Leaf_Mold',
    'Apple___Apple_scab',
    'Peach___Bacterial_spot',
    'Tomato___Tomato_mosaic_virus',
    'Grape___Black_rot'
]


def normalize_label(label: str) -> str:
    return re.sub(r"[^a-z0-9]", "", label.lower())


def load_disease_data(file_path: str):
    if not os.path.exists(file_path):
        return {}

    with open(file_path, "r", encoding="utf-8") as f:
        lines = [line.rstrip() for line in f]

    data = {}
    idx = 0
    while idx < len(lines):
        line = lines[idx].strip()
        header_match = re.match(r"^\d+\.\s+(.+)$", line)
        if not header_match:
            idx += 1
            continue

        label = header_match.group(1).strip()
        idx += 1

        while idx < len(lines) and lines[idx].strip() != "Description":
            idx += 1
        idx += 1

        description_lines = []
        while idx < len(lines) and lines[idx].strip() != "Recommended Treatment":
            if lines[idx].strip():
                description_lines.append(lines[idx].strip())
            idx += 1

        idx += 1
        treatments = []
        while idx < len(lines):
            next_line = lines[idx].strip()
            if re.match(r"^\d+\.\s+.+$", next_line):
                break
            if next_line:
                treatments.append(next_line)
            idx += 1

        data[normalize_label(label)] = {
            "description": " ".join(description_lines).strip(),
            "treatment": treatments,
        }

    return data


DISEASE_DATA_PATH = os.path.join(os.path.dirname(__file__), "data.txt")
DISEASE_DATA = load_disease_data(DISEASE_DATA_PATH)

def format_disease_name(raw_label):
    parts = raw_label.split('___')
    if len(parts) == 2:
        plant = parts[0].replace('_', ' ').strip()
        disease = parts[1].replace('_', ' ').strip()
        return f"{plant} - {disease}"
    return raw_label.replace('_', ' ')

def preprocess_image(image_bytes):
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img = img.resize(IMG_SIZE)
    img_array = np.array(img, dtype=np.float32)
    img_array = np.expand_dims(img_array, axis=0) # add batch dimension
    return img_array

@app.get("/")
def read_root():
    return {"status": "ML Service is Online"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        
        # Preprocess
        input_data = preprocess_image(contents)
        
        # Run inference with TFLite interpreter
        interpreter.set_tensor(input_details[0]['index'], input_data)
        interpreter.invoke()
        output_data = interpreter.get_tensor(output_details[0]['index'])[0]
        
        predicted_idx = int(np.argmax(output_data))
        confidence = float(output_data[predicted_idx])
        
        if confidence < 0.90:
            return {
                "disease": "Unknown / Unrecognized",
                "raw_label": "unknown",
                "confidence": f"{int(confidence * 100)}%",
                "confidence_val": confidence,
                "is_healthy": False,
                "description": "We are not confident about this image. Please ensure you are uploading a clear image of a plant leaf.",
                "treatment": ["Try taking a photo in better lighting.", "Make sure the leaf is in focus and takes up most of the frame."],
            }
            
        raw_label = LABELS[predicted_idx] if predicted_idx < len(LABELS) else f"Unknown ({predicted_idx})"
        
        # Format for display
        formatted_name = format_disease_name(raw_label)
        disease_info = DISEASE_DATA.get(normalize_label(raw_label), {})
        description = disease_info.get(
            "description",
            f"The model detected '{formatted_name}' with {int(confidence * 100)}% confidence.",
        )
        treatment = disease_info.get(
            "treatment",
            [
                "Remove affected leaves to prevent spreading.",
                "Ensure proper air circulation around the plant.",
                "Water at the base to avoid wet foliage.",
                "Consult local agricultural expert for specific chemical controls.",
            ],
        )
        
        # Provide a basic generic treatment for placeholder purposes, real treatments should come from a DB
        # But we will supply a generic one based on the name so the frontend doesn't break
        is_healthy = "healthy" in raw_label.lower()
        
        return {
            "disease": formatted_name,
            "raw_label": raw_label,
            "confidence": f"{int(confidence * 100)}%",
            "confidence_val": confidence,
            "is_healthy": is_healthy,
            "description": description,
            "treatment": treatment if not is_healthy else ["Your plant looks perfectly healthy!", "Keep up the good work!"],
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
