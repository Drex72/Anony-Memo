




const Mongoose = require("mongoose")
const Schema = Mongoose.Schema

const notificationSchema = new Schema({
  to: {
    type: Mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  from: {
    type: Mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: new Date
  },
  isRead: {
    type: Boolean,
    default: false
  }
});



module.exports = {
  Notification: notificationSchema
};














