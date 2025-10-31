const cron = require('node-cron');
const Task = require('../models/Task');
const { sendReminderEmail } = require('./emailService');

// Run every minute to check for reminders
const reminderScheduler = cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60000);

    // Find tasks that need reminders
    const tasksToRemind = await Task.find({
      isNotified: false,
      isCompleted: false,
      reminderAt: {
        $gte: now,
        $lte: fiveMinutesFromNow
      }
    }).populate('userId', 'name email');

    if (tasksToRemind.length > 0) {
      console.log(`📧 Processing ${tasksToRemind.length} reminder(s)...`);

      for (const task of tasksToRemind) {
        try {
          // Send email notification
          await sendReminderEmail(task);

          // Mark as notified
          task.isNotified = true;
          await task.save();

          console.log(`✅ Reminder sent for task: ${task.title}`);
        } catch (error) {
          console.error(`❌ Failed to send reminder for task ${task._id}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error('❌ Reminder Scheduler Error:', error.message);
  }
}, {
  scheduled: false
});

module.exports = reminderScheduler;
