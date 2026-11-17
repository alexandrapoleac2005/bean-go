ALTER TABLE reviews ADD constraint uq_review_user_shop UNIQUE (user_id, coffee_shop_id);
CREATE INDEX idx_coffee_shops_location_geog ON coffee_shops USING GIST ((location::geography));
CREATE INDEX idx_reviews_coffee_shop ON reviews (coffee_shop_id);
CREATE INDEX idx_favorites_user ON favorites (user_id);
CREATE INDEX idx_vouchers_user ON vouchers (user_id);
CREATE INDEX idx_menu_items_coffee_shop ON menu_items (coffee_shop_id);
CREATE INDEX idx_operating_hours_coffee_shop ON operating_hours (coffee_shop_id);