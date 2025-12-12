"""
Flask server to run TFLite model inference for Turkish Landmark classifier
Serves predictions to the browser-based React app
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import base64

app = Flask(__name__)
CORS(app)  # Enable CORS for browser requests

# The 9 Turkish landmark classes (must match training order)
CLASS_LABELS = [
    'Peri Bacaları',
    'Divlit Volkan Konileri',
    'Bazalt Sütunları',
    'Lav Akıntıları',
    'Acısu Ofiyolitleri',
    'Acısu Madensuyu ve Emir Kaplıcaları',
    'Tarihi Kula Evleri',
    'Kurşunlu Camii',
    'Bilgilendirme Panoları'
]

# Load TFLite model
interpreter = None

def load_tflite_model(model_path='client/public/model/model.tflite'):
    """Load TFLite model and allocate tensors"""
    global interpreter
    try:
        interpreter = tf.lite.Interpreter(model_path=model_path)
        interpreter.allocate_tensors()
        print(f"✅ TFLite model loaded from {model_path}")
        
        # Get input and output details
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()
        
        print(f"📊 Input shape: {input_details[0]['shape']}")
        print(f"📊 Output shape: {output_details[0]['shape']}")
        
        return True
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return False

def preprocess_image(image_data):
    """
    Preprocess image for model input
    Expected input: 224x224 RGB image normalized to [0, 1]
    """
    # Open image from bytes
    image = Image.open(io.BytesIO(image_data))
    
    # Convert to RGB if necessary
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # Resize to 224x224
    image = image.resize((224, 224))
    
    # Convert to numpy array
    img_array = np.array(image, dtype=np.float32)
    
    # Normalize to [0, 1]
    img_array = img_array / 255.0
    
    # Add batch dimension [1, 224, 224, 3]
    img_array = np.expand_dims(img_array, axis=0)
    
    return img_array

def run_inference(image_array):
    """Run inference on preprocessed image"""
    if interpreter is None:
        raise ValueError("Model not loaded")
    
    # Get input and output tensors
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    
    # Set input tensor
    interpreter.set_tensor(input_details[0]['index'], image_array)
    
    # Run inference
    interpreter.invoke()
    
    # Get output tensor
    output_data = interpreter.get_tensor(output_details[0]['index'])
    
    return output_data[0]  # Remove batch dimension

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': interpreter is not None,
        'num_classes': len(CLASS_LABELS)
    })

@app.route('/predict', methods=['POST'])
def predict():
    """
    Prediction endpoint
    Expects JSON with base64 encoded image or multipart/form-data with image file
    """
    try:
        # Check if model is loaded
        if interpreter is None:
            return jsonify({'error': 'Model not loaded'}), 500
        
        # Get image data
        if 'image' in request.files:
            # Multipart form data
            image_file = request.files['image']
            image_data = image_file.read()
        elif request.json and 'image' in request.json:
            # Base64 encoded image in JSON
            base64_image = request.json['image']
            # Remove data URL prefix if present
            if ',' in base64_image:
                base64_image = base64_image.split(',')[1]
            image_data = base64.b64decode(base64_image)
        else:
            return jsonify({'error': 'No image provided'}), 400
        
        # Preprocess image
        img_array = preprocess_image(image_data)
        
        # Run inference
        predictions = run_inference(img_array)
        
        # Apply softmax if needed (TFLite models sometimes don't include it)
        predictions = tf.nn.softmax(predictions).numpy()
        
        # Get top 3 predictions
        top_indices = np.argsort(predictions)[-3:][::-1]
        
        top_classes = [
            {
                'name': CLASS_LABELS[idx],
                'percentage': float(predictions[idx] * 100),
                'confidence': float(predictions[idx])
            }
            for idx in top_indices
        ]
        
        # Get top prediction
        top_idx = top_indices[0]
        
        result = {
            'success': True,
            'prediction': {
                'name': CLASS_LABELS[top_idx],
                'confidence': float(predictions[top_idx]),
                'percentage': float(predictions[top_idx] * 100)
            },
            'top_classes': top_classes,
            'all_predictions': {
                CLASS_LABELS[i]: float(predictions[i])
                for i in range(len(CLASS_LABELS))
            }
        }
        
        return jsonify(result)
        
    except Exception as e:
        print(f"❌ Prediction error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/classes', methods=['GET'])
def get_classes():
    """Get list of all classes"""
    return jsonify({
        'classes': CLASS_LABELS,
        'num_classes': len(CLASS_LABELS)
    })

if __name__ == '__main__':
    print("🚀 Starting Turkish Landmark Classification Server...")
    
    # Load the model
    model_loaded = load_tflite_model()
    
    if not model_loaded:
        print("⚠️ Warning: Model not loaded. Server will start but predictions will fail.")
        print("💡 Make sure model.tflite is in client/public/model/")
    
    print("\n📍 Server endpoints:")
    print("   GET  /health  - Health check")
    print("   GET  /classes - List all classes")
    print("   POST /predict - Make predictions")
    print("\n🌐 Server running on http://localhost:5000")
    print("   Use this URL in your React app\n")
    
    # Run Flask server
    app.run(host='0.0.0.0', port=5001, debug=True)


