const express = require('express');
const router = express.Router();
const User = require('../schema/user');
const Doctor = require('../schema/doctor');
const Hospital = require('../schema/hospital');
const Laboratory = require('../schema/laboratory');

// 🔍 SEARCH DOCTORS
router.get('/api/search/doctors', async (req, res) => {
  try {
    const { specialization, name } = req.query;
    let query = { role: 'doctor' };
    if (name) query.name = { $regex: name, $options: 'i' };

    const users = await User.find(query).select('name email phone');
    const userIds = users.map(u => u._id);

    let docQuery = { user_id: { $in: userIds } };
    if (specialization) docQuery.specialization = { $regex: specialization, $options: 'i' };

    const doctors = await Doctor.find(docQuery).lean();
    
    const results = doctors.map(d => {
      const user = users.find(u => u._id == d.user_id);
      return {
        ...d,
        name: user ? user.name : 'Unknown',
        email: user ? user.email : 'N/A',
        phone: user ? user.phone : 'N/A'
      };
    });

    res.json({ success: true, results });
  } catch (error) {
    console.error('Error searching doctors:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 🔍 SEARCH HOSPITALS
router.get('/api/search/hospitals', async (req, res) => {
  try {
    const { city, name } = req.query;
    let query = {};
    if (city) query['location.city'] = { $regex: city, $options: 'i' };
    if (name) query.name = { $regex: name, $options: 'i' };

    const hospitals = await Hospital.find(query).lean();
    res.json({ success: true, results: hospitals });
  } catch (error) {
    console.error('Error searching hospitals:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 🔍 SEARCH LABORATORIES
router.get('/api/search/laboratories', async (req, res) => {
  try {
    const { city, name } = req.query;
    let query = {};
    if (city) query['location.city'] = { $regex: city, $options: 'i' };
    if (name) query.name = { $regex: name, $options: 'i' };

    const labs = await Laboratory.find(query).lean();
    res.json({ success: true, results: labs });
  } catch (error) {
    console.error('Error searching labs:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 📍 NEARBY SEARCH (Within 5km)
router.get('/api/search/nearby', async (req, res) => {
    try {
        const { lat, lng, type } = req.query; // type: 'doctor', 'hospital', 'laboratory'
        if (!lat || !lng) return res.status(400).json({ success: false, message: 'Location required' });

        const radius = 5000; // 5km in meters
        let results = [];

        if (type === 'hospital') {
            results = await Hospital.find({
                "location.geo": {
                    $near: {
                        $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                        $maxDistance: radius
                    }
                }
            }).lean();
        } else if (type === 'laboratory') {
            results = await Laboratory.find({
                "location.geo": {
                    $near: {
                        $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                        $maxDistance: radius
                    }
                }
            }).lean();
        } else if (type === 'doctor') {
            const users = await User.find({ role: 'doctor' }).select('name email phone');
            const userIds = users.map(u => u._id);
            const doctors = await Doctor.find({ user_id: { $in: userIds } }).lean();
            
            results = doctors.map(d => {
              const user = users.find(u => u._id == d.user_id);
              return {
                ...d,
                name: user ? user.name : 'Unknown',
                email: user ? user.email : 'N/A',
                phone: user ? user.phone : 'N/A'
              };
            });
        }

        res.json({ success: true, results });
    } catch (error) {
        console.error('Error in nearby search:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// 🔍 UNIFIED SEARCH (For Patient Dashboard)
router.get('/api/search', async (req, res) => {
  try {
    const { type, q } = req.query;
    if (!type) return res.status(400).json({ success: false, message: 'Type required' });

    let results = [];
    if (type === 'doctor') {
      // 1. Find doctors matching specialization or city directly
      const docProfiles = await Doctor.find({
        $or: [
          { specialization: { $regex: q || '', $options: 'i' } },
          { city: { $regex: q || '', $options: 'i' } }
        ]
      }).lean();

      // 2. Also find users matching name
      const matchingUsers = await User.find({
        role: 'doctor',
        name: { $regex: q || '', $options: 'i' }
      }).select('_id name email phone').lean();

      const userIdsFromProfiles = docProfiles.map(p => p.user_id.toString());
      const userIdsFromNames = matchingUsers.map(u => u._id.toString());
      const allUserIds = [...new Set([...userIdsFromProfiles, ...userIdsFromNames])];

      // 3. Resolve all user details and profiles
      const users = await User.find({ _id: { $in: allUserIds } }).select('name email phone').lean();
      const allProfiles = await Doctor.find({ user_id: { $in: allUserIds } }).lean();

      results = allProfiles.map(d => {
        const user = users.find(u => u._id.toString() === d.user_id.toString());
        return {
          ...d,
          name: user ? user.name : 'Unknown',
          email: user ? user.email : 'N/A',
          phone: user ? user.phone : 'N/A'
        };
      });
    } else if (type === 'hospital') {

      results = await Hospital.find({
        $or: [
          { name: { $regex: q || '', $options: 'i' } },
          { 'location.city': { $regex: q || '', $options: 'i' } }
        ]
      }).lean();
    } else if (type === 'laboratory') {
      results = await Laboratory.find({
        $or: [
          { name: { $regex: q || '', $options: 'i' } },
          { 'location.city': { $regex: q || '', $options: 'i' } }
        ]
      }).lean();
    }

    res.json({ success: true, results });
  } catch (error) {
    console.error('Unified search error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;


