-- Student Validation System Database Setup
-- Run this file to create the database and tables

CREATE DATABASE IF NOT EXISTS student_validation_system 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE student_validation_system;

-- Students table
CREATE TABLE IF NOT EXISTS students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    address TEXT,
    program VARCHAR(100),
    photo_url VARCHAR(255),
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive', 'graduated') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_student_id (student_id),
    INDEX idx_email (email),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Grades table
CREATE TABLE IF NOT EXISTS grades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id VARCHAR(20) NOT NULL,
    subject VARCHAR(100),
    grade DECIMAL(5,2) NOT NULL CHECK (grade >= 0 AND grade <= 20),
    status ENUM('Validé', 'Ratt', 'NV') NOT NULL,
    semester VARCHAR(20),
    academic_year VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    INDEX idx_student_grade (student_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sessions/History table
CREATE TABLE IF NOT EXISTS validation_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_name VARCHAR(100),
    total_students INT NOT NULL,
    valide_count INT DEFAULT 0,
    ratt_count INT DEFAULT 0,
    nv_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Session details table
CREATE TABLE IF NOT EXISTS session_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id INT NOT NULL,
    student_id VARCHAR(20) NOT NULL,
    average_grade DECIMAL(5,2) NOT NULL,
    status ENUM('Validé', 'Ratt', 'NV') NOT NULL,
    FOREIGN KEY (session_id) REFERENCES validation_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    INDEX idx_session (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data for testing
INSERT INTO students (student_id, full_name, email, phone, program, status) VALUES
('STU-100001', 'Ahmed El Mansouri', 'ahmed.mansouri@example.com', '+212612345678', 'Computer Science', 'active'),
('STU-100002', 'Fatima Zahra', 'fatima.zahra@example.com', '+212623456789', 'Mathematics', 'active'),
('STU-100003', 'Mohamed Alami', 'mohamed.alami@example.com', '+212634567890', 'Physics', 'active');

-- Insert sample grades
INSERT INTO grades (student_id, subject, grade, status, semester, academic_year) VALUES
('STU-100001', 'Database Systems', 15.50, 'Validé', 'Fall', '2024-2025'),
('STU-100002', 'Algebra', 18.00, 'Validé', 'Fall', '2024-2025'),
('STU-100003', 'Mechanics', 7.50, 'Ratt', 'Fall', '2024-2025');

-- Create view for easy student statistics
CREATE OR REPLACE VIEW student_statistics AS
SELECT 
    s.student_id,
    s.full_name,
    s.program,
    COUNT(g.id) as total_grades,
    AVG(g.grade) as average_grade,
    SUM(CASE WHEN g.status = 'Validé' THEN 1 ELSE 0 END) as passed_count,
    SUM(CASE WHEN g.status = 'Ratt' THEN 1 ELSE 0 END) as ratt_count,
    SUM(CASE WHEN g.status = 'NV' THEN 1 ELSE 0 END) as failed_count
FROM students s
LEFT JOIN grades g ON s.student_id = g.student_id
GROUP BY s.student_id, s.full_name, s.program;
