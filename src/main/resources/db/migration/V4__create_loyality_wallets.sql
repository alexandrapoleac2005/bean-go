ALTER TABLE users
DROP COLUMN total_points;

CREATE TABLE loyalty_points (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    coffee_shop_id BIGINT NOT NULL,
    points INT DEFAULT 0 NOT NULL,
    CONSTRAINT fk_loyalty_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_loyalty_shop FOREIGN KEY (coffee_shop_id) REFERENCES coffee_shops(id) ON DELETE CASCADE,
    UNIQUE (user_id, coffee_shop_id)
);

ALTER TABLE vouchers
RENAME COLUMN coffee_shop_id_where_used TO coffee_shop_id;