/**
 * Student Routes
 * Handles all student-related API endpoints
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/database');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './public/uploads/photos';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'photo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPG, JPEG, and PNG images are allowed'));
    }
  }
});

/**
 * Generate unique student ID
 */
async function generateStudentId() {
  let isUnique = false;
  let studentId;
  
  while (!isUnique) {
    const randomNum = Math.floor(Math.random() * 900000) + 100000;
    studentId = `STU-${randomNum}`;
    
    const existing = await db.queryOne(
      'SELECT student_id FROM students WHERE student_id = ?',
      [studentId]
    );
    
    if (!existing) {
      isUnique = true;
    }
  }
  
  return studentId;
}

/**
 * GET /api/students
 * Get all students
 */
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    
    let sql = 'SELECT * FROM students ORDER BY created_at DESC';
    let params = [];
    
    if (search) {
      sql = 'SELECT * FROM students WHERE full_name LIKE ? OR email LIKE ? OR student_id LIKE ? ORDER BY full_name';
      const searchTerm = `%${search}%`;
      params = [searchTerm, searchTerm, searchTerm];
    }
    
    const students = await db.query(sql, params);
    
    res.json({
      success: true,
      count: students.length,
      students: students
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/students/:id
 * Get single student by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const student = await db.queryOne(
      'SELECT * FROM students WHERE student_id = ?',
      [id]
    );
    
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }
    
    // Get student grades
    const grades = await db.query(
      'SELECT * FROM grades WHERE student_id = ? ORDER BY created_at DESC',
      [id]
    );
    
    res.json({
      success: true,
      student: {
        ...student,
        grades: grades
      }
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/students
 * Register new student
 */
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const { full_name, email, phone, date_of_birth, address, program } = req.body;
    
    // Validation
    if (!full_name || !email || !program) {
      return res.status(400).json({
        success: false,
        error: 'Full name, email, and program are required'
      });
    }
    
    // Check if email already exists
    const existingStudent = await db.queryOne(
      'SELECT student_id FROM students WHERE email = ?',
      [email]
    );
    
    if (existingStudent) {
      return res.status(409).json({
        success: false,
        error: 'Email already exists'
      });
    }
    
    // Generate student ID
    const student_id = await generateStudentId();
    
    // Handle photo upload
    const photo_url = req.file ? `/uploads/photos/${req.file.filename}` : null;
    
    // Insert student
    await db.query(
      `INSERT INTO students (student_id, full_name, email, phone, date_of_birth, address, program, photo_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [student_id, full_name, email, phone || null, date_of_birth || null, address || null, program, photo_url]
    );
    
    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      student_id: student_id
    });
  } catch (error) {
    console.error('Error registering student:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/students/:id
 * Update student
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, phone, date_of_birth, address, program } = req.body;
    
    // Check if student exists
    const student = await db.queryOne(
      'SELECT student_id FROM students WHERE student_id = ?',
      [id]
    );
    
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }
    
    // Update student
    await db.query(
      `UPDATE students 
       SET full_name = ?, email = ?, phone = ?, date_of_birth = ?, address = ?, program = ?
       WHERE student_id = ?`,
      [full_name, email, phone, date_of_birth, address, program, id]
    );
    
    res.json({
      success: true,
      message: 'Student updated successfully'
    });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/students/:id
 * Delete student
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if student exists
    const student = await db.queryOne(
      'SELECT student_id, photo_url FROM students WHERE student_id = ?',
      [id]
    );
    
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }
    
    // Delete photo file if exists
    if (student.photo_url) {
      const photoPath = path.join(__dirname, '..', 'public', student.photo_url);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }
    
    // Delete student (grades will be deleted via CASCADE)
    await db.query('DELETE FROM students WHERE student_id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/students/:id/statistics
 * Get student statistics
 */
router.get('/:id/statistics', async (req, res) => {
  try {
    const { id } = req.params;
    
    const stats = await db.queryOne(
      'SELECT * FROM student_statistics WHERE student_id = ?',
      [id]
    );
    
    if (!stats) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }
    
    res.json({
      success: true,
      statistics: stats
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
