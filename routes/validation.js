/**
 * Validation Routes
 * Handles validation session operations
 */

const express = require('express');
const router = express.Router();
const db = require('../config/database');

/**
 * Calculate validation status based on grade
 */
function getStatus(grade) {
  if (grade >= 10) return 'Validé';
  if (grade >= 8) return 'Ratt';
  return 'NV';
}

/**
 * POST /api/validation/add-grade
 * Add a grade for a student
 */
router.post('/add-grade', async (req, res) => {
  try {
    const { student_id, subject, grade, semester, academic_year } = req.body;
    
    // Validation
    if (!student_id || !grade) {
      return res.status(400).json({
        success: false,
        error: 'Student ID and grade are required'
      });
    }
    
    if (grade < 0 || grade > 20) {
      return res.status(400).json({
        success: false,
        error: 'Grade must be between 0 and 20'
      });
    }
    
    // Check if student exists
    const student = await db.queryOne(
      'SELECT student_id FROM students WHERE student_id = ?',
      [student_id]
    );
    
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }
    
    // Calculate status
    const status = getStatus(parseFloat(grade));
    
    // Insert grade
    await db.query(
      `INSERT INTO grades (student_id, subject, grade, status, semester, academic_year) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [student_id, subject || 'General', grade, status, semester || null, academic_year || null]
    );
    
    res.json({
      success: true,
      message: 'Grade added successfully',
      status: status
    });
  } catch (error) {
    console.error('Error adding grade:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/validation/save-session
 * Save validation session
 */
router.post('/save-session', async (req, res) => {
  try {
    const { session_name, students_data } = req.body;
    
    if (!students_data || !Array.isArray(students_data) || students_data.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid students data'
      });
    }
    
    // Calculate statistics
    const total_students = students_data.length;
    const valide_count = students_data.filter(s => s.status === 'Validé').length;
    const ratt_count = students_data.filter(s => s.status === 'Ratt').length;
    const nv_count = students_data.filter(s => s.status === 'NV').length;
    
    // Use transaction
    const session_id = await db.transaction(async (connection) => {
      // Insert session
      const [sessionResult] = await connection.execute(
        `INSERT INTO validation_sessions (session_name, total_students, valide_count, ratt_count, nv_count) 
         VALUES (?, ?, ?, ?, ?)`,
        [session_name || `Session ${new Date().toLocaleString()}`, total_students, valide_count, ratt_count, nv_count]
      );
      
      const sessionId = sessionResult.insertId;
      
      // Insert session details
      for (const student of students_data) {
        await connection.execute(
          `INSERT INTO session_details (session_id, student_id, average_grade, status) 
           VALUES (?, ?, ?, ?)`,
          [sessionId, student.student_id || student.id, student.average || student.avg, student.status]
        );
      }
      
      return sessionId;
    });
    
    res.json({
      success: true,
      message: 'Session saved successfully',
      session_id: session_id
    });
  } catch (error) {
    console.error('Error saving session:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/validation/sessions
 * Get all validation sessions
 */
router.get('/sessions', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    
    const sessions = await db.query(
      'SELECT * FROM validation_sessions ORDER BY created_at DESC LIMIT ?',
      [limit]
    );
    
    res.json({
      success: true,
      count: sessions.length,
      sessions: sessions
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/validation/sessions/:id
 * Get session details
 */
router.get('/sessions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get session info
    const session = await db.queryOne(
      'SELECT * FROM validation_sessions WHERE id = ?',
      [id]
    );
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    // Get session details with student info
    const details = await db.query(
      `SELECT sd.*, s.full_name, s.email 
       FROM session_details sd
       LEFT JOIN students s ON sd.student_id = s.student_id
       WHERE sd.session_id = ?`,
      [id]
    );
    
    res.json({
      success: true,
      session: {
        ...session,
        details: details
      }
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/validation/statistics
 * Get overall statistics
 */
router.get('/statistics', async (req, res) => {
  try {
    // Total students
    const totalResult = await db.queryOne(
      'SELECT COUNT(*) as total FROM students WHERE status = "active"'
    );
    
    // Grades statistics
    const gradesStats = await db.queryOne(
      `SELECT 
        COUNT(*) as total_grades,
        AVG(grade) as average_grade,
        SUM(CASE WHEN status = 'Validé' THEN 1 ELSE 0 END) as valide_count,
        SUM(CASE WHEN status = 'Ratt' THEN 1 ELSE 0 END) as ratt_count,
        SUM(CASE WHEN status = 'NV' THEN 1 ELSE 0 END) as nv_count
       FROM grades`
    );
    
    // Total sessions
    const sessionsResult = await db.queryOne(
      'SELECT COUNT(*) as total FROM validation_sessions'
    );
    
    res.json({
      success: true,
      statistics: {
        total_students: totalResult.total,
        total_sessions: sessionsResult.total,
        grades: gradesStats
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/validation/calculate
 * Calculate validation status for a grade
 */
router.post('/calculate', (req, res) => {
  try {
    const { grade } = req.body;
    
    if (grade === undefined || grade === null) {
      return res.status(400).json({
        success: false,
        error: 'Grade is required'
      });
    }
    
    const numGrade = parseFloat(grade);
    
    if (isNaN(numGrade) || numGrade < 0 || numGrade > 20) {
      return res.status(400).json({
        success: false,
        error: 'Grade must be between 0 and 20'
      });
    }
    
    const status = getStatus(numGrade);
    
    res.json({
      success: true,
      grade: numGrade,
      status: status
    });
  } catch (error) {
    console.error('Error calculating status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
