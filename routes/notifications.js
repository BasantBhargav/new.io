// routes/notifications.js
const express = require('express');
const router = express.Router();
const Notification = require('../schema/notification');

// ✅ Send notification (no change)
router.post('/send', async (req, res) => {
  try {
    const { role, title, message, priority } = req.body;
    const newNotification = new Notification({
      role,
      title,
      message,
      priority
    });
    await newNotification.save();
    res.json({ success: true, message: 'Notification sent successfully', notification: newNotification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 🔄 Updated: Get notifications for specific role (per-user filtering)
router.get('/:role', async (req, res) => {
  try {
    const { role } = req.params;
    const userId = req.session?.userId; // Get user ID from session
    
    const notifications = await Notification.find({
      $or: [{ role }, { role: 'all' }],
      // 🆕 Exclude notifications hidden by current user
      'hiddenBy.userId': { $ne: userId }
    }).sort({ timestamp: -1 });

    // 🆕 Mark isRead based on per-user tracking
    const processedNotifications = notifications.map(notification => {
      const userRead = notification.readBy.find(r => r.userId === userId);
      return {
        ...notification.toObject(),
        isRead: !!userRead
      };
    });

    res.json({ success: true, notifications: processedNotifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 🔄 Updated: Mark as read (per-user)
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const notification = await Notification.findById(id);
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });

    // 🆕 Check if already read by this user
    const alreadyRead = notification.readBy.find(r => r.userId === userId);
    
    if (!alreadyRead) {
      notification.readBy.push({ userId, readAt: new Date() });
      await notification.save();
    }

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 🆕 Hide notification for specific user (individual delete)
router.delete('/:id/hide', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const notification = await Notification.findById(id);
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });

    // 🆕 Check if already hidden by this user
    const alreadyHidden = notification.hiddenBy.find(h => h.userId === userId);
    
    if (!alreadyHidden) {
      notification.hiddenBy.push({ userId, hiddenAt: new Date() });
      await notification.save();
    }

    res.json({ success: true, message: 'Notification hidden successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 🔄 Updated: Clear all for a user (hide all notifications for that user)
router.delete('/:role/clear', async (req, res) => {
  try {
    const { role } = req.params;
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // 🆕 Hide all notifications for this user instead of deleting globally
    const notifications = await Notification.find({
      $or: [{ role }, { role: 'all' }],
      'hiddenBy.userId': { $ne: userId }
    });

    for (let notification of notifications) {
      const alreadyHidden = notification.hiddenBy.find(h => h.userId === userId);
      if (!alreadyHidden) {
        notification.hiddenBy.push({ userId, hiddenAt: new Date() });
        await notification.save();
      }
    }

    res.json({ success: true, message: 'All notifications cleared for user' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
