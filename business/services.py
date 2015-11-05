from model import ProductCategory, Review, Product
from flask import abort

class Repository:
    def __init__(self):
        self.products = []
        self.products.append(Product(1, 'Gigabyte GeForce GTX 970', 1).__dict__)
        self.products.append(Product(2, 'Karta graficzna MSI Radeon R7 370', 1).__dict__)

        self.categories = []
        self.categories.append(ProductCategory(1, 'Karty Graficzne').__dict__)

        self.reviews = []
        self.reviews.append(Review(2, 'Łukasz', 5, 'Grafika daje rade pomimo szyny 128 bit można fajnie pograć w najnowsze tytuły na fool detalach. Przeskok wydajności z mojeje starej poczciwej HD 5770 ogromny ;)').__dict__)
        self.reviews.append(Review(2, 'Adrian', 4.5, 'Karta jest super! W Wieśku 2 przy wysokich wymaganiach FPS utrzymują się na 60. W CS:GO stale 400 na najwyższych wymaganiach (dodam, że mój procesor to i5 4570). Naprawdę dobry wybór: wydajna jak i cicha.').__dict__)

    def find_products(self):
        return self.products

    def find_product(self, p_id):
        for product in self.products:
            if product['id'] == p_id:
                return product
        abort(404)  

    def find_category(self, c_id):
        for category in self.categories:
            if category['id'] == c_id:
                return category
        abort(404) 

    def find_reviews(self, p_id):
        return [r for r in self.reviews if r['product_id'] == p_id]

    def add_product(self, product_data):
        pass