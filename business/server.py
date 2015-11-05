from flask import Flask, request, jsonify, send_from_directory
from model import *
from services import Repository

app = Flask(__name__)
repo = Repository()

@app.route('/app/<path:path>')
def index(path):
    return send_from_directory('../web', path)


@app.route('/products/', methods=['GET'])
def products():
    return jsonify({'products': repo.find_products()})

@app.route('/categories/<int:id>/', methods=['GET'])
def category(id):
    return jsonify(repo.find_category(id))

@app.route('/products/<int:id>/', methods=['GET'])
def product(id):
    return jsonify(repo.find_product(id))

@app.route('/products/<int:id>/reviews', methods=['GET', 'POST'])
def product_reviews(id):
    if request.method == 'GET':
        return jsonify({'reviews': repo.find_reviews(id)})
    else:
        return jsonify(request.json)


app.run(debug=True)
