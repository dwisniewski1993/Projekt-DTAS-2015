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
  `grade` INT NULL CHECK (grade <= 100),                                              
  `how_many_products` INT NULL, 
  `how_many_comments` INT NULL
);
-- wszystkie CONSTRAINT wyrzucam na zewnatrz, 
-- bo w phpMyAdmin nie chce mi si z nimi nic wykonać a nie wiem jak to jest w twojej bazie
-- uzytkownicy dodaja produkty (i usugi)
-- CONSTRAINT ck_users_nick 
-- CONSTRAINT ck_users_mail
-- CONSTRAINT ck_users_grade 
-- grade - ocena jakosci produktow(uslug) uzytkownika
-- how-many_products ilosc produktow(uslug) uzytkownika

CREATE TABLE comments(
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `commentator` VARCHAR(200),
  `judged` VARCHAR(200) REFERENCES users(id),
  `head` VARCHAR(100) NULL,
  `comment` TEXT NOT NULL,
  `grade` INT NOT NULL CHECK (grade <= 100)
)
 -- id numer komentarza
 --commentator - osoba która dodaje komentarz
 -- judgeg - użytkownik któemu jest przyznana ocena
 -- head - naguwek komentarza
 -- comment - treć komentarza, wyjanienie oceny
 -- grade - przyznana ocena
 
 
CREATE TABLE products (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `category_id` INT NOT NULL,
  `maker` VARCHAR(30) NOT NULL REFERENCES users(id),
  `trust` INT CHECK (trust <= 100),
  `comment` INT NULL,
  `value_type`  VARCHAR(7) CHECK (value_type in ('service', 'product')),
  `short_description` VARCHAR(150),                                                                    
  `long_description` text                                                                             
);
--CONSTRAINT ck_product_maker   jaki uzytkownik to wystawia
--CONSTRAINT ck_product_value_type   jest to serwis, czy usluga
-- short - krotki opis np w liscie z wyniku wyszukiwania
-- long - dlugi opis na stronie produktu
-- trust - srednia ocena produktu wyliczana z glownych ocen komentarzy
-- comment - iloć komentarzy
  
  
CREATE TABLE product_attributes (
  `product_id` INT NOT NULL REFERENCES products(id),
    `attribute_id` INT NOT NULL,
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
  `rating` INT NOT NULL CHECK (rating <= 100),
    `price` INT NOT NULL CHECK (price <= 100),
    `use_fast` INT NOT NULL CHECK (use_fast <= 100),
    `material_nice` INT NOT NULL CHECK (material_nice <= 100),
  `head` VARCHAR(100) NULL,
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
