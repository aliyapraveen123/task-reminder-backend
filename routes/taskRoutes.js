const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  completeTask,
  getTaskStats
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Task CRUD routes
router.route('/')
  .get(getTasks)
  .post(createTask);

router.get('/stats', getTaskStats);

router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

router.post('/:id/complete', completeTask);

module.exports = router;
