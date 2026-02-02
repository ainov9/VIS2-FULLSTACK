/**
 * Session Routes
 * Handles validation session history
 */

const express = require('express');
const router = express.Router();
const db = require('../config/database');

/**
 * GET /api/sessions
 * Get all sessions
 */
router.get('/', async (req, res) => {
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
 * GET /api/sessions/:id
 * Get single session with details
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
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
        students: details
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
 * DELETE /api/sessions/:id
 * Delete a session
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const session = await db.queryOne(
      'SELECT id FROM validation_sessions WHERE id = ?',
      [id]
    );
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    await db.query('DELETE FROM validation_sessions WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
