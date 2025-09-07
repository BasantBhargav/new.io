const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../schema/user');
const Hospital = require('../schema/hospital');

// Middleware to check if user is hospital staff
const isHospitalStaff = (req, res, next) => {
  if (!req.session.userId || req.session.role !== 'hospital_staff') {
    return res.status(401).json({ error: 'Hospital staff access required' });
  }
  next();
};

// GET - Fetch hospital settings
router.get('/api/hospital/settings', isHospitalStaff, async (req, res) => {
  try {
    const userId = req.session.userId;
    
    // Get user details
    const user = await User.findById(userId).select('-password_hash');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get hospital details where this user is admin
    const hospital = await Hospital.findOne({ admin_user_id: userId });
    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found for this user' });
    }

    // Prepare response data (excluding sensitive info)
    const settingsData = {
      hospital: {
        hospital_id: hospital.hospital_id,
        name: hospital.name,
        location: hospital.location,
        contact: hospital.contact,
        established_year: hospital.established_year,
        bed_capacity: hospital.bed_capacity,
        total_doctors: hospital.total_doctors,
        total_staff: hospital.total_staff,
        license_number: hospital.license_number,
        accreditation: hospital.accreditation || [],
        departments: hospital.departments || [],
        facilities: hospital.facilities || [],
        emergency_contact: hospital.emergency_contact,
        is_verified: hospital.is_verified,
        is_active: hospital.is_active,
        created_at: hospital.created_at
      },
      admin: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        verified: user.verified,
        created_at: user.created_at
      }
    };

    res.json({
      success: true,
      data: settingsData
    });

  } catch (error) {
    console.error('Error fetching hospital settings:', error);
    res.status(500).json({ 
      error: 'Unable to fetch hospital settings',
      details: error.message 
    });
  }
});

// PUT - Update hospital information
router.put('/api/hospital/settings/info', isHospitalStaff, async (req, res) => {
  try {
    const userId = req.session.userId;
    const { 
      name, 
      established_year, 
      bed_capacity, 
      total_doctors, 
      total_staff, 
      license_number,
      accreditation,
      departments,
      facilities,
      emergency_contact
    } = req.body;

    // Validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Hospital name must be at least 2 characters long' });
    }

    // Update hospital information
    const hospital = await Hospital.findOneAndUpdate(
      { admin_user_id: userId },
      {
        name: name.trim(),
        established_year: established_year ? parseInt(established_year) : null,
        bed_capacity: bed_capacity ? parseInt(bed_capacity) : 0,
        total_doctors: total_doctors ? parseInt(total_doctors) : 0,
        total_staff: total_staff ? parseInt(total_staff) : 0,
        license_number: license_number ? license_number.trim() : null,
        accreditation: Array.isArray(accreditation) ? accreditation : [],
        departments: Array.isArray(departments) ? departments : [],
        facilities: Array.isArray(facilities) ? facilities : [],
        emergency_contact: emergency_contact ? emergency_contact.trim() : null
      },
      { new: true, runValidators: true }
    );

    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    res.json({
      success: true,
      message: 'Hospital information updated successfully',
      data: hospital
    });

  } catch (error) {
    console.error('Error updating hospital info:', error);
    res.status(500).json({ 
      error: 'Unable to update hospital information',
      details: error.message 
    });
  }
});

// PUT - Update hospital location
router.put('/api/hospital/settings/location', isHospitalStaff, async (req, res) => {
  try {
    const userId = req.session.userId;
    const { address_line, city, state, pin_code, country } = req.body;

    // Validation
    if (!address_line || !city || !state || !pin_code) {
      return res.status(400).json({ error: 'Address line, city, state, and pin code are required' });
    }

    // Update hospital location
    const hospital = await Hospital.findOneAndUpdate(
      { admin_user_id: userId },
      {
        'location.address_line': address_line.trim(),
        'location.city': city.trim(),
        'location.state': state.trim(),
        'location.pin_code': pin_code.trim(),
        'location.country': country ? country.trim() : 'India'
      },
      { new: true, runValidators: true }
    );

    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    res.json({
      success: true,
      message: 'Hospital location updated successfully',
      data: hospital.location
    });

  } catch (error) {
    console.error('Error updating hospital location:', error);
    res.status(500).json({ 
      error: 'Unable to update hospital location',
      details: error.message 
    });
  }
});

// PUT - Update hospital contact information
router.put('/api/hospital/settings/contact', isHospitalStaff, async (req, res) => {
  try {
    const userId = req.session.userId;
    const { phone, email, website } = req.body;

    // Validation
    if (phone && !/^\+?[\d\s\-\(\)]+$/.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Update hospital contact
    const hospital = await Hospital.findOneAndUpdate(
      { admin_user_id: userId },
      {
        'contact.phone': phone ? phone.trim() : null,
        'contact.email': email ? email.trim().toLowerCase() : null,
        'contact.website': website ? website.trim() : null
      },
      { new: true, runValidators: true }
    );

    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    res.json({
      success: true,
      message: 'Hospital contact information updated successfully',
      data: hospital.contact
    });

  } catch (error) {
    console.error('Error updating hospital contact:', error);
    res.status(500).json({ 
      error: 'Unable to update hospital contact information',
      details: error.message 
    });
  }
});

// PUT - Update admin account settings (User schema)
router.put('/api/hospital/settings/admin', isHospitalStaff, async (req, res) => {
  try {
    const userId = req.session.userId;
    const { name, email, phone } = req.body;

    // Validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters long' });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    if (!phone || phone.trim().length < 10) {
      return res.status(400).json({ error: 'Valid phone number is required' });
    }

    // Check if email already exists (for other users)
    const existingUser = await User.findOne({ 
      email: email.trim().toLowerCase(),
      _id: { $ne: userId }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists for another user' });
    }

    // Check if phone already exists (for other users)
    const existingPhone = await User.findOne({ 
      phone: phone.trim(),
      _id: { $ne: userId }
    });

    if (existingPhone) {
      return res.status(400).json({ error: 'Phone number already exists for another user' });
    }

    // Update user information
    const user = await User.findByIdAndUpdate(
      userId,
      {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim()
      },
      { new: true, runValidators: true }
    ).select('-password_hash');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update session data
    req.session.name = user.name;

    res.json({
      success: true,
      message: 'Admin account updated successfully',
      data: user
    });

  } catch (error) {
    console.error('Error updating admin account:', error);
    res.status(500).json({ 
      error: 'Unable to update admin account',
      details: error.message 
    });
  }
});

// PUT - Change admin password
router.put('/api/hospital/settings/password', isHospitalStaff, async (req, res) => {
  try {
    const userId = req.session.userId;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All password fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New password and confirm password do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    // Get current user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await User.findByIdAndUpdate(userId, {
      password_hash: hashedNewPassword
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ 
      error: 'Unable to change password',
      details: error.message 
    });
  }
});

module.exports = router;
