const mongoose = require('mongoose');
const Doctor = require('./schema/doctor');
const Appointment = require('./schema/appointment');

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/express_harry', { useNewUrlParser: true, useUnifiedTopology: true });
  
  const today = new Date();
  today.setHours(0,0,0,0);
  
  console.log("Today is:", today);
  
  const doc = await Doctor.findOne();
  if (!doc) {
      console.log("No doc");
      process.exit(0);
  }
  console.log("Found doc:", doc._id);
  console.log("Doc last_token_date:", doc.last_token_date);
  console.log("Match JS side?:", doc.last_token_date && doc.last_token_date.getTime() === today.getTime());

  // Test pipeline
  const updatedDoctor = await Doctor.findOneAndUpdate(
    { _id: doc._id },
    [
      {
        $set: {
          last_token_number: {
            $cond: {
              if: { $eq: [{ $ifNull: ["$last_token_date", new Date(0)] }, today] },
              then: { $add: [{ $ifNull: ["$last_token_number", 0] }, 1] },
              else: 1
            }
          },
          last_token_date: today
        }
      }
    ],
    { new: true }
  );

  console.log("Updated Doc:", {
    last_token_number: updatedDoctor.last_token_number,
    last_token_date: updatedDoctor.last_token_date
  });

  process.exit(0);
}
run();
