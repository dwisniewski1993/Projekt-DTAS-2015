DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS product_attributes;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS categories_attributes;
DROP TABLE IF EXISTS reviews;

CREATE TABLE products (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `category_id` INT NOT NULL
);
  
CREATE TABLE product_attributes (
  `product_id` INT NOT NULL,
    `attribute_id` INT NOT NULL,
  `value` VARCHAR(100) NOT NULL
);
   
CREATE TABLE categories (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(200) NOT NULL
);

CREATE TABLE categories_attributes (
  `id` INT PRIMARY KEY AUTO_INCREMENT,  
  `category_id` INT NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `value_type` ENUM('numeric', 'boolean', 'string')
);

CREATE TABLE reviews (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `product_id` INT NOT NULL,
  `nick` VARCHAR(255) NOT NULL,
  `rating` INT NOT NULL,
  `comment` TEXT NOT NULL
);

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
