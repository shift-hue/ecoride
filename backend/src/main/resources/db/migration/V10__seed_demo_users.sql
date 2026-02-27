-- V10: Seed 5 demo users with 1 month of realistic ride, carbon, trust, and message data
-- Demo password for all users: Demo@1234
-- BCrypt hash below corresponds to the string "Demo@1234"

SET @u1 = 'a0000001-cafe-cafe-cafe-000000000001';
SET @u2 = 'a0000002-cafe-cafe-cafe-000000000002';
SET @u3 = 'a0000003-cafe-cafe-cafe-000000000003';
SET @u4 = 'a0000004-cafe-cafe-cafe-000000000004';
SET @u5 = 'a0000005-cafe-cafe-cafe-000000000005';

-- ── USERS ────────────────────────────────────────────────────────────────────
INSERT IGNORE INTO users
  (id, name, email, password_hash, department, year,
   trust_score, rides_completed, carbon_credits,
   vehicle_model, vehicle_number, bio, preferences,
   phone_number, phone_verified, license_verified, created_at)
VALUES
  (@u1, 'Arjun Sharma',  'arjun.sharma@campus.edu',
   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
   'Computer Science', 3, 88, 14, 420,
   'Honda City', 'KA01AB1234',
   'Morning commuter who loves clean drives and good music. Always on time!',
   'Non-smoker,Music friendly,AC preferred',
   '+91 9876543201', TRUE, TRUE,
   '2026-01-01 08:00:00'),

  (@u2, 'Priya Patel',   'priya.patel@campus.edu',
   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
   'Electronics', 2, 74, 11, 315,
   NULL, NULL,
   'Eco-conscious rider. Prefer quiet rides and no smoking please.',
   'Non-smoker,Quiet ride',
   '+91 9876543202', TRUE, FALSE,
   '2026-01-02 09:00:00'),

  (@u3, 'Rahul Verma',   'rahul.verma@campus.edu',
   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
   'Mechanical', 4, 92, 18, 510,
   'Maruti Swift', 'KA02CD5678',
   'Senior student, seasoned driver. 3 years of campus carpooling experience.',
   'Non-smoker,AC preferred,No eating',
   '+91 9876543203', TRUE, TRUE,
   '2026-01-01 10:00:00'),

  (@u4, 'Sneha Reddy',   'sneha.reddy@campus.edu',
   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
   'Civil', 1, 55, 7, 190,
   NULL, NULL,
   'First year student, looking for reliable carpool buddies!',
   'Music friendly,Pets ok',
   '+91 9876543204', FALSE, FALSE,
   '2026-01-05 11:00:00'),

  (@u5, 'Kiran Kumar',   'kiran.kumar@campus.edu',
   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
   'Information Technology', 3, 80, 12, 360,
   'Tata Nexon', 'KA03EF9012',
   'EV driver! Zero direct emissions. Passionate about campus sustainability.',
   'Non-smoker,Quiet ride,AC preferred',
   '+91 9876543205', TRUE, TRUE,
   '2026-01-03 07:30:00');

-- ── RIDES (15 completed rides spread across January 2026) ─────────────────────
SET @r01 = 'b0000001-cafe-cafe-cafe-000000000001';
SET @r02 = 'b0000002-cafe-cafe-cafe-000000000002';
SET @r03 = 'b0000003-cafe-cafe-cafe-000000000003';
SET @r04 = 'b0000004-cafe-cafe-cafe-000000000004';
SET @r05 = 'b0000005-cafe-cafe-cafe-000000000005';
SET @r06 = 'b0000006-cafe-cafe-cafe-000000000006';
SET @r07 = 'b0000007-cafe-cafe-cafe-000000000007';
SET @r08 = 'b0000008-cafe-cafe-cafe-000000000008';
SET @r09 = 'b0000009-cafe-cafe-cafe-000000000009';
SET @r10 = 'b0000010-cafe-cafe-cafe-000000000010';
SET @r11 = 'b0000011-cafe-cafe-cafe-000000000011';
SET @r12 = 'b0000012-cafe-cafe-cafe-000000000012';
SET @r13 = 'b0000013-cafe-cafe-cafe-000000000013';
SET @r14 = 'b0000014-cafe-cafe-cafe-000000000014';
SET @r15 = 'b0000015-cafe-cafe-cafe-000000000015';

