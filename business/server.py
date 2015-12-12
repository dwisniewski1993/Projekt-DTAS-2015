from flask import Flask, request, jsonify
import dao
import pymysql

connection = pymysql.connect(host='46.101.220.96', user='root', password='projekt tas', db='tas', charset='utf8', cursorclass=pymysql.cursors.DictCursor)
app = Flask(__name__, static_url_path='/static', static_folder='../web/')

reviews = dao.ReviewRepository(connection)
categories = dao.CategoryRepository(connection)
products = dao.ProductRepository(connection)

# ------------

@app.route('/api/categories/', methods=['GET', 'POST'])
def get_categories():
    if request.method == 'GET':
        return categories.get_all()
    elif request.method == 'POST':
        return categories.add(request.json)

@app.route('/api/categories/<int:category_id>/attributes')
def categories_attributes(category_id):
    return categories.get_attributes(category_id)

@app.route('/api/categories/<int:category_id>/products')
def get_category_products(category_id):
    return categories.get_products(category_id)

# ------------

@app.route('/api/products/', methods=['POST'])
def add_product():
    return products.add(request.json)

@app.route('/api/products/<int:product_id>/')
def get_product(product_id):
    return products.get(product_id)

# ------------

@app.route('/api/products/<int:product_id>/reviews')
def get_product_reviews(product_id):
    return reviews.get(product_id)

@app.route('/api/reviews/', methods=['POST'])
def add_review():
    return reviews.add(request.json)

# ------------

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def index(path):
    return app.send_static_file('index.html')

app.run(debug=True)
