const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  reminderAt: {
    type: Date,
    required: [true, 'Reminder time is required']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  isNotified: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ reminderAt: 1, isNotified: 1 });

// Pre-save middleware to validate reminder time
taskSchema.pre('save', function(next) {
  if (this.reminderAt >= this.dueDate) {
    return next(new Error('Reminder time must be before due date'));
  }
  next();
});

// Method to mark task as completed
taskSchema.methods.markComplete = function() {
  this.isCompleted = true;
  this.completedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Task', taskSchema);
