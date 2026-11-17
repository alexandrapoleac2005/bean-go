INSERT INTO facilities (name, icon) VALUES
    ('Wi-Fi', 'wifi'),
    ('Power outlets', 'plug'),
    ('Terrace', 'terrace'),
    ('Pet friendly', 'dog'),
    ('Vegan options', 'leaf'),
    ('Laptop friendly', 'laptop'),
    ('Wheelchair access', 'accessible'),
    ('Takeaway', 'takeaway'),
    ('Parking', 'parking')
ON CONFLICT (name) DO NOTHING;

