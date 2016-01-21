from flask import Flask, request, jsonify, session, redirect
from functools import wraps
import dao
import pymysql

connection = pymysql.connect(host='46.101.220.96', user='root', password='projekt tas', db='tas', charset='utf8', cursorclass=pymysql.cursors.DictCursor)
app = Flask(__name__, static_url_path='/static', static_folder='../web/')

reviews = dao.ReviewRepository(connection)
categories = dao.CategoryRepository(connection)
products = dao.ProductRepository(connection)
users = dao.UserRepository(connection)

# ------------

def login_required(fn):
    @wraps(fn)
    def inner(*args, **kwargs):
        if session.get('username'):
            return fn(*args, **kwargs)
        return jsonify({'error': 'Wymagana autentykacja'}), 401
    return inner

# ------------

@app.route('/api/categories/', methods=['GET'])
def get_categories():
    return categories.get_all()

@app.route('/api/categories/', methods=['POST'])
@login_required
def add_category():
    return categories.add(request.json)

@app.route('/api/categories/<int:category_id>/attributes')
def categories_attributes(category_id):
    return categories.get_attributes(category_id)

@app.route('/api/categories/<int:category_id>/products')
def get_category_products(category_id):
    return categories.get_products(category_id)

# ------------

@app.route('/api/products/', methods=['POST'])
@login_required
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
@login_required
def add_review():
    return reviews.add(request.json)

# ------------

@app.route('/api/users', methods=['GET', 'POST'])
def get_add_users():
    if request.method == 'GET':
        return users.get_all()
    elif request.method == 'POST':
        return users.add(request.json)

@app.route('/api/users/<user_id>')
def get_user(user_id):
    return users.get(user_id)

@app.route('/api/users/<user_id>/reviews')
def get_user_reviews(user_id):
    return users.get_reviews(user_id)

@app.route('/api/availability/name', methods=['POST'])
def check_username():
    if users.check_name_availability(request.json):
        return jsonify({'available': True})
    return jsonify({'error': 'Istnieje taka nazwa użytkownika'})

@app.route('/api/availability/email', methods=['POST'])
def check_useremail():
    if users.check_email_availability(request.json):
        return jsonify({'available': True})
    return jsonify({'error': 'Ten adres jest przypisany do istniejącego konta'})

@app.route('/login', methods=['POST'])
def login():
    if users.auth(request.json['username'], request.json['password']):
        session['username'] = request.json['username']
        return '', 200
    else:
        return '', 401

@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect('/')

@app.route('/session')
def get_session():
    return session.get('username') or ('', 404)

# ------------

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def index(path):
    return app.send_static_file('index.html')

app.secret_key = '87nc#@91n,uj103$h)khkc-0'
app.run(debug=True)
