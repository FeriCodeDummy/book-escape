
-- Users (5)
INSERT INTO users (name, surname, email, password_hash, is_verified, status)
VALUES
    ('Alice','Kovac','alice@example.com','ff8d9819fc0e12bf0d24892e45987e249a28dce836a85cad60e28eaaa8c6d976',1,'active'),
    ('Bob','Novak','bob@example.com','5ff860bf1190596c7188ab851db691f0f3169c453936e9e1eba2f9a47f7a0018',1,'active'),
    ('Charlie','Horvat','charlie@example.com','add7232b65bb559f896cbcfa9a600170a7ca381a0366789dcf59ad986bdf4a98',0,'active'),
    ('Diana','Kralj','diana@example.com','e240bcaea43a9ddcd598126ccca52d9b5204d5c5541e21f1a6644db24dbb49fa',1,'active'),
    ('Ethan','Zupan','ethan@example.com','2475966ba9b5151a3eeb8d0718b23697395dfe926d8ffee8924b90f0cc6b21bc',1,'blocked');

-- Email verification (for Charlie)
INSERT INTO email_verifications (user_id, token, expires_at)
VALUES
    ((SELECT id FROM users WHERE email='charlie@example.com'),'verif_tok_abc123', DATE_ADD(NOW(), INTERVAL 1 DAY));

-- Managers (2)
INSERT INTO managers (email, password_hash, name, phone, status)
VALUES
    ('gm@lakeside.si', '$2y$10$devhashmgr1', 'Lara', '+38640123456', 'active'),
    ('gm@seaview.hr',  '$2y$10$devhashmgr2', 'Ivo',  '+38591555111', 'active');

-- Hotels (5)
INSERT INTO hotels (name, description, address_line, city, country, checkin_time, checkout_time, cancellation_policy_days, is_active)
VALUES
    ('Lakeside Alpine Hotel','Boutique retreat by the lake with spa & panoramic views.','Cesta 1','Bled','SI','15:00:00','11:00:00',2,1),
    ('Seaview Riviera Resort','Modern seaside resort with rooftop pool and co-working.','Ulica 5','Split','HR','14:00:00','10:00:00',3,1),
    ('City Central Stay','Affordable comfort in the heart of the city.','Street 9','Ljubljana','SI','14:00:00','11:00:00',1,1),
    ('Alpine Meadow Lodge','Cozy wooden lodge near hiking trails.','Trg 12','Kranjska Gora','SI','15:00:00','10:30:00',2,1),
    ('Old Town Boutique','Charming boutique rooms in old town.','Stari trg 3','Rovinj','HR','14:00:00','10:00:00',2,1);

-- Link managers to hotels
INSERT INTO manager_hotels (manager_id, hotel_id)
VALUES
    ((SELECT id FROM managers WHERE email='gm@lakeside.si'), (SELECT id FROM hotels WHERE name='Lakeside Alpine Hotel')),
    ((SELECT id FROM managers WHERE email='gm@seaview.hr'),  (SELECT id FROM hotels WHERE name='Seaview Riviera Resort'));

-- Photos (cover + extras)
INSERT INTO hotel_photos (hotel_id, url, is_cover, sort_order) VALUES
                                                                   ((SELECT id FROM hotels WHERE name='Lakeside Alpine Hotel'),'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop',1,0),
                                                                   ((SELECT id FROM hotels WHERE name='Lakeside Alpine Hotel'),'https://images.unsplash.com/photo-1551892589-865f69869443?q=80&w=1600&auto=format&fit=crop',0,1),
                                                                   ((SELECT id FROM hotels WHERE name='Seaview Riviera Resort'),'https://images.unsplash.com/photo-1501117716987-c8e2aeb6f9ef?q=80&w=1600&auto=format&fit=crop',1,0),
                                                                   ((SELECT id FROM hotels WHERE name='Seaview Riviera Resort'),'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1600&auto=format&fit=crop',0,1),
                                                                   ((SELECT id FROM hotels WHERE name='City Central Stay'),'https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=1600&auto=format&fit=crop',1,0);

-- Room types (8)
INSERT INTO room_types (hotel_id, name, description, capacity, base_price, currency, total_rooms)
VALUES
    ((SELECT id FROM hotels WHERE name='Lakeside Alpine Hotel'),'Standard Double','Queen bed, mountain view.',2,110,'EUR',20),
    ((SELECT id FROM hotels WHERE name='Lakeside Alpine Hotel'),'Junior Suite','Lounge area, balcony.',3,180,'EUR',8),
    ((SELECT id FROM hotels WHERE name='Seaview Riviera Resort'),'Sea View King','King bed, balcony sea view.',2,150,'EUR',25),
    ((SELECT id FROM hotels WHERE name='Seaview Riviera Resort'),'Family Room','Two queen beds, partial sea view.',4,190,'EUR',10),
    ((SELECT id FROM hotels WHERE name='City Central Stay'),'Economy Twin','Two single beds.',2,75,'EUR',15),
    ((SELECT id FROM hotels WHERE name='Alpine Meadow Lodge'),'Chalet Room','Rustic feel, forest view.',2,95,'EUR',10),
    ((SELECT id FROM hotels WHERE name='Old Town Boutique'),'Classic Double','Historic building, cozy room.',2,120,'EUR',6),
    ((SELECT id FROM hotels WHERE name='Old Town Boutique'),'Superior Suite','Spacious suite with lounge.',3,180,'EUR',4);

