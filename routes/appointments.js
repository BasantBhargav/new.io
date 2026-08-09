const express = require('express');
const router = express.Router();
const Appointment = require('../schema/appointment');
const Doctor = require('../schema/doctor');
const Patient = require('../schema/patient');
const User = require('../schema/user');
const Notification = require('../schema/notification');
const Counter = require('../schema/counter');
const { v4: uuidv4 } = require('uuid');

// ✅ Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (!req.session.userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
  next();
};

const startOfDay = (value = new Date()) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};
const endOfDay = (value = new Date()) => {
  const date = startOfDay(value);
  date.setDate(date.getDate() + 1);
  return date;
};
const queueKey = (doctorId, date, session = 'default') =>
  `queue:${doctorId}:${startOfDay(date).toISOString().slice(0, 10)}:${session}`;

async function getQueueSnapshot(doctorId, date = new Date(), session = 'default') {
  const appointments = await Appointment.find({
    doctor_id: doctorId,
    scheduled_time: { $gte: startOfDay(date), $lt: endOfDay(date) },
    queue_session: session
  }).sort({ token_number: 1 }).lean();
  const current = appointments.find(item => item.status === 'IN_PROGRESS');
  const waiting = appointments.filter(item => item.status === 'WAITING');
  return {
    doctorId: String(doctorId),
    queueDate: startOfDay(date).toISOString(),
    session,
    currentToken: current ? current.token_number : 0,
    currentAppointmentId: current ? String(current._id) : null,
    waitingCount: waiting.length,
    waitingTokens: waiting.map(item => item.token_number),
    lastToken: appointments.reduce((max, item) => Math.max(max, item.token_number || 0), 0)
  };
}

async function emitQueueUpdate(req, doctorId, date, session) {
  const snapshot = await getQueueSnapshot(doctorId, date, session);
  const io = req.app.get('socketio');
  if (io) io.to(`doctor_${doctorId}`).emit('queueUpdated', snapshot);
  return snapshot;
}

