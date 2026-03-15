import dotenv from 'dotenv';
import { pathToFileURL } from 'url';
import { connectDB } from '../../models/index.js';

dotenv.config();

const runDedup = async () => {
  try {
    await connectDB.authenticate();
    console.log('✅ Database connection established');

    const transaction = await connectDB.transaction();

    try {
      const [conversationResult] = await connectDB.query(
        `DELETE FROM conversation_participants a
         USING conversation_participants b
         WHERE a.conversation_id = b.conversation_id
           AND a.user_id = b.user_id
           AND a.id > b.id;`,
        { transaction }
      );

      const [messageReadResult] = await connectDB.query(
        `DELETE FROM message_reads a
         USING message_reads b
         WHERE a.message_id = b.message_id
           AND a.user_id = b.user_id
           AND a.id > b.id;`,
        { transaction }
      );

      await transaction.commit();

      const conversationDeleted = conversationResult?.rowCount ?? 0;
      const messageReadDeleted = messageReadResult?.rowCount ?? 0;

      console.log(`✅ Removed ${conversationDeleted} duplicate conversation participants`);
      console.log(`✅ Removed ${messageReadDeleted} duplicate message reads`);

      process.exit(0);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('❌ Dedup failed:', error);
    process.exit(1);
  }
};

const isDirectRun =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  runDedup();
}
