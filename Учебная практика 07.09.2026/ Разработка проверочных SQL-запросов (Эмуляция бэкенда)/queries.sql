-- 1
SELECT
    p.partner_id,
    p.company_name,
    COUNT(s.sale_id) AS deliveries_count
FROM partners p
JOIN sales_history s ON p.partner_id = s.partner_id
GROUP BY p.partner_id, p.company_name
ORDER BY p.company_name ASC;

-- 2
BEGIN;

INSERT INTO partners (company_name, inn, contact_email, phone, rating)
VALUES ('ООО "Тестовый Партнёр"', '9999999999', 'test@example.com', '+79990000000', 5.0);

INSERT INTO sales_history (partner_id, product_id, sale_date, quantity, total_amount)
SELECT
    (SELECT partner_id FROM partners WHERE inn = '9999999999'),
    (SELECT product_id FROM products WHERE product_id = 1),
    CURRENT_DATE,
    10,
    5000.00;

COMMIT;

-- 3
SELECT
    s.sale_id,
    s.sale_date,
    pr.product_name,
    s.quantity,
    s.total_amount,
    SUM(s.total_amount) OVER () AS period_total
FROM sales_history s
JOIN products pr ON s.product_id = pr.product_id
WHERE s.partner_id = 1
  AND s.sale_date BETWEEN '2026-03-01' AND '2026-03-31'
ORDER BY s.sale_date ASC;