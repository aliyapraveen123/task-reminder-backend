const Task = require('../models/Task');

// @desc    Get all tasks for a user
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { status, priority, sortBy } = req.query;
    
    // Build query
    const query = { userId: req.user._id };
    
    if (status === 'completed') {
      query.isCompleted = true;
    } else if (status === 'pending') {
      query.isCompleted = false;
    }
    
    if (priority) {
      query.priority = priority;
    }

    // Build sort
    let sort = {};
    if (sortBy === 'dueDate') {
      sort = { dueDate: 1 };
    } else if (sortBy === 'priority') {
      sort = { priority: -1, dueDate: 1 };
    } else {
      sort = { createdAt: -1 };
    }

    const tasks = await Task.find(query).sort(sort);

    res.status(200).json({
      status: 'success',
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    console.error('Get Tasks Error:', error.message);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found'
      });
    }

    // Check if task belongs to user
    if (task.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to access this task'
      });
    }

    res.status(200).json({
      status: 'success',
      data: task
    });
  } catch (error) {
    console.error('Get Task Error:', error.message);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, reminderAt, priority } = req.body;

    // Validation
    if (!title || !dueDate || !reminderAt) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide title, due date, and reminder time'
      });
    }

    // Validate dates
    const due = new Date(dueDate);
    const reminder = new Date(reminderAt);
    const now = new Date();

    if (due <= now) {
      return res.status(400).json({
        status: 'error',
        message: 'Due date must be in the future'
      });
    }

    if (reminder >= due) {
      return res.status(400).json({
        status: 'error',
        message: 'Reminder time must be before due date'
      });
    }

    if (reminder <= now) {
      return res.status(400).json({
        status: 'error',
        message: 'Reminder time must be in the future'
      });
    }

    const task = await Task.create({
      userId: req.user._id,
      title,
      description,
      dueDate: due,
      reminderAt: reminder,
      priority: priority || 'medium'
    });

    res.status(201).json({
      status: 'success',
      data: task
    });
  } catch (error) {
    console.error('Create Task Error:', error.message);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found'
      });
    }

    // Check if task belongs to user
    if (task.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this task'
      });
    }

    const { title, description, dueDate, reminderAt, priority } = req.body;

    // Validate dates if provided
    if (dueDate || reminderAt) {
      const due = new Date(dueDate || task.dueDate);
      const reminder = new Date(reminderAt || task.reminderAt);

      if (reminder >= due) {
        return res.status(400).json({
          status: 'error',
          message: 'Reminder time must be before due date'
        });
      }
    }

    // Update fields
    task.title = title || task.title;
    task.description = description !== undefined ? description : task.description;
    task.dueDate = dueDate || task.dueDate;
    task.reminderAt = reminderAt || task.reminderAt;
    task.priority = priority || task.priority;

    await task.save();

    res.status(200).json({
      status: 'success',
      data: task
    });
  } catch (error) {
    console.error('Update Task Error:', error.message);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found'
      });
    }

    // Check if task belongs to user
    if (task.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this task'
      });
    }

    await task.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'Task deleted successfully',
      data: {}
    });
  } catch (error) {
    console.error('Delete Task Error:', error.message);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

// @desc    Mark task as completed
// @route   POST /api/tasks/:id/complete
// @access  Private
const completeTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found'
      });
    }

    // Check if task belongs to user
    if (task.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this task'
      });
    }

    task.isCompleted = true;
    task.completedAt = new Date();
    await task.save();

    res.status(200).json({
      status: 'success',
      data: task
    });
  } catch (error) {
    console.error('Complete Task Error:', error.message);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get task statistics
// @route   GET /api/tasks/stats
// @access  Private
const getTaskStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalTasks = await Task.countDocuments({ userId });
    const completedTasks = await Task.countDocuments({ userId, isCompleted: true });
    const pendingTasks = await Task.countDocuments({ userId, isCompleted: false });
    const overdueTasks = await Task.countDocuments({
      userId,
      isCompleted: false,
      dueDate: { $lt: new Date() }
    });

    res.status(200).json({
      status: 'success',
      data: {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks,
        overdue: overdueTasks
      }
    });
  } catch (error) {
    console.error('Get Stats Error:', error.message);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  completeTask,
  getTaskStats
};
