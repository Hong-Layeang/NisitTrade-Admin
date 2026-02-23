import models from '../../models/index.js';

const { University } = models;

export default async function getUniversityController(req, res) {
  try {
    const { id } = req.params;

    const university = await University.findByPk(id);
    if (!university) {
      return res.status(404).json({ message: 'University not found' });
    }

    res.json(university);
  } catch (error) {
    console.error('Error fetching university:', error);
    res.status(500).json({
      message: 'Failed to fetch university',
      error: error.message
    });
  }
}
