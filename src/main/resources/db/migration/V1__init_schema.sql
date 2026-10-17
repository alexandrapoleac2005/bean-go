CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- USER, MERCHANT, ADMIN
    total_points INT DEFAULT 0
);

CREATE TABLE coffee_shops (
    id BIGSERIAL PRIMARY KEY,
    merchant_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location GEOMETRY(Point, 4326) NOT NULL,
    address VARCHAR(255) NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_merchant FOREIGN KEY (merchant_id) REFERENCES users(id)
);

CREATE TABLE operating_hours (
    id BIGSERIAL PRIMARY KEY,
    coffee_shop_id BIGINT NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    CONSTRAINT fk_coffee_shop_hours FOREIGN KEY (coffee_shop_id) REFERENCES coffee_shops(id) ON DELETE CASCADE
);

CREATE TABLE facilities (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(255)
);

CREATE TABLE coffee_shop_facilities (
    coffee_shop_id BIGINT NOT NULL,
    facility_id BIGINT NOT NULL,
    PRIMARY KEY (coffee_shop_id, facility_id),
    CONSTRAINT fk_csf_coffee_shop FOREIGN KEY (coffee_shop_id) REFERENCES coffee_shops(id) ON DELETE CASCADE,
    CONSTRAINT fk_csf_facility FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE
);

CREATE TABLE menu_items (
    id BIGSERIAL PRIMARY KEY,
    coffee_shop_id BIGINT NOT NULL,
    category VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    CONSTRAINT fk_menu_coffee_shop FOREIGN KEY (coffee_shop_id) REFERENCES coffee_shops(id) ON DELETE CASCADE
);

CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    coffee_shop_id BIGINT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_coffee_shop FOREIGN KEY (coffee_shop_id) REFERENCES coffee_shops(id) ON DELETE CASCADE
);

CREATE TABLE favorites (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    coffee_shop_id BIGINT NOT NULL,
    CONSTRAINT fk_favorite_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_favorite_coffee_shop FOREIGN KEY (coffee_shop_id) REFERENCES coffee_shops(id) ON DELETE CASCADE,
    UNIQUE (user_id, coffee_shop_id)
);

CREATE TABLE vouchers (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    coffee_shop_id_where_used BIGINT,
    status VARCHAR(50) NOT NULL, -- ACTIVE, USED
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_voucher_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_voucher_coffee_shop FOREIGN KEY (coffee_shop_id_where_used) REFERENCES coffee_shops(id)
);