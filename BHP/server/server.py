from flask import Flask, request, jsonify # type: ignore
import util # type: ignore
import os

# Point Flask to the outside client directory
current_dir = os.path.dirname(os.path.abspath(__file__))
client_dir = os.path.join(os.path.dirname(current_dir), 'client')
app = Flask(__name__, static_folder=client_dir, static_url_path='')

@app.route('/')
def serve_index():
    return app.send_static_file('index.html')

@app.route('/predict.html')
def serve_predict():
    return app.send_static_file('predict.html')

@app.route('/get_location_names', methods=['GET'])
def get_location_names():
    response = jsonify({
        'locations': util.get_location_names()
    })
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response

@app.route('/predict_home_price', methods=['GET', 'POST'])
def predict_home_price():
    total_sqft = float(request.form['total_sqft'])
    location = request.form['location']
    bhk = int(request.form['bhk'])
    bath = int(request.form['bath'])

    response = jsonify({
        'estimated_price': util.get_estimated_price(location,total_sqft,bhk,bath)
    })
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response

if __name__ == "__main__":
    print("Starting Python Flask Server For Home Price Prediction...")
    util.load_saved_artifacts()
    app.run()