--  id, driver, pickup_zone, departure_time, available_seats, status, destination, price_per_seat, created_at
INSERT IGNORE INTO rides
  (id, driver_id, pickup_zone, departure_time, available_seats, status,
   destination, is_subscription, created_at)
VALUES
  (@r01, @u1, 'A', '2026-01-03 08:00:00', 0, 'COMPLETED', 'Main Campus Gate', FALSE, '2026-01-02 22:00:00'),
  (@r02, @u3, 'B', '2026-01-05 08:30:00', 0, 'COMPLETED', 'Engineering Block',  FALSE, '2026-01-04 21:00:00'),
  (@r03, @u5, 'C', '2026-01-06 09:00:00', 0, 'COMPLETED', 'Library Complex',    FALSE, '2026-01-05 20:00:00'),
  (@r04, @u1, 'A', '2026-01-08 08:00:00', 0, 'COMPLETED', 'Main Campus Gate',   FALSE, '2026-01-07 22:00:00'),
  (@r05, @u3, 'D', '2026-01-09 08:15:00', 0, 'COMPLETED', 'Sports Complex',     FALSE, '2026-01-08 21:00:00'),
  (@r06, @u5, 'B', '2026-01-10 07:45:00', 0, 'COMPLETED', 'Admin Block',        FALSE, '2026-01-09 20:30:00'),
  (@r07, @u1, 'C', '2026-01-13 08:00:00', 0, 'COMPLETED', 'Main Campus Gate',   FALSE, '2026-01-12 22:00:00'),
  (@r08, @u3, 'A', '2026-01-14 08:30:00', 0, 'COMPLETED', 'Engineering Block',  FALSE, '2026-01-13 21:00:00'),
  (@r09, @u5, 'D', '2026-01-15 09:00:00', 0, 'COMPLETED', 'Science Block',      FALSE, '2026-01-14 20:00:00'),
  (@r10, @u1, 'B', '2026-01-17 08:00:00', 0, 'COMPLETED', 'Main Campus Gate',   FALSE, '2026-01-16 22:00:00'),
  (@r11, @u3, 'C', '2026-01-20 08:30:00', 0, 'COMPLETED', 'Lab Complex',        FALSE, '2026-01-19 21:30:00'),
  (@r12, @u5, 'A', '2026-01-21 07:45:00', 0, 'COMPLETED', 'Admin Block',        FALSE, '2026-01-20 22:00:00'),
  (@r13, @u1, 'D', '2026-01-23 08:00:00', 0, 'COMPLETED', 'Main Campus Gate',   FALSE, '2026-01-22 22:00:00'),
  (@r14, @u3, 'B', '2026-01-27 08:30:00', 0, 'COMPLETED', 'Engineering Block',  FALSE, '2026-01-26 21:00:00'),
  (@r15, @u5, 'C', '2026-01-29 09:00:00', 0, 'COMPLETED', 'Library Complex',    FALSE, '2026-01-28 20:30:00');

