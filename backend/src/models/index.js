import { Sequelize, DataTypes } from 'sequelize';
import connectDB from '../config/database.js';

import UserModel from './user.js';
import ProductModel from './product.js';
import CategoryModel from './category.js';
import UniversityModel from './university.js';
import ConversationModel from './conversation.js';
import ConversationParticipantModel from './conversation_participant.js';
import MessageModel from './message.js';
import MessageReadModel from './message_read.js';
import ProductImageModel from './product_image.js';

const models = {};

// Initialize models
models.User = UserModel(connectDB, DataTypes);
models.Product = ProductModel(connectDB, DataTypes);
models.Category = CategoryModel(connectDB, DataTypes);
models.University = UniversityModel(connectDB, DataTypes);
models.Conversation = ConversationModel(connectDB, DataTypes);
models.ConversationParticipant = ConversationParticipantModel(connectDB, DataTypes);
models.Message = MessageModel(connectDB, DataTypes);
models.MessageRead = MessageReadModel(connectDB, DataTypes);
models.ProductImage = ProductImageModel(connectDB, DataTypes);

// Run associations
Object.values(models)
    .filter(model => typeof model.associate === 'function')
    .forEach(model => model.associate(models));

// **Export both models and Sequelize instance**
export default { ...models, sequelize: connectDB };
