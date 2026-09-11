COPY partners(partner_id, company_name, inn, contact_email, phone, rating)
FROM '/Users/admin/prog/educational_practice/Учебная практика 07.09.2026/Подготовка данных и импорт (ETL)/import_partners.csv'
WITH (FORMAT csv, HEADER true);

CREATE TEMP TABLE temp_sales (
    sale_id INTEGER,
    partner_id INTEGER,
    product_name VARCHAR(255),
    sale_date DATE,
    quantity INTEGER,
    total_amount DECIMAL(10,2)
);

COPY temp_sales(sale_id, partner_id, product_name, sale_date, quantity, total_amount)
FROM '/Users/admin/prog/educational_practice/Учебная практика 07.09.2026/Подготовка данных и импорт (ETL)/import_sales.txt'
WITH (FORMAT csv, HEADER true);

INSERT INTO products (product_name)
SELECT DISTINCT product_name
FROM temp_sales;

INSERT INTO sales_history(sale_id, partner_id, product_id, sale_date, quantity, total_amount)
SELECT t.sale_id, t.partner_id, p.product_id, t.sale_date, t.quantity, t.total_amount
FROM temp_sales t
JOIN products p ON t.product_name = p.product_name;

DROP TABLE temp_sales;

SELECT setval('partners_partner_id_seq',
              (SELECT MAX(partner_id) FROM partners), true);
SELECT setval('sales_history_sale_id_seq',
              (SELECT MAX(sale_id) FROM sales_history), true);

-- Проверка
SELECT COUNT(*) FROM partners;       -- 3
SELECT COUNT(*) FROM products;       -- 3
SELECT COUNT(*) FROM sales_history;  -- 4