// 🏥 GET ALL APPOINTMENTS (Role based)
router.get('/api/appointments', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const role = req.session.role;

    let query = {};
    if (role === 'patient') {
      const patient = await Patient.findOne({ user_id: userId });
      if (!patient) return res.json({ success: true, appointments: [] });
      query = { patient_id: patient._id };
    } else if (role === 'doctor') {
      const doctor = await Doctor.findOne({ user_id: userId });
      if (!doctor) return res.json({ success: true, appointments: [] });
      query = { doctor_id: doctor._id };
    } else if (role === 'hospital_staff') {
      // Logic for hospital staff to see all appointments for their doctors
      // For now, return empty or implement hospital filter
      return res.json({ success: true, appointments: [] });
    }

    const appointments = await Appointment.find(query)
      .populate({
        path: 'doctor_id',
        populate: { path: 'user_id', select: 'name _id' }
      })
      .populate({
        path: 'patient_id',
        populate: { path: 'user_id', select: 'name email phone _id' }
      })
      .sort({ scheduled_time: 1 });

    res.json({ success: true, appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 📊 DOCTOR STATS
router.get('/api/doctor/stats', requireAuth, async (req, res) => {
  try {
    if (req.session.role !== 'doctor') return res.status(403).json({ success: false, message: 'Unauthorized' });
    
    const userId = req.session.userId;
    const doctor = await Doctor.findOne({ user_id: userId });
    
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    // The displayed token must come from today's real queue, never the old
    // doctor-level counter (which mixed different dates and cancelled entries).
    const queue = await getQueueSnapshot(doctor._id);

    const totalPatients = await Appointment.countDocuments({ doctor_id: doctor._id });
    const pendingAppointments = await Appointment.countDocuments({ doctor_id: doctor._id, status: { $in: ['BOOKED', 'CHECKED_IN', 'WAITING', 'IN_PROGRESS', 'Scheduled'] } });
    const completedAppointments = await Appointment.countDocuments({ doctor_id: doctor._id, status: { $in: ['COMPLETED', 'Completed'] } });

    res.json({ 
      success: true, 
      totalPatients,
      pendingAppointments,
      completedAppointments,
      currentToken: queue.currentToken,
      queue,
      doctorId: doctor._id
    });
  } catch (error) {
    console.error('Error fetching doctor stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 📅 DOCTOR SET AVAILABILITY

router.post('/api/doctor/set-slots', requireAuth, async (req, res) => {
  try {
    if (req.session.role !== 'doctor') return res.status(403).json({ success: false, message: 'Only doctors can set availability' });
    
    const { slots } = req.body; // Array of { day, startTime, endTime }
    const userId = req.session.userId;

    const doctor = await Doctor.findOneAndUpdate(
      { user_id: userId },
      { $set: { availableSlots: slots } },
      { new: true }
    );

    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    res.json({ success: true, message: 'Availability updated', doctor });
  } catch (error) {
    console.error('Error setting slots:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 🕒 GET DOCTOR AVAILABILITY
router.get('/api/doctor/availability', requireAuth, async (req, res) => {
  try {
    if (req.session.role !== 'doctor') return res.status(403).json({ success: false, message: 'Unauthorized' });
    
    const userId = req.session.userId;
    const doctor = await Doctor.findOne({ user_id: userId });
    
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    
    res.json({ 
      success: true, 
      slots: doctor.availableSlots || [] 
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 🔍 GET DOCTOR QUEUE INFO (For Patients)
router.get('/api/doctor/:id/queue-info', requireAuth, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    const queue = await getQueueSnapshot(doctor._id, req.query.date || new Date(), req.query.session || 'default');

    res.json({
      success: true,
      ...queue,
      avgTime: doctor.avg_time_per_patient || 15
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 🔍 BOOK APPOINTMENT

router.post('/api/book-appointment', requireAuth, async (req, res) => {

  try {
    if (req.session.role !== 'patient') return res.status(403).json({ success: false, message: 'Only patients can book appointments' });

    const { doctorId, scheduledTime, notes } = req.body;
    const patientUserId = req.session.userId;
    console.log(`Booking request - Doctor: ${doctorId}, Patient User: ${patientUserId}`);

    const patient = await Patient.findOne({ user_id: patientUserId });
    if (!patient) return res.status(404).json({ success: false, message: 'Patient profile not found' });

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      console.log(`❌ Doctor record not found for ID: ${doctorId}`);
      return res.status(404).json({ success: false, message: 'Doctor profile not found. Please ensure you selected a valid doctor.' });
    }

    // 🔢 ATOMIC TOKEN GENERATION FOR DOCTOR TODAY
    const targetDate = new Date(scheduledTime);
    targetDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let tokenNumber = 1;

    // Only use the atomic counter if the appointment is for today
    if (targetDate.getTime() === today.getTime()) {
      let updatedDoctor = await Doctor.findOneAndUpdate(
        { _id: doctorId, last_token_date: today },
        { $inc: { last_token_number: 1 } },
        { new: true }
      );

      if (!updatedDoctor) {
        updatedDoctor = await Doctor.findOneAndUpdate(
          { _id: doctorId, last_token_date: { $ne: today } },
          { $set: { last_token_number: 1, last_token_date: today } },
          { new: true }
        );

        if (!updatedDoctor) {
          updatedDoctor = await Doctor.findOneAndUpdate(
            { _id: doctorId },
            { $inc: { last_token_number: 1 } },
            { new: true }
          );
        }
      }
      tokenNumber = updatedDoctor.last_token_number;
    } else {
      // For future dates, just count appointments (not atomic across days, but okay for pre-booking)
      const nextDate = new Date(targetDate);
      nextDate.setDate(targetDate.getDate() + 1);
      const lastAppointment = await Appointment.findOne({
        doctor_id: doctorId,
        scheduled_time: { $gte: targetDate, $lt: nextDate }
      }).sort({ token_number: -1 });
      tokenNumber = lastAppointment ? (lastAppointment.token_number + 1) : 1;
    }

    const newAppointment = new Appointment({
      appointment_id: uuidv4(),
      doctor_id: doctorId,
      patient_id: patient._id,
      token_number: tokenNumber, // 🔢 Set token
      scheduled_time: new Date(scheduledTime),
      notes: notes || '',
      status: 'Scheduled',
      paymentStatus: 'Paid',
      amountPaid: 500
    });

    // Compatibility note: older code computes a provisional number above.  A
    // real token is deliberately issued only on check-in.
    newAppointment.token_number = null;
    newAppointment.status = 'BOOKED';
    await newAppointment.save();

    // 🌍 Emit live queue update via socket
    const io = req.app.get('socketio');
    if (io && doctor) {
      io.to(`doctor_${doctorId}`).emit('queueUpdated', {
        doctorId: doctorId,
        currentToken: doctor.current_token || 0,
        lastToken: tokenNumber
      });
    }

    res.json({ success: true, message: 'Appointment booked successfully', appointment: newAppointment });

  } catch (error) {
    console.error('❌ Error booking appointment:', error.message);
    if (error.stack) console.error(error.stack);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ✅ UPDATE APPOINTMENT STATUS
router.patch('/api/appointments/:id/status', requireAuth, async (req, res) => {
  try {
    const { status, reason } = req.body; // 'Completed', 'Cancelled', plus optional reason
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate({ path: 'doctor_id', populate: { path: 'user_id' } })
      .populate({ path: 'patient_id' });
    
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    // 🆕 Send Notification to Patient
    const patientUserId = appointment.patient_id.user_id;
    const doctorName = appointment.doctor_id.user_id.name;

    let notificationTitle = '';
    let notificationMessage = '';

    if (status === 'Cancelled') {
      notificationTitle = 'Appointment Cancelled';
      notificationMessage = `Dr. ${doctorName} has cancelled your appointment (Reason: ${reason || 'Not specified'}). Your refund for the payment will be processed soon.`;
      
      // Update payment status to Refunded
      appointment.paymentStatus = 'Refunded';
      await appointment.save();
    } else if (status === 'Completed') {
      notificationTitle = 'Appointment Completed';
      notificationMessage = `Your appointment with Dr. ${doctorName} has been marked as completed. We hope you have a speedy recovery!`;
    }


    if (notificationTitle) {
        const notif = new Notification({
            role: 'patient',
            targetUserId: patientUserId,
            title: notificationTitle,
            message: notificationMessage,
            priority: status === 'Cancelled' ? 'high' : 'normal'
        });
        await notif.save();
    }

    
    res.json({ success: true, message: 'Status updated', appointment });

    // 🌍 Emit update
    const io = req.app.get('socketio');
    const doctor = await Doctor.findById(appointment.doctor_id);
    if (io && doctor) {
      io.to(`doctor_${doctor._id}`).emit('queueUpdated', {
        doctorId: doctor._id,
        currentToken: doctor.current_token || 0
      });
    }
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 🔔 CALL NEXT PATIENT
// Check-in is when a booking becomes part of the live doctor/date/session queue.
router.patch('/api/appointments/:id/check-in', requireAuth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    const patient = await Patient.findOne({ user_id: req.session.userId });
    const doctor = await Doctor.findOne({ user_id: req.session.userId });
    const allowed = (req.session.role === 'patient' && patient && String(patient._id) === String(appointment.patient_id)) ||
      (req.session.role === 'doctor' && doctor && String(doctor._id) === String(appointment.doctor_id));
    if (!allowed) return res.status(403).json({ success: false, message: 'Unauthorized' });
    if (!['BOOKED', 'CHECKED_IN', 'WAITING', 'Scheduled'].includes(appointment.status)) {
      return res.status(400).json({ success: false, message: 'This appointment cannot be checked in' });
    }
    if (!appointment.token_number) {
      const counter = await Counter.findOneAndUpdate(
        { name: queueKey(appointment.doctor_id, appointment.scheduled_time, appointment.queue_session) },
        { $inc: { seq: 1 } }, { new: true, upsert: true }
      );
      appointment.token_number = counter.seq;
    }
    appointment.status = 'WAITING';
    await appointment.save();
    const queue = await emitQueueUpdate(req, appointment.doctor_id, appointment.scheduled_time, appointment.queue_session);
    res.json({ success: true, message: 'Checked in to the queue', appointment, queue });
  } catch (error) {
    console.error('Queue check-in failed:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Doctor-only controls for the active queue: finish a consultation or skip an absent patient.
router.patch('/api/doctor/queue/:id/:action', requireAuth, async (req, res) => {
  try {
    if (req.session.role !== 'doctor') return res.status(403).json({ success: false, message: 'Unauthorized' });
    const doctor = await Doctor.findOne({ user_id: req.session.userId });
    const appointment = await Appointment.findOne({ _id: req.params.id, doctor_id: doctor?._id });
    if (!appointment) return res.status(404).json({ success: false, message: 'Queue entry not found' });
    const actionStates = { complete: 'COMPLETED', skip: 'SKIPPED' };
    const status = actionStates[req.params.action];
    if (!status) return res.status(400).json({ success: false, message: 'Invalid queue action' });
    if (req.params.action === 'complete' && appointment.status !== 'IN_PROGRESS') {
      return res.status(400).json({ success: false, message: 'Only the patient in consultation can be completed' });
    }
    if (req.params.action === 'skip' && !['WAITING', 'IN_PROGRESS'].includes(appointment.status)) {
      return res.status(400).json({ success: false, message: 'Only waiting or active patients can be skipped' });
    }
    appointment.status = status;
    await appointment.save();
    const queue = await emitQueueUpdate(req, doctor._id, appointment.scheduled_time, appointment.queue_session);
    res.json({ success: true, appointment, queue });
  } catch (error) {
    console.error('Queue action failed:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Calls the lowest real WAITING token. The doctor completes or skips the active patient first.
router.patch('/api/doctor/call-next', requireAuth, async (req, res) => {
  try {
    if (req.session.role !== 'doctor') return res.status(403).json({ success: false, message: 'Unauthorized' });
    const doctor = await Doctor.findOne({ user_id: req.session.userId }).populate('user_id');
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    const date = req.body?.date || new Date();
    const session = req.body?.session || 'default';
    const scheduled_time = { $gte: startOfDay(date), $lt: endOfDay(date) };
    const active = await Appointment.findOne({ doctor_id: doctor._id, scheduled_time, queue_session: session, status: 'IN_PROGRESS' });
    if (active) return res.status(400).json({ success: false, message: 'Complete or skip the current patient before calling the next one.' });
    const next = await Appointment.findOneAndUpdate(
      { doctor_id: doctor._id, scheduled_time, queue_session: session, status: 'WAITING' },
      { $set: { status: 'IN_PROGRESS' } }, { new: true, sort: { token_number: 1 } }
    ).populate({ path: 'patient_id', populate: { path: 'user_id' } });
    const queue = await emitQueueUpdate(req, doctor._id, date, session);
    if (!next) return res.json({ success: true, message: 'No waiting patients', currentToken: 0, queue });
    const io = req.app.get('socketio');
    const patientUserId = next.patient_id?.user_id?._id;
    if (io && patientUserId) io.to(`user_${patientUserId}`).emit('turnAlert', {
      doctorName: doctor.user_id.name, tokenNumber: next.token_number,
      message: `It is your turn. Please proceed to Dr. ${doctor.user_id.name}'s room.`
    });
    if (patientUserId) await Notification.create({ role: 'patient', targetUserId: patientUserId, title: "It's your turn!", message: `Dr. ${doctor.user_id.name} is calling token ${next.token_number}.`, priority: 'urgent' });
    res.json({ success: true, message: 'Next patient called', currentToken: next.token_number, appointment: next, queue });
  } catch (error) {
    console.error('Call next failed:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.patch('/api/doctor/call-next-legacy', requireAuth, async (req, res) => {
  try {
    if (req.session.role !== 'doctor') return res.status(403).json({ success: false, message: 'Unauthorized' });
    
    const userId = req.session.userId;
    let doctor = await Doctor.findOne({ user_id: userId });

    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    const today = new Date();
    today.setHours(0,0,0,0);
    
    let isNewDay = true;
    if (doctor.last_token_date) {
        const lastDate = new Date(doctor.last_token_date);
        lastDate.setHours(0,0,0,0);
        if (lastDate.getTime() === today.getTime()) {
            isNewDay = false;
        }
    }

    if (isNewDay) {
        doctor.current_token = 1;
        doctor.last_token_date = today;
    } else {
        doctor.current_token = (doctor.current_token || 0) + 1;
    }
    await doctor.save();
    doctor = await Doctor.findById(doctor._id).populate('user_id');

    const io = req.app.get('socketio');
    const nextToken = doctor.current_token;

    // 🌍 Emit Live Update
    if (io) {
      io.to(`doctor_${doctor._id}`).emit('queueUpdated', {
        doctorId: doctor._id,
        currentToken: nextToken
      });

      // 🛑 NOTIFICATIONS LOGIC for Patients
      // Find the patient with this token and notify
      const currentPatientApp = await Appointment.findOne({ doctor_id: doctor._id, token_number: nextToken, status: 'Scheduled' })
         .populate({ path: 'patient_id', populate: { path: 'user_id' } });
      
      if (currentPatientApp) {
         // Emit direct turn notification via socket
         io.to(`user_${currentPatientApp.patient_id.user_id._id}`).emit('turnAlert', {
            doctorName: doctor.user_id.name,
            tokenNumber: nextToken,
            message: `Proceed to Dr. ${doctor.user_id.name}'s room.`
         });

         // Also save persistent notification
         const turnNotif = new Notification({
            role: 'patient',
            targetUserId: currentPatientApp.patient_id.user_id._id,
            title: "It's your turn!",
            message: `Dr. ${doctor.user_id.name} is calling token number ${nextToken}. Please proceed to the cabin.`,
            priority: 'urgent'
         });
         await turnNotif.save();
      }

      // 🟡 "You are next" for tokens diff = 1
      const nextPatApp = await Appointment.findOne({ doctor_id: doctor._id, token_number: nextToken + 1, status: 'Scheduled' })
          .populate({ path: 'patient_id', populate: { path: 'user_id' } });
      if (nextPatApp) {
          const nextNotif = new Notification({
            role: 'patient',
            targetUserId: nextPatApp.patient_id.user_id._id,
            title: "You are next!",
            message: "Get ready, you are the next patient in line.",
            priority: 'high'
          });
          await nextNotif.save();
      }

       // 🟠 "Be ready" for tokens diff = 2
       const readyPatApp = await Appointment.findOne({ doctor_id: doctor._id, token_number: nextToken + 2, status: 'Scheduled' })
       .populate({ path: 'patient_id', populate: { path: 'user_id' } });
       if (readyPatApp) {
           const readyNotif = new Notification({
             role: 'patient',
             targetUserId: readyPatApp.patient_id.user_id._id,
             title: "Be ready!",
             message: "There are only 2 patients ahead of you.",
             priority: 'normal'
           });
           await readyNotif.save();
       }
    }

    res.json({ success: true, message: 'Next patient called', currentToken: nextToken });
  } catch (error) {
    console.error('Error calling next:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


module.exports = router;