-- ── RIDE PARTICIPANTS ─────────────────────────────────────────────────────────
INSERT IGNORE INTO ride_participants (id, ride_id, user_id, status, created_at) VALUES
  -- r01 (Arjun drives): Priya, Sneha ride
  (UUID(), @r01, @u2, 'CONFIRMED', '2026-01-02 22:10:00'),
  (UUID(), @r01, @u4, 'CONFIRMED', '2026-01-02 22:15:00'),
  -- r02 (Rahul drives): Arjun, Priya, Kiran ride
  (UUID(), @r02, @u1, 'CONFIRMED', '2026-01-04 21:05:00'),
  (UUID(), @r02, @u2, 'CONFIRMED', '2026-01-04 21:10:00'),
  (UUID(), @r02, @u5, 'CONFIRMED', '2026-01-04 21:12:00'),
  -- r03 (Kiran drives): Priya, Sneha ride
  (UUID(), @r03, @u2, 'CONFIRMED', '2026-01-05 20:05:00'),
  (UUID(), @r03, @u4, 'CONFIRMED', '2026-01-05 20:08:00'),
  -- r04 (Arjun drives): Rahul, Kiran ride
  (UUID(), @r04, @u3, 'CONFIRMED', '2026-01-07 22:05:00'),
  (UUID(), @r04, @u5, 'CONFIRMED', '2026-01-07 22:08:00'),
  -- r05 (Rahul drives): Priya, Sneha ride
  (UUID(), @r05, @u2, 'CONFIRMED', '2026-01-08 21:05:00'),
  (UUID(), @r05, @u4, 'CONFIRMED', '2026-01-08 21:10:00'),
  -- r06 (Kiran drives): Arjun, Rahul ride
  (UUID(), @r06, @u1, 'CONFIRMED', '2026-01-09 20:35:00'),
  (UUID(), @r06, @u3, 'CONFIRMED', '2026-01-09 20:40:00'),
  -- r07 (Arjun drives): Priya, Kiran ride
  (UUID(), @r07, @u2, 'CONFIRMED', '2026-01-12 22:05:00'),
  (UUID(), @r07, @u5, 'CONFIRMED', '2026-01-12 22:10:00'),
  -- r08 (Rahul drives): Arjun, Sneha ride
  (UUID(), @r08, @u1, 'CONFIRMED', '2026-01-13 21:05:00'),
  (UUID(), @r08, @u4, 'CONFIRMED', '2026-01-13 21:10:00'),
  -- r09 (Kiran drives): Priya, Rahul ride
  (UUID(), @r09, @u2, 'CONFIRMED', '2026-01-14 20:05:00'),
  (UUID(), @r09, @u3, 'CONFIRMED', '2026-01-14 20:08:00'),
  -- r10 (Arjun drives): Sneha, Kiran ride
  (UUID(), @r10, @u4, 'CONFIRMED', '2026-01-16 22:05:00'),
  (UUID(), @r10, @u5, 'CONFIRMED', '2026-01-16 22:08:00'),
  -- r11 (Rahul drives): Arjun, Priya ride
  (UUID(), @r11, @u1, 'CONFIRMED', '2026-01-19 21:35:00'),
  (UUID(), @r11, @u2, 'CONFIRMED', '2026-01-19 21:40:00'),
  -- r12 (Kiran drives): Sneha, Rahul ride
  (UUID(), @r12, @u4, 'CONFIRMED', '2026-01-20 22:05:00'),
  (UUID(), @r12, @u3, 'CONFIRMED', '2026-01-20 22:08:00'),
  -- r13 (Arjun drives): Priya, Rahul ride
  (UUID(), @r13, @u2, 'CONFIRMED', '2026-01-22 22:05:00'),
  (UUID(), @r13, @u3, 'CONFIRMED', '2026-01-22 22:08:00'),
  -- r14 (Rahul drives): Kiran, Priya ride
  (UUID(), @r14, @u5, 'CONFIRMED', '2026-01-26 21:05:00'),
  (UUID(), @r14, @u2, 'CONFIRMED', '2026-01-26 21:08:00'),
  -- r15 (Kiran drives): Arjun, Sneha ride
  (UUID(), @r15, @u1, 'CONFIRMED', '2026-01-28 20:35:00'),
  (UUID(), @r15, @u4, 'CONFIRMED', '2026-01-28 20:40:00');

