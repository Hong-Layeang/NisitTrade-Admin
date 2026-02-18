import models from './src/models/index.js';
import bcrypt from 'bcryptjs';

const seed = async () => {
    try {
        // Sync tables first (optional, if not done in server.js)
        await models.sequelize.sync({ force: true }); // WARNING: force: true will drop existing tables
        console.log('Tables synced!');

        // --- Universities ---
        const uni1 = await models.University.create({ name: 'Harvard University', domain: 'harvard.edu' });
        const uni2 = await models.University.create({ name: 'MIT', domain: 'mit.edu' });

        // --- Users ---
        const passwordHash = await bcrypt.hash('123456', 10);
        const user1 = await models.User.create({
            full_name: 'Alice Johnson',
            email: 'alice@example.com',
            password_hash: passwordHash,
            role: 'user',
            university_id: uni1.id,
        });

        const user2 = await models.User.create({
            full_name: 'Bob Smith',
            email: 'bob@example.com',
            password_hash: passwordHash,
            role: 'admin',
            university_id: uni2.id,
        });

        // --- Categories ---
        const cat1 = await models.Category.create({ name: 'Electronics' });
        const cat2 = await models.Category.create({ name: 'Books' });

        // --- Products ---
        const prod1 = await models.Product.create({
            title: 'Laptop',
            description: 'A powerful gaming laptop',
            price: 1200.00,
            status: 'available',
            user_id: user1.id,
            category_id: cat1.id,
        });

        const prod2 = await models.Product.create({
            title: 'Science Book',
            description: 'Physics textbook',
            price: 50.00,
            status: 'available',
            user_id: user2.id,
            category_id: cat2.id,
        });

        // --- Product Images ---
        await models.ProductImage.create({ image_url: 'https://example.com/laptop.jpg', product_id: prod1.id });
        await models.ProductImage.create({ image_url: 'https://example.com/book.jpg', product_id: prod2.id });

        // --- Conversations ---
        const conv1 = await models.Conversation.create({ product_id: prod1.id });

        // --- Conversation Participants ---
        await models.ConversationParticipant.create({ conversation_id: conv1.id, user_id: user1.id });
        await models.ConversationParticipant.create({ conversation_id: conv1.id, user_id: user2.id });

        // --- Messages ---
        const msg1 = await models.Message.create({
            message_text: 'Is this laptop still available?',
            conversation_id: conv1.id,
            sender_id: user2.id,
        });

        const msg2 = await models.Message.create({
            message_text: 'Yes, it is!',
            conversation_id: conv1.id,
            sender_id: user1.id,
        });

        // --- Message Reads ---
        await models.MessageRead.create({ message_id: msg1.id, user_id: user1.id });
        await models.MessageRead.create({ message_id: msg2.id, user_id: user2.id });

        console.log('Fake data inserted successfully!');
        process.exit(0);

    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
};

seed();