-- Room inventory: next 7 days for first 5 room types (keep seed compact)
-- (Use price_override some days; min_stay on a couple of days)
INSERT INTO room_inventory (room_type_id, date, available_rooms, price_override, min_stay_nights)
SELECT rt.id, CURDATE() + INTERVAL d DAY,
       GREATEST(0, FLOOR(rt.total_rooms * (0.6 + RAND()*0.3))),
       CASE WHEN RAND() > 0.7 THEN ROUND(rt.base_price * (0.9 + RAND()*0.4), 0) ELSE NULL END,
       CASE WHEN RAND() > 0.9 THEN 2 ELSE NULL END
FROM room_types rt
         JOIN (SELECT 0 d UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6) ds
WHERE rt.id IN (
                (SELECT id FROM room_types WHERE name='Standard Double' LIMIT 1),
                (SELECT id FROM room_types WHERE name='Junior Suite' LIMIT 1),
                (SELECT id FROM room_types WHERE name='Sea View King' LIMIT 1),
                (SELECT id FROM room_types WHERE name='Family Room' LIMIT 1),
                (SELECT id FROM room_types WHERE name='Economy Twin' LIMIT 1)
    );

-- Reviews (≥3 on first hotel)
INSERT INTO reviews (hotel_id, user_id, rating, comment, is_public, created_at) VALUES
                                                                                    ((SELECT id FROM hotels WHERE name='Lakeside Alpine Hotel'), (SELECT id FROM users WHERE email='alice@example.com'), 5, 'Magical lake views.', 1, NOW()),
                                                                                    ((SELECT id FROM hotels WHERE name='Lakeside Alpine Hotel'), (SELECT id FROM users WHERE email='bob@example.com'),   4, 'Great spa and breakfast.', 1, NOW()),
                                                                                    ((SELECT id FROM hotels WHERE name='Lakeside Alpine Hotel'), (SELECT id FROM users WHERE email='charlie@example.com'),5, 'Super cozy and quiet.', 1, NOW()),
                                                                                    ((SELECT id FROM hotels WHERE name='Seaview Riviera Resort'), (SELECT id FROM users WHERE email='alice@example.com'),4, 'Rooftop pool is awesome.', 1, NOW()),
                                                                                    ((SELECT id FROM hotels WHERE name='City Central Stay'), (SELECT id FROM users WHERE email='bob@example.com'), 3, 'Basic but central location.', 1, NOW());

-- Favorites
INSERT INTO favorites (user_id, hotel_id) VALUES
                                              ((SELECT id FROM users WHERE email='alice@example.com'), (SELECT id FROM hotels WHERE name='Lakeside Alpine Hotel')),
                                              ((SELECT id FROM users WHERE email='alice@example.com'), (SELECT id FROM hotels WHERE name='Seaview Riviera Resort'));

-- Reservations + items + history
-- Res #1 confirmed for Alice at Lakeside (Standard Double)
INSERT INTO reservations (user_id, hotel_id, check_in, check_out, status, total_price, cancellation_deadline, confirmation_sent_at, currency)
VALUES (
           (SELECT id FROM users WHERE email='alice@example.com'),
           (SELECT id FROM hotels WHERE name='Lakeside Alpine Hotel'),
           CURDATE() + INTERVAL 3 DAY,
           CURDATE() + INTERVAL 6 DAY,
           'confirmed',
           330.00,
           CONCAT(DATE_SUB(CURDATE() + INTERVAL 3 DAY, INTERVAL 2 DAY), ' 12:00:00'),
           NOW(),
           'EUR'
       );

INSERT INTO reservation_items (reservation_id, room_type_id, quantity, price_per_night, nights, line_total)
VALUES (
           (SELECT MAX(id) FROM reservations),
           (SELECT id FROM room_types WHERE name='Standard Double' LIMIT 1),
           1, 110.00, 3, 330.00
       );

INSERT INTO reservation_status_history (reservation_id, changed_by_role, changed_by_id, old_status, new_status, note)
VALUES (
           (SELECT MAX(id) FROM reservations), 'manager', NULL, 'pending', 'confirmed', 'Auto-confirmed seed'
       );

-- Res #2 pending for Bob at Seaview (Sea View King)
INSERT INTO reservations (user_id, hotel_id, check_in, check_out, status, total_price, cancellation_deadline, currency)
VALUES (
           (SELECT id FROM users WHERE email='bob@example.com'),
           (SELECT id FROM hotels WHERE name='Seaview Riviera Resort'),
           CURDATE() + INTERVAL 10 DAY,
           CURDATE() + INTERVAL 12 DAY,
           'pending',
           300.00,
           CONCAT(DATE_SUB(CURDATE() + INTERVAL 10 DAY, INTERVAL 3 DAY), ' 12:00:00'),
           'EUR'
       );

INSERT INTO reservation_items (reservation_id, room_type_id, quantity, price_per_night, nights, line_total)
VALUES (
           (SELECT MAX(id) FROM reservations),
           (SELECT id FROM room_types WHERE name='Sea View King' LIMIT 1),
           1, 150.00, 2, 300.00
       );

INSERT INTO reservation_status_history (reservation_id, changed_by_role, changed_by_id, old_status, new_status, note)
VALUES (
           (SELECT MAX(id) FROM reservations), 'system', NULL, 'pending', 'pending', 'Awaiting manager review'
       );

-- Notifications
INSERT INTO notifications (user_id, type, template, payload_json, scheduled_at, sent_at, status)
VALUES
    ((SELECT id FROM users WHERE email='alice@example.com'), 'email', 'booking_confirmed', JSON_OBJECT('reservationId', 1), NOW(), NOW(), 'sent'),
    ((SELECT id FROM users WHERE email='bob@example.com'),   'email', 'booking_pending',   JSON_OBJECT('reservationId', 2), NOW(), NULL, 'scheduled');
