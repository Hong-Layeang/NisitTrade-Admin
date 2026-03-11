import { DataTypes } from 'sequelize';

import connectDB from '../config/database.js';

export default async function ensureCommunityPostSchema() {
  const queryInterface = connectDB.getQueryInterface();
  const tableDefinition = await queryInterface.describeTable('community_posts');

  if (!tableDefinition.image_urls) {
    await queryInterface.addColumn('community_posts', 'image_urls', {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: false,
      defaultValue: [],
    });

    console.log('Added community_posts.image_urls column');
  }

  await connectDB.query(`
    UPDATE community_posts
    SET image_urls = CASE
      WHEN image_url IS NULL OR BTRIM(image_url) = '' THEN ARRAY[]::TEXT[]
      ELSE ARRAY[image_url]
    END
    WHERE image_urls IS NULL OR COALESCE(cardinality(image_urls), 0) = 0;
  `);
}