-- ── CARBON TRANSACTIONS (~2.1 kg saved per shared ride slot, ~210 credits/ride) ─
INSERT IGNORE INTO carbon_transactions
  (id, user_id, ride_id, carbon_saved_grams, credits_earned, created_at)
VALUES
  -- r01
  (UUID(), @u2, @r01, 2100, 21, '2026-01-03 10:00:00'),
  (UUID(), @u4, @r01, 2100, 21, '2026-01-03 10:00:00'),
  -- r02
  (UUID(), @u1, @r02, 2100, 21, '2026-01-05 10:00:00'),
  (UUID(), @u2, @r02, 2100, 21, '2026-01-05 10:00:00'),
  (UUID(), @u5, @r02, 2100, 21, '2026-01-05 10:00:00'),
  -- r03
  (UUID(), @u2, @r03, 2100, 21, '2026-01-06 11:00:00'),
  (UUID(), @u4, @r03, 2100, 21, '2026-01-06 11:00:00'),
  -- r04
  (UUID(), @u3, @r04, 2100, 21, '2026-01-08 10:00:00'),
  (UUID(), @u5, @r04, 2100, 21, '2026-01-08 10:00:00'),
  -- r05
  (UUID(), @u2, @r05, 2100, 21, '2026-01-09 10:15:00'),
  (UUID(), @u4, @r05, 2100, 21, '2026-01-09 10:15:00'),
  -- r06
  (UUID(), @u1, @r06, 2100, 21, '2026-01-10 09:45:00'),
  (UUID(), @u3, @r06, 2100, 21, '2026-01-10 09:45:00'),
  -- r07
  (UUID(), @u2, @r07, 2100, 21, '2026-01-13 10:00:00'),
  (UUID(), @u5, @r07, 2100, 21, '2026-01-13 10:00:00'),
  -- r08
  (UUID(), @u1, @r08, 2100, 21, '2026-01-14 10:30:00'),
  (UUID(), @u4, @r08, 2100, 21, '2026-01-14 10:30:00'),
  -- r09
  (UUID(), @u2, @r09, 2100, 21, '2026-01-15 11:00:00'),
  (UUID(), @u3, @r09, 2100, 21, '2026-01-15 11:00:00'),
  -- r10
  (UUID(), @u4, @r10, 2100, 21, '2026-01-17 10:00:00'),
  (UUID(), @u5, @r10, 2100, 21, '2026-01-17 10:00:00'),
  -- r11
  (UUID(), @u1, @r11, 2100, 21, '2026-01-20 10:30:00'),
  (UUID(), @u2, @r11, 2100, 21, '2026-01-20 10:30:00'),
  -- r12
  (UUID(), @u4, @r12, 2100, 21, '2026-01-21 09:45:00'),
  (UUID(), @u3, @r12, 2100, 21, '2026-01-21 09:45:00'),
  -- r13
  (UUID(), @u2, @r13, 2100, 21, '2026-01-23 10:00:00'),
  (UUID(), @u3, @r13, 2100, 21, '2026-01-23 10:00:00'),
  -- r14
  (UUID(), @u5, @r14, 2100, 21, '2026-01-27 10:30:00'),
  (UUID(), @u2, @r14, 2100, 21, '2026-01-27 10:30:00'),
  -- r15
  (UUID(), @u1, @r15, 2100, 21, '2026-01-29 11:00:00'),
  (UUID(), @u4, @r15, 2100, 21, '2026-01-29 11:00:00');

