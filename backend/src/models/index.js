import { DataTypes } from 'sequelize';

import connectDB from '../config/database.js';
import userModel from './user.js';
import universityModel from './university.js';
import categoryModel from './category.js';
import productModel from './product.js';
import productImageModel from './product_image.js';
import conversationModel from './conversation.js';
import conversationParticipantModel from './conversation_participant.js';
import messageModel from './message.js';
import messageReadModel from './message_read.js';
import likeModel from './like.js';
import commentModel from './comment.js';
import savedListingModel from './saved_listing.js';
import productReportModel from './product_report.js';
import userFollowModel from './user_follow.js';

const models = {
  User: userModel(connectDB, DataTypes),
  University: universityModel(connectDB, DataTypes),
  Category: categoryModel(connectDB, DataTypes),
  Product: productModel(connectDB, DataTypes),
  ProductImage: productImageModel(connectDB, DataTypes),
  Conversation: conversationModel(connectDB, DataTypes),
  ConversationParticipant: conversationParticipantModel(connectDB, DataTypes),
  Message: messageModel(connectDB, DataTypes),
  MessageRead: messageReadModel(connectDB, DataTypes),
  Like: likeModel(connectDB, DataTypes),
  Comment: commentModel(connectDB, DataTypes),
  SavedListing: savedListingModel(connectDB, DataTypes),
  ProductReport: productReportModel(connectDB, DataTypes),
  UserFollow: userFollowModel(connectDB, DataTypes),
};

Object.values(models).forEach(model => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

export { connectDB };
export default models;
