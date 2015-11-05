class Product:
    def __init__(self, product_id, name, category_id):
        self.id = product_id
        self.name = name
        self.category_id = category_id

class ProductParameter:
    def __init__(self, product_id, name, value):
        self.product_id = product_id
        self.name = name
        self.value = value

class ProductCategory:
    def __init__(self, c_id, name):
        self.id = c_id
        self.name = name

class Review:
    def __init__(self, product_id, nickname, rating, text_review):
        self.product_id = product_id
        self.nickname = nickname
        self.rating = rating
        self.text_review = text_review
        self.features = []

class ReviewFeature:
    def __init__(self):
        self.name = ''
        self.rating = 0

