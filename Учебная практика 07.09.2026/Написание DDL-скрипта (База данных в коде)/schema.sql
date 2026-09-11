DROP TABLE IF EXISTS sales_history CASCADE;
DROP TABLE IF EXISTS partners CASCADE;
DROP TABLE IF EXISTS products CASCADE;

CREATE TABLE partners (
    partner_id      SERIAL          PRIMARY KEY,
    company_name    VARCHAR(255)    NOT NULL,
    inn             VARCHAR(12)     NOT NULL UNIQUE,
    contact_email   VARCHAR(100)    UNIQUE,
    phone           VARCHAR(20)     UNIQUE,
    rating          DECIMAL(3,1)    DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),

    CONSTRAINT chk_inn_length CHECK (inn ~ '^\d{10}$' OR inn ~ '^\d{12}$'); -- 10 для ООО, 12 для ИП
);

CREATE TABLE products (
    product_id      SERIAL          PRIMARY KEY,
    product_name    VARCHAR(255)    NOT NULL UNIQUE
);

CREATE TABLE sales_history (
    sale_id         SERIAL          PRIMARY KEY,
    partner_id      INTEGER         NOT NULL,
    product_id      INTEGER         NOT NULL,
    sale_date       DATE            NOT NULL,
    quantity        INTEGER         NOT NULL CHECK (quantity > 0),
    total_amount    DECIMAL(10,2)   NOT NULL CHECK (total_amount >= 0),
    unit_price      DECIMAL(10,2)   GENERATED ALWAYS AS
                                    (ROUND(total_amount / quantity, 2)) STORED,

    CONSTRAINT fk_sales_partner
        FOREIGN KEY (partner_id) REFERENCES partners(partner_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_sales_product
        FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);