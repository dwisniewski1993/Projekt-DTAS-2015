from flask import Flask, request, jsonify, send_from_directory
from model import *
from services import Repository
import pymysql

connection = pymysql.connect(host='46.101.220.96', user='root', password='projekt tas', db='tas', charset='utf8', cursorclass=pymysql.cursors.DictCursor)
app = Flask(__name__, static_url_path='/static', static_folder='../web/')


@app.route('/api/categories/', methods=['GET', 'POST'])
def get_categories():
    if request.method == 'GET':
        with connection.cursor() as cursor:
            sql = "SELECT * FROM categories"
            cursor.execute(sql)

            return jsonify({'categories': cursor.fetchall()})
    else:
        new_category = request.json
        with connection.cursor() as cursor:
            sql = "INSERT INTO categories(name) VALUES (%s)"
            cursor.execute(sql, (new_category['name'],))
            sql = "INSERT INTO categories_attributes(category_id, name, value_type) VALUES (%s,%s,'string')"
            cursor.executemany(sql, [(cursor.lastrowid,a) for a in new_category['attributes']])
        connection.commit()        

        return jsonify({'status':'ok'})

@app.route('/api/categories/<int:category_id>/')
def get_category(category_id):
    with connection.cursor() as cursor:
        sql = "SELECT name FROM categories WHERE id = %s"
        cursor.execute(sql, (category_id,))

        return jsonify(cursor.fetchone())


@app.route('/api/categories/<int:category_id>/attributes')
def categories_attributes(category_id):
    with connection.cursor() as cursor:
        sql = "SELECT * FROM categories_attributes WHERE category_id = %s"
        cursor.execute(sql, (category_id,))

        return jsonify({'attributes': cursor.fetchall()})


@app.route('/api/products/', methods=['POST'])
def add_product():
    new = request.json
    with connection.cursor() as cursor:
        sql = "INSERT INTO products(name, category_id) VALUES (%s,%s)"
        cursor.execute(sql, (new['name'],new['category_id']))
        sql = "INSERT INTO product_attributes VALUES (%s,%s,%s)"
        cursor.executemany(sql, [(cursor.lastrowid,k,v) for k,v in new['attributes'].items()])
    connection.commit()        

    return jsonify({'status':'ok'})

@app.route('/api/products/<int:product_id>/')
def get_product(product_id):
    with connection.cursor() as cursor:
        sql = "SELECT * FROM products WHERE id = %s"
        cursor.execute(sql, (product_id,))
        product = cursor.fetchone()

        sql = '''SELECT name, value FROM product_attributes pa
            LEFT JOIN categories_attributes ca
            ON ca.id = pa.attribute_id
            WHERE product_id = %s'''

        cursor.execute(sql, (product_id,))            
        attributes = cursor.fetchall()

        product['attributes'] = attributes
        
        return jsonify(product)


@app.route('/api/products/<int:product_id>/reviews')
def get_product_reviews(product_id):
    with connection.cursor() as cursor:
        sql = "SELECT * FROM reviews WHERE product_id = %s"
        cursor.execute(sql, (product_id,))

        return jsonify({'reviews': cursor.fetchall()})

@app.route('/api/reviews/', methods=['POST'])
def add_review():
    rev = request.json
    with connection.cursor() as cursor:
        sql = "INSERT INTO reviews(product_id, nick, rating, comment) VALUES (%s, %s, %s, %s)"
        cursor.execute(sql, (rev['pid'], rev['nick'], rev['rating'], rev['comment']))
    connection.commit()        

    return jsonify({'status':'ok'})

@app.route('/api/categories/<int:category_id>/products')
def get_category_products(category_id):
    with connection.cursor() as cursor:
        cursor.callproc('category', args=(category_id, ''))
        return jsonify({'products': cursor.fetchall()})


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def index(path):
    return app.send_static_file('index.html')

app.run(debug=True)
