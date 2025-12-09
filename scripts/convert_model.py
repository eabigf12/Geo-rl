#!/usr/bin/env python3
"""
Script to inspect and convert TFLite model to TensorFlow.js format
"""
import tensorflow as tf
import os
import json

MODEL_PATH = "attached_assets/model_(4)_(4)_1765304593887.tflite"
OUTPUT_DIR = "client/public/model"

def inspect_tflite_model(model_path):
    """Inspect the TFLite model and print its details"""
    print(f"\n{'='*60}")
    print(f"Inspecting TFLite Model: {model_path}")
    print(f"{'='*60}\n")
    
    # Load the TFLite model
    interpreter = tf.lite.Interpreter(model_path=model_path)
    interpreter.allocate_tensors()
    
    # Get input details
    input_details = interpreter.get_input_details()
    print("INPUT DETAILS:")
    for i, inp in enumerate(input_details):
        print(f"  Input {i}:")
        print(f"    Name: {inp['name']}")
        print(f"    Shape: {inp['shape']}")
        print(f"    Type: {inp['dtype']}")
    
    print()
    
    # Get output details
    output_details = interpreter.get_output_details()
    print("OUTPUT DETAILS:")
    for i, out in enumerate(output_details):
        print(f"  Output {i}:")
        print(f"    Name: {out['name']}")
        print(f"    Shape: {out['shape']}")
        print(f"    Type: {out['dtype']}")
    
    # Check for labels/metadata
    print(f"\n{'='*60}")
    print("MODEL METADATA (if available):")
    print(f"{'='*60}\n")
    
    try:
        # Try to get model metadata
        with open(model_path, 'rb') as f:
            model_content = f.read()
            # Look for string patterns that might be class labels
            # Common patterns in TFLite models with embedded labels
            
        # Check tensor details for label info
        tensor_details = interpreter.get_tensor_details()
        for tensor in tensor_details:
            if 'label' in tensor['name'].lower() or 'class' in tensor['name'].lower():
                print(f"  Found potential label tensor: {tensor['name']}")
                print(f"    Shape: {tensor['shape']}")
                
    except Exception as e:
        print(f"  Could not extract metadata: {e}")
    
    # Infer number of classes from output shape
    num_classes = output_details[0]['shape'][-1]
    print(f"\nNumber of output classes: {num_classes}")
    
    return {
        'input_shape': list(input_details[0]['shape']),
        'output_shape': list(output_details[0]['shape']),
        'input_dtype': str(input_details[0]['dtype']),
        'output_dtype': str(output_details[0]['dtype']),
        'num_classes': int(num_classes)
    }

def convert_to_tfjs(model_path, output_dir):
    """Convert TFLite model to TensorFlow.js format"""
    print(f"\n{'='*60}")
    print(f"Converting to TensorFlow.js format...")
    print(f"{'='*60}\n")
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    try:
        # Method 1: Try using tensorflowjs converter directly on TFLite
        import tensorflowjs as tfjs
        
        # For TFLite models, we need to convert via SavedModel format
        # First, let's create a simple wrapper
        
        # Load TFLite model
        interpreter = tf.lite.Interpreter(model_path=model_path)
        interpreter.allocate_tensors()
        
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()
        
        input_shape = input_details[0]['shape']
        
        # Create a Keras model that wraps the TFLite interpreter
        # This is a workaround since TFLite doesn't directly convert to TFJS
        
        print(f"  Input shape: {input_shape}")
        print(f"  Output shape: {output_details[0]['shape']}")
        
        # For TFJS, we'll save the TFLite model directly and use tfjs-tflite runtime
        # OR create a JSON config for custom loader
        
        # Copy the TFLite model to public folder for direct loading
        import shutil
        tflite_dest = os.path.join(output_dir, "model.tflite")
        shutil.copy(model_path, tflite_dest)
        print(f"  Copied TFLite model to: {tflite_dest}")
        
        # Create a model config JSON
        config = {
            "format": "tflite",
            "modelFile": "model.tflite",
            "inputShape": list(map(int, input_shape)),
            "outputShape": list(map(int, output_details[0]['shape'])),
            "numClasses": int(output_details[0]['shape'][-1])
        }
        
        config_path = os.path.join(output_dir, "model_config.json")
        with open(config_path, 'w') as f:
            json.dump(config, f, indent=2)
        print(f"  Created config file: {config_path}")
        
        print("\n✅ Model prepared for TensorFlow.js!")
        return config
        
    except Exception as e:
        print(f"❌ Conversion error: {e}")
        raise

if __name__ == "__main__":
    # Check if model exists
    if not os.path.exists(MODEL_PATH):
        print(f"❌ Model not found at: {MODEL_PATH}")
        exit(1)
    
    # Inspect the model
    model_info = inspect_tflite_model(MODEL_PATH)
    
    # Convert to TFJS format
    config = convert_to_tfjs(MODEL_PATH, OUTPUT_DIR)
    
    print(f"\n{'='*60}")
    print("SUMMARY")
    print(f"{'='*60}")
    print(f"Model Info: {json.dumps(model_info, indent=2)}")
    print(f"\nFiles created in: {OUTPUT_DIR}")