-- ── TRUST CONNECTIONS ─────────────────────────────────────────────────────────
-- Only insert where user1_id < user2_id (constraint requirement)
INSERT IGNORE INTO trust_connections (user1_id, user2_id, mutual_ride_count) VALUES
  (@u1, @u2, 6),   -- Arjun ↔ Priya
  (@u1, @u3, 5),   -- Arjun ↔ Rahul
  (@u1, @u4, 3),   -- Arjun ↔ Sneha
  (@u1, @u5, 5),   -- Arjun ↔ Kiran
  (@u2, @u3, 6),   -- Priya ↔ Rahul
  (@u2, @u4, 4),   -- Priya ↔ Sneha
  (@u2, @u5, 5),   -- Priya ↔ Kiran
  (@u3, @u4, 3),   -- Rahul ↔ Sneha
  (@u3, @u5, 4),   -- Rahul ↔ Kiran
  (@u4, @u5, 3);   -- Sneha ↔ Kiran

-- ── MESSAGES ─────────────────────────────────────────────────────────────────
INSERT IGNORE INTO messages (id, sender_id, receiver_id, content, is_read, created_at) VALUES
  (UUID(), @u2, @u1, 'Hi Arjun! Is the 8am ride tomorrow still on?',              TRUE,  '2026-01-02 20:00:00'),
  (UUID(), @u1, @u2, 'Yes Priya! Pick up from Gate A at 7:55. See you!',           TRUE,  '2026-01-02 20:05:00'),
  (UUID(), @u3, @u1, 'Hey Arjun, joining your Monday rides regularly?',            TRUE,  '2026-01-07 18:00:00'),
  (UUID(), @u1, @u3, 'Absolutely Rahul! Every Mon + Wed. Join anytime.',           TRUE,  '2026-01-07 18:10:00'),
  (UUID(), @u4, @u3, 'Rahul bhai, can I book for tomorrow 8:30 ride?',            TRUE,  '2026-01-08 19:00:00'),
  (UUID(), @u3, @u4, 'Sure Sneha! Seat confirmed. Zone D, 8:15 sharp.',           TRUE,  '2026-01-08 19:05:00'),
  (UUID(), @u5, @u2, 'Priya, loved the quiet ride today. Same time Thursday?',    TRUE,  '2026-01-06 12:00:00'),
  (UUID(), @u2, @u5, 'Yes Kiran! And thanks for the EV — zero emissions!',        TRUE,  '2026-01-06 12:08:00'),
  (UUID(), @u4, @u5, 'Kiran, your Nexon is so smooth. Thanks for the ride!',      TRUE,  '2026-01-10 10:00:00'),
  (UUID(), @u5, @u4, 'Haha thanks Sneha! Always happy to carpool.',               TRUE,  '2026-01-10 10:05:00'),
  (UUID(), @u3, @u5, 'Kiran, want to do a shared subscription Mon-Fri?',          TRUE,  '2026-01-12 17:00:00'),
  (UUID(), @u5, @u3, 'Great idea Rahul! Let me set it up in the app.',            TRUE,  '2026-01-12 17:08:00'),
  (UUID(), @u2, @u1, 'Arjun the Jan ride log is impressive! 14 rides already',    FALSE, '2026-01-28 21:00:00'),
  (UUID(), @u1, @u4, 'Sneha you are making great progress with carpooling!',      FALSE, '2026-01-29 09:00:00');

-- ── SUBSCRIPTION POOLS ────────────────────────────────────────────────────────
SET @sp1 = 'c0000001-cafe-cafe-cafe-000000000001';
SET @sp2 = 'c0000002-cafe-cafe-cafe-000000000002';

INSERT IGNORE INTO subscription_pools (id, pickup_zone, departure_time, day_of_week, created_by, created_at) VALUES
  (@sp1, 'B', '08:00:00', 1, @u5, '2026-01-12 18:00:00'),  -- Monday EV pool (Kiran)
  (@sp2, 'A', '08:30:00', 3, @u3, '2026-01-13 09:00:00');  -- Wednesday pool  (Rahul)

INSERT IGNORE INTO subscription_members (pool_id, user_id) VALUES
  (@sp1, @u5), (@sp1, @u3), (@sp1, @u2),
  (@sp2, @u3), (@sp2, @u1), (@sp2, @u4);
