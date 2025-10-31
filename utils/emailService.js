const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send reminder email
const sendReminderEmail = async (task) => {
  try {
    // Check if email configuration is set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('⚠️  Email configuration not set. Skipping email notification.');
      console.log(`📝 Task Reminder: "${task.title}" for ${task.userId.email}`);
      return;
    }

    const transporter = createTransporter();

    const dueDate = new Date(task.dueDate);
    const formattedDate = dueDate.toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'short'
    });

    const mailOptions = {
      from: `"Task Reminder App" <${process.env.EMAIL_USER}>`,
      to: task.userId.email,
      subject: `⏰ Reminder: ${task.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Task Reminder</h2>
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1F2937; margin-top: 0;">${task.title}</h3>
            ${task.description ? `<p style="color: #6B7280;">${task.description}</p>` : ''}
            <div style="margin-top: 15px;">
              <p style="margin: 5px 0;"><strong>Due Date:</strong> ${formattedDate}</p>
              <p style="margin: 5px 0;"><strong>Priority:</strong> <span style="text-transform: capitalize; color: ${getPriorityColor(task.priority)};">${task.priority}</span></p>
            </div>
          </div>
          <p style="color: #6B7280; font-size: 14px;">
            Don't forget to complete this task on time!
          </p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
            <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
              This is an automated reminder from Task Reminder App.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${task.userId.email} for task: ${task.title}`);
  } catch (error) {
    console.error('❌ Email Send Error:', error.message);
    throw error;
  }
};

// Helper function to get priority color
const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high':
      return '#EF4444';
    case 'medium':
      return '#F59E0B';
    case 'low':
      return '#10B981';
    default:
      return '#6B7280';
  }
};

module.exports = {
  sendReminderEmail
};
