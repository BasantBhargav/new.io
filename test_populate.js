const mongoose = require('mongoose');

const Appointment = require('./schema/appointment');
const Doctor = require('./schema/doctor');
const Patient = require('./schema/patient');
const User = require('./schema/user');

async function check() {
  await mongoose.connect('mongodb+srv://basantbhargav335:basant@cluster0.thdcvhb.mongodb.net/medivault?retryWrites=true&w=majority');
  
  // Find all Scheduled appointments for any doctor
  const appointments = await Appointment.find({ status: 'Scheduled' })
      .populate({
        path: 'doctor_id',
        populate: { path: 'user_id', select: 'name _id' }
      })
      .populate({
        path: 'patient_id',
        populate: { path: 'user_id', select: 'name email phone _id' }
      })
      .sort({ scheduled_time: 1 })
      .lean();
      
  console.log(JSON.stringify(appointments, null, 2));
  process.exit();
}

check();
