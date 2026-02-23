import models from '../../models/index.js';

const { University } = models;

export default async function listUniversitiesController(req, res) {
  try {
    const { limit = 100, offset = 0 } = req.query;

    const universities = await University.findAll({
      order: [['name', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json(universities);
  } catch (error) {
    console.error('Error listing universities:', error);
    res.status(500).json({
      message: 'Failed to list universities',
      error: error.message
    });
  }
}
