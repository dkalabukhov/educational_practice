SELECT
    s.sale_id,
    pr.product_name,
    s.quantity,
    to_char(s.sale_date, 'DD.MM.YYYY') AS sale_date,
    s.total_amount,
    s.unit_price
FROM sales_history s
INNER JOIN products pr ON pr.product_id = s.product_id
INNER JOIN partners p  ON p.partner_id  = s.partner_id
WHERE s.partner_id = 1
ORDER BY s.sale_date DESC, s.sale_id DESC;