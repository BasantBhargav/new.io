const mongoose = require('mongoose');

const Appointment = require('./schema/appointment');
const Doctor = require('./schema/doctor');
const Patient = require('./schema/patient');
const User = require('./schema/user');

async function check() {
  await mongoose.connect('mongodb+srv://basantbhargav335:basant@cluster0.thdcvhb.mongodb.net/medivault?retryWrites=true&w=majority');
  
  const docs = await Doctor.find().populate('user_id');
  const appts = await Appointment.find({}, 'doctor_id patient_id status token_number notes').lean();
  const result = {
    doctors: docs.map(d => ({_id: d._id, user: d.user_id ? d.user_id.name : null})),
    appointments: appts.map(a => ({
       id: a._id,
       doc: a.doctor_id,
       pat: a.patient_id,
       status: a.status,
       notes: a.notes,
       token: a.token_number
    }))
  };
  require('fs').writeFileSync('test_output.json', JSON.stringify(result, null, 2));
  process.exit();
}

check();
