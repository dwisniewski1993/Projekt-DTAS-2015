DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS product_attributes;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS categories_attributes;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS users; 

CREATE TABLE users (                                             
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `nick` VARCHAR(200) NOT NULL UNIQUE,  
  `mail` VARCHAR(100) NOT NULL UNIQUE,  
  `password` VARCHAR(100) NOT NULL
);
-- wszystkie CONSTRAINT wyrzucam na zewnatrz, 
-- bo w phpMyAdmin nie chce mi si z nimi nic wykonać a nie wiem jak to jest w twojej bazie
-- uzytkownicy dodaja produkty (i usugi)
-- CONSTRAINT ck_users_nick 
-- CONSTRAINT ck_users_mail
-- CONSTRAINT ck_users_grade 
 
CREATE TABLE products (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `category_id` INT NOT NULL REFERENCES categories(id)
);
--CONSTRAINT ck_product_maker   jaki uzytkownik to wystawia
--CONSTRAINT ck_product_value_type   jest to serwis, czy usluga
-- short - krotki opis np w liscie z wyniku wyszukiwania
-- long - dlugi opis na stronie produktu
-- trust - srednia ocena produktu wyliczana z glownych ocen komentarzy
-- comment - iloć komentarzy
-- price - cena produktu/usugi
  
  
CREATE TABLE product_attributes (
  `product_id` INT NOT NULL REFERENCES products(id),
  `attribute_id` INT NOT NULL REFERENCES categories_attributes(id),
  `value` VARCHAR(100) NOT NULL
);
   
CREATE TABLE categories (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(200) NOT NULL
);

CREATE TABLE categories_attributes (
  `id` INT PRIMARY KEY AUTO_INCREMENT,  
  `category_id` INT NOT NULL  REFERENCES categories(id), 
  `name` VARCHAR(200) NOT NULL,
  `value_type` ENUM('numeric', 'boolean', 'string')
);
--CONSTRAINT ck_categories_attributes_category_id

CREATE TABLE reviews (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `product_id` INT NOT NULL  REFERENCES products(id), 
  `nick` VARCHAR(255) NOT NULL,
  `rating` INT NOT NULL,
  `comment` TEXT NOT NULL
);
--CONSTRAINT ck_reviews_product_id
-- rating - ocena srednia wyliczana z trzech ponizszych
  -- price - czy cena jest adekwatna
  -- use - czy produkt używa sie sprawnie, wygodnie / fast - czy usuga bya wykonana szybko i sprawnie
  -- material - czy produkt jest z porzdnego tworzywa  / nice -- czy pan i pani od usugo byli mili
-- head - naglowek komentarza na stronie w liscie widoczne naglowki i ocena rating, reszta po rozwinieciu
-- comment - wlasciwy komentarz
-------

DROP PROCEDURE IF EXISTS category;

DELIMITER //
CREATE PROCEDURE category(id INT, filter TEXT)
BEGIN
  SET @category_id = id;
  SET @sql = NULL;

  SELECT GROUP_CONCAT(CONCAT(
      'MAX(IF(ca.name = ''', name, ''', a.value, NULL)) AS ''', name, ''''
    )) into @sql FROM categories_attributes WHERE category_id = @category_id;
    

  SET @sql = CONCAT(
    'SELECT * FROM (
      SELECT p.id, p.name, ', @sql, ' 
      FROM products p
      LEFT JOIN product_attributes AS a ON a.product_id = p.id
      LEFT JOIN categories_attributes AS ca ON ca.id = a.attribute_id
      WHERE p.category_id = ', @category_id,
      ' GROUP BY p.id',
    ') category ', filter
  );

  PREPARE stmt FROM @sql;
  EXECUTE stmt;
  DEALLOCATE PREPARE stmt;
END//
DELIMITER ;
