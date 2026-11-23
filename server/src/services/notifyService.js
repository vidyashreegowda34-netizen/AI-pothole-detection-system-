const prisma = require('../config/db');

/**
 * Creates an in-app notification and logs simulated SMS / WhatsApp message
 */
async function sendNotification({ userId, issueId, titleEn, titleKn, messageEn, messageKn, channel = 'IN_APP' }) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        issueId,
        titleEn,
        titleKn,
        messageEn,
        messageKn,
        channel,
      },
    });

    // Also simulate real-time SMS / WhatsApp log for civic visibility
    console.log(`\n📢 [SIMULATED SMS / WHATSAPP DISPATCH]`);
    console.log(`📱 User: ${userId} | Channel: ${channel}`);
    console.log(`💬 [KN]: ${titleKn} - ${messageKn}`);
    console.log(`💬 [EN]: ${titleEn} - ${messageEn}\n`);

    return notification;
  } catch (error) {
    console.error('Failed to dispatch notification:', error.message);
    return null;
  }
}

module.exports = {
  sendNotification,
};
