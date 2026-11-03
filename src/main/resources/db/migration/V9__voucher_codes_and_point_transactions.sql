-- Redemption code that the customer shows at the counter
ALTER TABLE vouchers ADD COLUMN code VARCHAR(16);

-- Give vouchers that already exist a random code
UPDATE vouchers SET code = upper(substr(md5(random()::text || id::text), 1, 10)) WHERE code IS NULL;

ALTER TABLE vouchers ALTER COLUMN code SET NOT NULL;
ALTER TABLE vouchers ADD CONSTRAINT uq_voucher_code UNIQUE (code);

-- Record of every points award, so suspicious activity can be traced
CREATE TABLE point_transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    coffee_shop_id BIGINT NOT NULL,
    merchant_id BIGINT NOT NULL,
    points INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_point_tx_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_point_tx_shop FOREIGN KEY (coffee_shop_id) REFERENCES coffee_shops(id) ON DELETE CASCADE,
    CONSTRAINT fk_point_tx_merchant FOREIGN KEY (merchant_id) REFERENCES users(id)
);

CREATE INDEX idx_point_tx_user ON point_transactions (user_id);
CREATE INDEX idx_point_tx_shop ON point_transactions (coffee_shop_id);
