-- Patient Escort Coordination System - Seed Data

USE patient_escort_db;

-- 1. Users
-- Passwords should be hashed with bcrypt. 
-- For seeding directly via SQL, these are placeholder hashes for 'Admin@123' / 'Frontdesk@123' / 'Escort@123'
-- Note: Replace these with actual bcrypt hashes in the application initialization if needed.
-- $2b$10$WwG.M./t0m.5p3/3910x9.x/26zI3e6r7.w00q3Y09k90o9k3.94q is a sample hash.

INSERT INTO users (name, username, password_hash, role, department) VALUES
('Super Admin', 'admin', '$2a$12$N9Q0e561Gf94kI18OQ3NnuVv7s5m/z2T.K5XG5N2y7M3U9tZ6W.7a', 'Super Admin', NULL),
('OPD Desk', 'opd_desk', '$2a$12$N9Q0e561Gf94kI18OQ3NnuVv7s5m/z2T.K5XG5N2y7M3U9tZ6W.7a', 'OPD Front Desk', 'OPD'),
('Radiology Desk', 'rad_desk', '$2a$12$N9Q0e561Gf94kI18OQ3NnuVv7s5m/z2T.K5XG5N2y7M3U9tZ6W.7a', 'Department Front Desk', 'Radiology'),
('Physio Desk', 'physio_desk', '$2a$12$N9Q0e561Gf94kI18OQ3NnuVv7s5m/z2T.K5XG5N2y7M3U9tZ6W.7a', 'Department Front Desk', 'Physiotherapy'),
('Admission Desk', 'admission_desk', '$2a$12$N9Q0e561Gf94kI18OQ3NnuVv7s5m/z2T.K5XG5N2y7M3U9tZ6W.7a', 'Department Front Desk', 'Admission');

-- Escorts (4 OPD, 2 Radiology, 2 Physiotherapy)
INSERT INTO users (name, username, password_hash, role, department, escort_status) VALUES
('Escort 1', 'escort1', '$2a$12$N9Q0e561Gf94kI18OQ3NnuVv7s5m/z2T.K5XG5N2y7M3U9tZ6W.7a', 'Escort', 'OPD', 'Available'),
('Escort 2', 'escort2', '$2a$12$N9Q0e561Gf94kI18OQ3NnuVv7s5m/z2T.K5XG5N2y7M3U9tZ6W.7a', 'Escort', 'OPD', 'Available'),
('Escort 3', 'escort3', '$2a$12$N9Q0e561Gf94kI18OQ3NnuVv7s5m/z2T.K5XG5N2y7M3U9tZ6W.7a', 'Escort', 'OPD', 'Available'),
('Escort 4', 'escort4', '$2a$12$N9Q0e561Gf94kI18OQ3NnuVv7s5m/z2T.K5XG5N2y7M3U9tZ6W.7a', 'Escort', 'OPD', 'Available'),
('Escort 5', 'escort5', '$2a$12$N9Q0e561Gf94kI18OQ3NnuVv7s5m/z2T.K5XG5N2y7M3U9tZ6W.7a', 'Escort', 'Radiology', 'Available'),
('Escort 6', 'escort6', '$2a$12$N9Q0e561Gf94kI18OQ3NnuVv7s5m/z2T.K5XG5N2y7M3U9tZ6W.7a', 'Escort', 'Radiology', 'Available'),
('Escort 7', 'escort7', '$2a$12$N9Q0e561Gf94kI18OQ3NnuVv7s5m/z2T.K5XG5N2y7M3U9tZ6W.7a', 'Escort', 'Physiotherapy', 'Available'),
('Escort 8', 'escort8', '$2a$12$N9Q0e561Gf94kI18OQ3NnuVv7s5m/z2T.K5XG5N2y7M3U9tZ6W.7a', 'Escort', 'Physiotherapy', 'Available');

-- 2. Cabins (1 to 15, mapping to OPD escorts)
INSERT INTO cabins (cabin_number, primary_escort_id, backup_escort_id) VALUES
(1, 6, 7), (2, 6, 7), (3, 6, 8), (4, 7, 6),
(5, 7, 8), (6, 8, 9), (7, 8, 6), (8, 9, 7),
(9, 9, 8), (10, 6, 9), (11, 7, 9), (12, 8, 7),
(13, 9, 6), (14, 6, 8), (15, 7, 6);

-- 3. Patient Visits
INSERT INTO patient_visits (patient_name, uhid) VALUES
('John Doe', 'UHID-001'),
('Jane Smith', 'UHID-002'),
('Alice Brown', 'UHID-003'),
('Bob White', 'UHID-004'),
('Charlie Green', 'UHID-005');

-- 4. Trips
INSERT INTO trips (visit_id, cabin_id, origin_department, destination_department, status, assigned_escort_id, created_by) VALUES
(1, 1, 'OPD', 'Radiology', 'REQUESTED', NULL, 2),
(2, 2, 'OPD', 'Physiotherapy', 'ASSIGNED', 6, 2),
(3, 3, 'OPD', 'Admission', 'PICKED_UP', 8, 2),
(4, 4, 'OPD', 'Radiology', 'IN_PROCEDURE', 7, 2),
(5, 5, 'OPD', 'Physiotherapy', 'COMPLETED', 9, 2);

-- 5. Trip Events
INSERT INTO trip_events (trip_id, status, actor_user_id) VALUES
(1, 'REQUESTED', 2),
(2, 'REQUESTED', 2),
(2, 'ASSIGNED', 2),
(3, 'REQUESTED', 2),
(3, 'ASSIGNED', 2),
(3, 'PICKED_UP', 8),
(4, 'REQUESTED', 2),
(4, 'ASSIGNED', 2),
(4, 'PICKED_UP', 7),
(4, 'HANDED_OVER', 7),
(4, 'RECEIVED', 3),
(4, 'IN_PROCEDURE', 3),
(5, 'REQUESTED', 2),
(5, 'ASSIGNED', 2),
(5, 'PICKED_UP', 9),
(5, 'HANDED_OVER', 9),
(5, 'RECEIVED', 4),
(5, 'IN_PROCEDURE', 4),
(5, 'RETURN_REQUESTED', 4),
(5, 'RETURN_ASSIGNED', 4),
(5, 'RETURN_PICKED_UP', 12),
(5, 'RETURN_HANDED_OVER', 12),
(5, 'COMPLETED', 2);
