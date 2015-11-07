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