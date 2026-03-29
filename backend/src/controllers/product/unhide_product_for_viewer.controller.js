import models from '../../models/index.js';

const { HiddenItem } = models;

export default async function unhideProductForViewerController(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await HiddenItem.destroy({
      where: {
        user_id: userId,
        hideable_type: 'Product',
        hideable_id: Number(id),
      },
    });

    return res.status(200).json({ success: true, hidden: false });
  } catch (error) {
    console.error('Error unhiding product for viewer:', error);
    return res.status(500).json({
      message: 'Failed to unhide product for viewer',
      error: error.message,
    });
  }
}