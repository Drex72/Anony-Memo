

const Notification = require("../Models/Notification")
const cron = require('node-cron')


cron.schedule('0 0 * * *', async () => {

  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    await Notification.deleteMany({ timestamp: { $lt: oneWeekAgo } });
    await Notification.deleteMany({ isRead: true });

    console.log('Notification cleanup completed.');
  } catch (error) {
    console.error('Notification cleanup error:', error);
  }
});
