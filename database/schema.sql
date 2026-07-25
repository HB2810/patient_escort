-- Patient Escort Coordination System - Schema

CREATE DATABASE IF NOT EXISTS patient_escort_db;
USE patient_escort_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Super Admin', 'OPD Front Desk', 'Department Front Desk', 'Escort') NOT NULL,
    department ENUM('OPD', 'Radiology', 'Physiotherapy', 'Admission') NULL,
    is_active BOOLEAN DEFAULT TRUE,
    escort_status ENUM('Available', 'On Break', 'Busy') DEFAULT 'Available'
);

CREATE TABLE IF NOT EXISTS cabins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cabin_number INT UNIQUE NOT NULL,
    primary_escort_id INT NULL,
    backup_escort_id INT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (primary_escort_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (backup_escort_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS patient_visits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_name VARCHAR(255) NOT NULL,
    uhid VARCHAR(50) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    visit_id INT NOT NULL,
    cabin_id INT NULL,
    origin_department VARCHAR(100) NOT NULL,
    destination_department VARCHAR(100) NOT NULL,
    status ENUM(
      'REQUESTED', 'ASSIGNED', 'PICKED_UP', 'HANDED_OVER', 
      'RECEIVED', 'IN_PROCEDURE', 'RETURN_REQUESTED', 
      'RETURN_ASSIGNED', 'RETURN_PICKED_UP', 'RETURN_HANDED_OVER', 
      'COMPLETED', 'CANCELLED'
    ) NOT NULL,
    assigned_escort_id INT NULL,
    is_return_leg BOOLEAN DEFAULT FALSE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (visit_id) REFERENCES patient_visits(id),
    FOREIGN KEY (cabin_id) REFERENCES cabins(id),
    FOREIGN KEY (assigned_escort_id) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS trip_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    actor_user_id INT NOT NULL,
    occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    FOREIGN KEY (actor_user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_assigned_escort_id ON trips(assigned_escort_id);
CREATE INDEX idx_trip_events_trip_id ON trip_events(trip_id);
