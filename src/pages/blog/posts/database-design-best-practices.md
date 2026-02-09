---
layout: /src/layouts/MarkdownPostLayout.astro
title: Database Design Best Practices for Web Applications
author: Kaushal Kulkarni
description: "Learn essential database design principles and best practices for building scalable web applications. Covering normalization, indexing, relationships, and performance optimization."
image:
  url: "/images/posts/database-design.webp"
  alt: "Database schema diagram showing tables, relationships, and indexes for a web application"
pubDate: 2025-01-25
tags:
  [
    "Database", "SQL", "MySQL", "PostgreSQL", "Backend"
  ]
languages: ["sql", "php", "python", "javascript"]
---

A well-designed database is the foundation of any scalable web application. Poor database design can lead to performance issues, data inconsistencies, and maintenance nightmares. Let's explore the best practices for designing robust databases.

## Fundamental Principles

### 1. Normalization

Normalization organizes data to reduce redundancy and improve data integrity:

```sql
-- Before normalization (poor design)
CREATE TABLE orders (
    id INT PRIMARY KEY,
    customer_name VARCHAR(100),
    customer_email VARCHAR(100),
    customer_address TEXT,
    product_name VARCHAR(100),
    product_price DECIMAL(10,2),
    quantity INT
);

-- After normalization (good design)
CREATE TABLE customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

### 2. Proper Data Types

Choose appropriate data types for optimal performance:

```sql
-- Good practices
CREATE TABLE users (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    age TINYINT UNSIGNED CHECK (age >= 0 AND age <= 120),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    profile_picture_url VARCHAR(255)
);

-- Use ENUM for limited options
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    payment_method ENUM('credit_card', 'paypal', 'bank_transfer', 'cash')
);
```

## Indexing Strategy

### 1. Primary Indexes

Every table should have a primary key:

```sql
-- Auto-increment primary key
CREATE TABLE products (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

-- Composite primary key
CREATE TABLE user_roles (
    user_id INT UNSIGNED NOT NULL,
    role_id INT UNSIGNED NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (role_id) REFERENCES roles(id)
);
```

### 2. Secondary Indexes

Add indexes for frequently queried columns:

```sql
-- Index for foreign keys
CREATE INDEX idx_orders_customer_id ON orders(customer_id);

-- Index for search columns
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_category_price ON products(category_id, price);

-- Index for date ranges
CREATE INDEX idx_orders_date ON orders(order_date);

-- Unique index for email
CREATE UNIQUE INDEX idx_users_email ON users(email);
```

### 3. Composite Indexes

For queries with multiple conditions:

```sql
-- Query: SELECT * FROM products WHERE category_id = ? AND price < ? ORDER BY name
CREATE INDEX idx_products_category_price_name ON products(category_id, price, name);

-- Query: SELECT * FROM orders WHERE customer_id = ? AND status = ? ORDER BY created_at DESC
CREATE INDEX idx_orders_customer_status_date ON orders(customer_id, status, created_at DESC);
```

## Relationship Design

### 1. One-to-Many Relationships

```sql
-- Customer has many orders
CREATE TABLE customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);
```

### 2. Many-to-Many Relationships

```sql
-- Students and courses
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    credits INT NOT NULL
);

CREATE TABLE student_courses (
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    enrollment_date DATE NOT NULL,
    grade CHAR(2),
    PRIMARY KEY (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
```

## Performance Optimization

### 1. Query Optimization

```sql
-- Bad: Using SELECT *
SELECT * FROM users WHERE email = 'user@example.com';

-- Good: Select only needed columns
SELECT id, name, email FROM users WHERE email = 'user@example.com';

-- Bad: Subquery in WHERE clause
SELECT * FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE status = 'active');

-- Good: JOIN instead of subquery
SELECT o.* FROM orders o 
INNER JOIN customers c ON o.customer_id = c.id 
WHERE c.status = 'active';
```

### 2. Pagination

```sql
-- Inefficient for large datasets (OFFSET becomes slow)
SELECT * FROM products ORDER BY created_at DESC LIMIT 20 OFFSET 1000;

-- Efficient: Use cursor-based pagination
SELECT * FROM products WHERE created_at < '2024-01-01 10:00:00' 
ORDER BY created_at DESC LIMIT 20;
```

### 3. Stored Procedures

```sql
DELIMITER //
CREATE PROCEDURE GetCustomerOrders(IN customer_id INT, IN limit_count INT)
BEGIN
    SELECT 
        o.id,
        o.order_date,
        o.total_amount,
        COUNT(oi.id) as item_count
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.customer_id = customer_id
    GROUP BY o.id, o.order_date, o.total_amount
    ORDER BY o.order_date DESC
    LIMIT limit_count;
END //
DELIMITER ;

-- Usage
CALL GetCustomerOrders(123, 10);
```

## Security Considerations

### 1. Input Validation

```sql
-- Use parameterized queries (application level)
-- Example in PHP
$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND password = ?");
$stmt->execute([$email, $hashed_password]);

-- Example in Python
cursor.execute("SELECT * FROM users WHERE email = %s AND password = %s", 
               (email, hashed_password))
```

### 2. Access Control

```sql
-- Create limited user for application
CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'secure_password';

-- Grant only necessary permissions
GRANT SELECT, INSERT, UPDATE ON myapp.orders TO 'app_user'@'localhost';
GRANT SELECT ON myapp.products TO 'app_user'@'localhost';

-- Revoke unnecessary permissions
REVOKE DELETE ON myapp.* FROM 'app_user'@'localhost';
```

## Backup and Recovery

### 1. Regular Backups

```sql
-- Create backup script
mysqldump -u root -p --single-transaction --routines --triggers myapp > backup_$(date +%Y%m%d_%H%M%S).sql

-- Point-in-time recovery
mysqlbinlog --start-datetime="2024-01-01 00:00:00" --stop-datetime="2024-01-02 00:00:00" /var/log/mysql/mysql-bin.000123 > recovery.sql
```

### 2. Replication Setup

```sql
-- Master configuration
CREATE USER 'replication_user'@'%' IDENTIFIED BY 'replication_password';
GRANT REPLICATION SLAVE ON *.* TO 'replication_user'@'%';
FLUSH PRIVILEGES;
SHOW MASTER STATUS;

-- Slave configuration
CHANGE MASTER TO
    MASTER_HOST='master_server_ip',
    MASTER_USER='replication_user',
    MASTER_PASSWORD='replication_password',
    MASTER_LOG_FILE='mysql-bin.000123',
    MASTER_LOG_POS=154;
START SLAVE;
```

## Monitoring and Maintenance

### 1. Performance Monitoring

```sql
-- Slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

-- Analyze query performance
EXPLAIN SELECT * FROM orders WHERE customer_id = 123 AND status = 'pending';

-- Check table statistics
SHOW TABLE STATUS LIKE 'orders';
```

### 2. Regular Maintenance

```sql
-- Optimize tables
OPTIMIZE TABLE orders, customers, products;

-- Analyze tables for query optimizer
ANALYZE TABLE orders, customers, products;

-- Check table integrity
CHECK TABLE orders, customers, products;
```

## Conclusion

Following these database design best practices will help you build:

- **Scalable applications** that can handle growth
- **Performant systems** with optimized queries
- **Maintainable code** with clear data relationships
- **Secure applications** protected against common vulnerabilities

Remember that database design is an iterative process. Start with a solid foundation, but be prepared to evolve your schema as your application grows and requirements change.

What database design challenges have you faced? Share your experiences in the comments!
