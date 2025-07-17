const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      service: process.env.EMAIL_SERVICE,
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async sendEmail(to, subject, text, html) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
        html
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent to ${to}:`, result.messageId);
      return result;
    } catch (error) {
      logger.error('Error sending email:', error);
      throw error;
    }
  }

  async sendDueDateReminder(email, task) {
    const subject = `⏰ Task Due Soon: ${task.title}`;
    const text = `Hi there!\n\nYour task "${task.title}" is due on ${new Date(task.due_date).toLocaleDateString()}.\n\nDon't forget to complete it!\n\nBest regards,\nTaskFlow Team`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #007bff;">⏰ Task Due Soon</h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">${task.title}</h3>
          <p style="color: #666; margin-bottom: 10px;"><strong>Due Date:</strong> ${new Date(task.due_date).toLocaleDateString()}</p>
          <p style="color: #666; margin-bottom: 10px;"><strong>Priority:</strong> ${task.priority}</p>
          ${task.description ? `<p style="color: #666;"><strong>Description:</strong> ${task.description}</p>` : ''}
        </div>
        <p style="color: #333;">Don't forget to complete your task!</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 14px;">Best regards,<br>TaskFlow Team</p>
        </div>
      </div>
    `;

    return this.sendEmail(email, subject, text, html);
  }

  async sendTaskUpdateNotification(email, task, updateType) {
    const subject = `📋 Task Updated: ${task.title}`;
    const text = `Hi there!\n\nYour task "${task.title}" has been ${updateType}.\n\nBest regards,\nTaskFlow Team`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #007bff;">📋 Task Updated</h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">${task.title}</h3>
          <p style="color: #666; margin-bottom: 10px;"><strong>Status:</strong> ${updateType}</p>
          <p style="color: #666; margin-bottom: 10px;"><strong>Priority:</strong> ${task.priority}</p>
          ${task.due_date ? `<p style="color: #666; margin-bottom: 10px;"><strong>Due Date:</strong> ${new Date(task.due_date).toLocaleDateString()}</p>` : ''}
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 14px;">Best regards,<br>TaskFlow Team</p>
        </div>
      </div>
    `;

    return this.sendEmail(email, subject, text, html);
  }

  async sendDailySummary(email, userName, summary) {
    const subject = `📊 Daily Task Summary - ${new Date().toLocaleDateString()}`;
    const text = `Hi ${userName}!\n\nHere's your daily task summary:\n\nCompleted: ${summary.completed}\nPending: ${summary.pending}\nOverdue: ${summary.overdue}\n\nKeep up the great work!\n\nBest regards,\nTaskFlow Team`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #007bff;">📊 Daily Task Summary</h2>
        <p style="color: #333;">Hi ${userName}!</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Today's Summary</h3>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="color: #28a745;"><strong>✅ Completed:</strong></span>
            <span style="color: #28a745; font-weight: bold;">${summary.completed}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="color: #ffc107;"><strong>⏳ Pending:</strong></span>
            <span style="color: #ffc107; font-weight: bold;">${summary.pending}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="color: #dc3545;"><strong>⚠️ Overdue:</strong></span>
            <span style="color: #dc3545; font-weight: bold;">${summary.overdue}</span>
          </div>
        </div>
        <p style="color: #333;">Keep up the great work!</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 14px;">Best regards,<br>TaskFlow Team</p>
        </div>
      </div>
    `;

    return this.sendEmail(email, subject, text, html);
  }
}

module.exports = new EmailService();