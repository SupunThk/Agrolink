import sys
import tensorflow as tf
import os

print(f"TensorFlow version: {tf.__version__}")

keras_model_path = os.path.join(os.path.dirname(__file__), "colorModelnewmobilenet.keras")
tflite_model_path = os.path.join(os.path.dirname(__file__), 'colorModelnewmobilenet.tflite')

print(f"Loading keras model from {keras_model_path}...")
model = tf.keras.models.load_model(keras_model_path)

print(f"Model Input shape: {model.input_shape}")
input_shape = model.input_shape

print("Converting to TFLite...")
converter = tf.lite.TFLiteConverter.from_keras_model(model)
tflite_model = converter.convert()

print(f"Saving TFLite model to {tflite_model_path}...")
with open(tflite_model_path, 'wb') as f:
    f.write(tflite_model)

print("Conversion complete!")
with open(os.path.join(os.path.dirname(__file__), 'model_info.txt'), 'w') as f:
    f.write(str(input_shape))
