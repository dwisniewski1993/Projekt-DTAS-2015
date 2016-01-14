from flask import jsonify

class Repository:
    def __init__(self, connection):
        self.connection = connection

# --------------

class CategoryRepository(Repository):
    def get_all(self):
        with self.connection.cursor() as cursor:
            sql = "SELECT * FROM categories"
            cursor.execute(sql)

            return jsonify({'categories': cursor.fetchall()})

    def get_attributes(self, category_id):
        with self.connection.cursor() as cursor:
            sql = "SELECT * FROM categories_attributes WHERE category_id = %s"
            cursor.execute(sql, (category_id,))

            return jsonify({'attributes': cursor.fetchall()})

    def get_products(self, category_id):
        with self.connection.cursor() as cursor:
            cursor.callproc('category', args=(category_id, ''))

            return jsonify({'products': cursor.fetchall()})

    def add(self, new_category):
        if not new_category['name']:
            return jsonify({'error': 'Pole nazwa nie może być puste'}), 400

        if not new_category['attributes']:
            return jsonify({'error': 'Kategoria musi mieć co najmniej 1 atrybut'}), 400

        with self.connection.cursor() as cursor:
            sql = "INSERT INTO categories(name) VALUES (%s)"
            cursor.execute(sql, (new_category['name'],))

            new_category_id = cursor.lastrowid
            sql = "INSERT INTO categories_attributes(category_id, name, value_type) VALUES (%s,%s,'string')"
            attributes = [(new_category_id, attr) for attr in new_category['attributes']]
            cursor.executemany(sql, attributes)
        self.connection.commit()        

        return '', 201 # Created

# --------------

class ProductRepository(Repository):
    def get(self, product_id):
        with self.connection.cursor() as cursor:
            sql = "SELECT * FROM products WHERE id = %s"
            cursor.execute(sql, (product_id,))
            product = cursor.fetchone()

            if product is None:
                return jsonify({'error':'Nie odnaleziono produktu'}), 404

            sql = '''SELECT name, value FROM product_attributes pa
                LEFT JOIN categories_attributes ca
                ON ca.id = pa.attribute_id
                WHERE product_id = %s'''

            cursor.execute(sql, (product_id,))            
            attributes = cursor.fetchall()

            product['attributes'] = attributes
            
            return jsonify(product)

    def add(self, prod):
        if not prod['name']:
            return jsonify({'error':'Nazwa produktu nie może być pusta'}), 400

        print(prod['attributes'])

        for key, value in prod['attributes'].items():
            if not value:
                return jsonify({'error':'Żaden z atrybutów nie może być pusty'}), 400

        with self.connection.cursor() as cursor:
            sql = "INSERT INTO products(name, category_id) VALUES (%s,%s)"
            cursor.execute(sql, (prod['name'], prod['category_id']))
            product_id = cursor.lastrowid

            sql = "INSERT INTO product_attributes VALUES (%s,%s,%s)"
            attributes_key_val = [(product_id,k,v) for k,v in prod['attributes'].items()]
            cursor.executemany(sql, attributes_key_val)
        self.connection.commit()        

        return '', 201

# --------------

class ReviewRepository(Repository):
    def get(self, product_id):
        with self.connection.cursor() as cursor:
            sql = "SELECT * FROM reviews WHERE product_id = %s"
            cursor.execute(sql, (product_id,))

            return jsonify({'reviews': cursor.fetchall()})

    def add(self, rev):
        if not rev['nick'] or not rev['comment']:
            return jsonify({'error':'Żadne z pól nie powinno być puste'}), 400 # Bad request

        with self.connection.cursor() as cursor:
            sql = "INSERT INTO reviews(product_id, nick, rating, comment) VALUES (%s, %s, %s, %s)"
            cursor.execute(sql, (rev['pid'], rev['nick'], rev['rating'], rev['comment']))
        self.connection.commit()

        return '', 201 # Created

# --------------

class UserRepository(Repository):
    def get(self, username):
        with self.connection.cursor() as cursor:
            sql = "SELECT `id`,`nick`,`mail` FROM users WHERE nick = %s"
            cursor.execute(sql, (username,))

            return jsonify(cursor.fetchone())

    def get_all(self):
        with self.connection.cursor() as cursor:
            sql = "SELECT `id`,`nick`,`mail` FROM users"
            cursor.execute(sql)

            return jsonify({'users': cursor.fetchall()})

    def get_reviews(self, username):
        with self.connection.cursor() as cursor:
            sql = '''SELECT p.id, name,comment,rating FROM reviews r 
            JOIN products p ON r.product_id = p.id
            WHERE nick = %s'''
            cursor.execute(sql, (username,))

            return jsonify({'reviews':cursor.fetchall()})

    def check_name_availability(self, data):
        with self.connection.cursor() as cursor:
            sql = "SELECT * FROM users WHERE nick = %s"
            if cursor.execute(sql, (data['username'],)):
                return False
            return True

    def check_email_availability(self, data):
        with self.connection.cursor() as cursor:
            sql = "SELECT * FROM users WHERE mail = %s"
            if cursor.execute(sql, (data['email'],)):
                return False
            return True

    def auth(self, username, password):
        with self.connection.cursor() as cursor:
            sql = "SELECT * FROM users WHERE `nick` = %s AND `password` = MD5(%s)"
            if cursor.execute(sql, (username,password)):
                return True
            return False

    def add(self, user):
        with self.connection.cursor() as cursor:
            sql = "INSERT INTO users(`nick`, `mail`, `password`) VALUES (%s, %s, MD5(%s))"
            cursor.execute(sql, (user['username'], user['email'], user['password']))
        self.connection.commit()

        return '', 201 # Created