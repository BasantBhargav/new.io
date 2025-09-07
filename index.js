// const express = require('express');
// const path = require('path');
// const mongoose = require('mongoose');
// const session = require('express-session');
// const multer = require('multer');
// const fs = require('fs');


// // admin 
// const adminRoutes = require('./routes/admin');
// app.use('/api/admin', adminRoutes);


// // Schemas and Routes
// const authRoutes = require('./routes/auth');
// const uploadRoutes = require('./routes/upload');
// const User = require('./schema/user');
// const Report = require('./schema/report');

// const app = express();
// const port = 3000;

// // 🧠 Middleware
// app.use(session({
//   secret: 'yourSecretKey',
//   resave: false,
//   saveUninitialized: false,
//   cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
// }));

// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

// // 🧾 Serve frontend files (HTML, CSS, JS)
// app.use(express.static(path.join(__dirname, 'front')));

// // 📁 Serve uploaded report files
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // ✅ Connect to MongoDB
// mongoose.connect('mongodb://localhost:27017/medivault', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// }).then(() => console.log("✅ MongoDB Connected"))
//   .catch(err => console.error("❌ MongoDB Error:", err));

// // ✅ Route: Authentication
// app.use('/', authRoutes);

// // ✅ Middleware: Protected routes
// const requireAuth = (req, res, next) => {
//   if (!req.session.userId) return res.redirect('/login');
//   next();
// };




// // ✅ Dashboard Pages
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'front/home.html'));
// });

// app.get('/dashboard', requireAuth, (req, res) => {
//   res.sendFile(path.join(__dirname, 'front/dashboard.html'));
// });

// app.get('/doctordashboard', requireAuth, (req, res) => {
//   if (req.session.role !== 'doctor') return res.redirect('/');
//   res.sendFile(path.join(__dirname, 'front/doctordashboard.html'));
// });

// app.get('/patientdashboard', requireAuth, (req, res) => {
//   if (req.session.role !== 'patient') return res.redirect('/');
//   res.sendFile(path.join(__dirname, 'front/patientdashboard.html'));
// });

// app.get('/hospitaldashboard', requireAuth, (req, res) => {
//   if (req.session.role !== 'hospital_staff') return res.redirect('/');
//   res.sendFile(path.join(__dirname, 'front/hospitaldashboard.html'));
// });

// app.get('/admindashboard', requireAuth, (req, res) => {
//   if (req.session.role !== 'admin') return res.redirect('/');
//   res.sendFile(path.join(__dirname, 'front/admindashboard.html'));
// });

// app.get('/logout', (req, res) => {
//   req.session.destroy(() => res.redirect('/'));
// });

// // ✅ Use existing upload routes
// app.use('/', uploadRoutes);

// // ✅ STEP 3: New API route to serve patient dashboard data
// app.get('/api/patient-dashboard', requireAuth, async (req, res) => {
//   try {
//     const userId = req.session.userId;
//     const user = await User.findById(userId).lean();
//     const reports = await Report.find({ patientId: userId }).sort({ uploadedAt: -1 }).lean();

//     if (!user || user.role !== 'patient') {
//       return res.status(403).json({ message: 'Unauthorized' });
//     }

//     res.json({ user, reports });
//   } catch (error) {
//     console.error('❌ Error fetching patient dashboard data:', error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// });

// //✅ Start Server
// app.listen(port, () => {
//   console.log(`✅ Server running at http://localhost:${port}`);
// });

// // // ✅ Start Server
// // app.listen(port, '0.0.0.0', () => {
// //   console.log(`✅ Server running on http://0.0.0.0:${port}`);
// // });



/////// 222222222////////
// const express = require('express');
// const path = require('path');
// const mongoose = require('mongoose');
// const session = require('express-session');
// const multer = require('multer');
// const fs = require('fs');

// const app = express();
// const port = 3000;

// // ✅ Import Routes and Schemas
// const adminRoutes = require('./routes/admin');       // Admin routes (CRUD)
// const authRoutes = require('./routes/auth');         // Login, Signup, etc.
// const uploadRoutes = require('./routes/upload');     // Report upload routes
// const User = require('./schema/user');               // User schema
// const Report = require('./schema/report');           // Report schema

// // ✅ Middleware
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

// // ✅ Configure session
// app.use(session({
//   secret: 'yourSecretKey', // Change this in production
//   resave: false,
//   saveUninitialized: false,
//   cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 1 day
// }));

// // ✅ Serve frontend files from /front folder
// app.use(express.static(path.join(__dirname, 'front')));

// // ✅ Serve uploaded report files
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // ✅ Connect to MongoDB
// mongoose.connect('mongodb://localhost:27017/medivault', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// }).then(() => console.log("✅ MongoDB Connected"))
//   .catch(err => console.error("❌ MongoDB Connection Error:", err));

// // ✅ Authentication Routes
// app.use('/', authRoutes);

// // ✅ Admin Routes (APIs)
// app.use('/api/admin', adminRoutes);

// // ✅ Upload Routes (Hospitals uploading reports)
// app.use('/', uploadRoutes);

// // ✅ Role-Based Middleware
// const requireAuth = (req, res, next) => {
//   if (!req.session.userId) {
//     return res.redirect('/login.html'); // Redirect to login if not authenticated
//   }
//   next();
// };

// // ✅ General Pages
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'front/home.html'));
// });

// // ✅ Dashboards (Role Based)
// app.get('/dashboard', requireAuth, (req, res) => {
//   res.sendFile(path.join(__dirname, 'front/dashboard.html'));
// });

// app.get('/doctordashboard', requireAuth, (req, res) => {
//   if (req.session.role !== 'doctor') return res.redirect('/');
//   res.sendFile(path.join(__dirname, 'front/doctordashboard.html'));
// });

// app.get('/patientdashboard', requireAuth, (req, res) => {
//   if (req.session.role !== 'patient') return res.redirect('/');
//   res.sendFile(path.join(__dirname, 'front/patientdashboard.html'));
// });

// app.get('/hospitaldashboard', requireAuth, (req, res) => {
//   if (req.session.role !== 'hospital_staff') return res.redirect('/');
//   res.sendFile(path.join(__dirname, 'front/hospitaldashboard.html'));
// });

// app.get('/admindashboard', requireAuth, (req, res) => {
//   if (req.session.role !== 'admin') return res.redirect('/');
//   res.sendFile(path.join(__dirname, 'front/admindashboard.html'));
// });

// // ✅ Logout
// app.get('/logout', (req, res) => {
//   req.session.destroy(() => res.redirect('/'));
// });

// // ✅ Patient Dashboard API (Fetch personal details + reports)
// app.get('/api/patient-dashboard', requireAuth, async (req, res) => {
//   try {
//     const userId = req.session.userId;
//     const user = await User.findById(userId).lean();
//     const reports = await Report.find({ patientId: userId }).sort({ uploadedAt: -1 }).lean();

//     if (!user || user.role !== 'patient') {
//       return res.status(403).json({ message: 'Unauthorized' });
//     }

//     res.json({ user, reports });
//   } catch (error) {
//     console.error('❌ Error fetching patient dashboard data:', error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// });

// // ✅ Start Server
// app.listen(port, () => {
//   console.log(`✅ Server running at http://localhost:${port}`);
// });





////////// 33333333333/////////////////
// const express = require('express');
// const path = require('path');
// const mongoose = require('mongoose');
// const session = require('express-session');
// const multer = require('multer');
// const fs = require('fs');

// const app = express();
// const port = 3000;

// // ✅ Import Routes and Schemas
// const adminRoutes = require('./routes/admin');       // Admin routes (CRUD)
// const authRoutes = require('./routes/auth');         // Login, Signup, etc.
// const uploadRoutes = require('./routes/upload');     // Report upload routes
// const User = require('./schema/user');               // User schema
// const Report = require('./schema/report');           // Report schema

// // ✅ Middleware
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

// // ✅ Configure session
// app.use(session({
//   secret: 'yourSecretKey',
//   resave: false,
//   saveUninitialized: false,
//   cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 1 day
// }));

// // ✅ Serve frontend files from /front folder
// app.use(express.static(path.join(__dirname, 'front')));

// // ✅ Serve uploaded report files
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// // // ✅ old Connection karne ka  to MongoDB
// // mongoose.connect('mongodb://localhost:27017/medivault', {
// //   useNewUrlParser: true,
// //   useUnifiedTopology: true
// // })
// // .then(() => console.log("✅ MongoDB Connected"))
// // .catch(err => console.error("❌ MongoDB Connection Error:", err));



// // ✅ new Connection ke liye to MongoDB atlas
// mongoose.connect('mongodb+srv://basantbhargav335:basant@cluster0.thdcvhb.mongodb.net/medivault?retryWrites=true&w=majority', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
// .then(() => console.log("✅ Connected to MongoDB Atlas"))
// .catch(err => console.error("❌ MongoDB Atlas Connection Error:", err));





//   // ✅ Authentication Routes
// app.use('/', authRoutes);

// // ✅ Middleware: Require Login
// const requireAuth = (req, res, next) => {
//   if (!req.session.userId) {
//     console.log("⚠️ Not logged in, redirecting...");
//     return res.redirect('/login');
//   }
//   next();
// };

// // ✅ Middleware: Require Admin
// const requireAdmin = (req, res, next) => {
//   if (!req.session.userId || req.session.role !== 'admin') {
//     console.log("⛔ Admin access only. Redirecting to login...");
//     return res.redirect('/login');
//   }
//   next();
// };

// // ✅ Admin Routes (protected)
// app.use('/api/admin', requireAdmin, adminRoutes);

// // ✅ Upload Routes
// app.use('/', uploadRoutes);

// // ✅ Pages
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'front/home.html'));
// });

// // ✅ Dashboards (Role Based)
// app.get('/dashboard', requireAuth, (req, res) => {
//   res.sendFile(path.join(__dirname, 'front/dashboard.html'));
// });

// app.get('/doctordashboard', requireAuth, (req, res) => {
//   if (req.session.role !== 'doctor') return res.redirect('/login');
//   res.sendFile(path.join(__dirname, 'front/doctordashboard.html'));
// });

// app.get('/patientdashboard', requireAuth, (req, res) => {
//   if (req.session.role !== 'patient') return res.redirect('/login');
//   res.sendFile(path.join(__dirname, 'front/patientdashboard.html'));
// });

// app.get('/hospitaldashboard', requireAuth, (req, res) => {
//   if (req.session.role !== 'hospital_staff') return res.redirect('/login');
//   res.sendFile(path.join(__dirname, 'front/hospitaldashboard.html'));
// });

// // ✅ Protect Admin Dashboard
// app.get('/admindashboard', requireAdmin, (req, res) => {
//   res.sendFile(path.join(__dirname, 'front/admindashboard.html'));
// });

// // ✅ Logout
// app.get('/logout', (req, res) => {
//   req.session.destroy(() => res.redirect('/login'));
// });

// // ✅ Patient Dashboard API
// app.get('/api/patient-dashboard', requireAuth, async (req, res) => {
//   try {
//     const userId = req.session.userId;
//     const user = await User.findById(userId).lean();
//     const reports = await Report.find({ patientId: userId }).sort({ uploadedAt: -1 }).lean();

//     if (!user || user.role !== 'patient') {
//       return res.status(403).json({ message: 'Unauthorized' });
//     }

//     res.json({ user, reports });
//   } catch (error) {
//     console.error('❌ Error fetching patient dashboard data:', error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// });


// const hospitalRoutes = require('./routes/hospital');
// app.use(hospitalRoutes);




// // ✅ Start Server
// app.listen(port, () => {
//   console.log(`✅ Server running at http://localhost:${port}`);
// });



///////// 44444444444444 ////////////////


const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const multer = require('multer');
const fs = require('fs');

const app = express();
const port = 3000;

//  Import Routes and Schemas
const adminRoutes = require('./routes/admin');        // Admin routes (CRUD)
const authRoutes = require('./routes/auth');          // Login, Signup, etc.
const uploadRoutes = require('./routes/upload');      // Report upload routes
const reportsRoutes = require('./routes/reports');    // 🆕 Reports fetch routes
const hospitalRoutes = require('./routes/hospital');  // Hospital routes
const User = require('./schema/user');                // User schema
const Report = require('./schema/report');            // Report schema

//  Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ Configure session
app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));

//  Serve frontend files from /front folder
app.use(express.static(path.join(__dirname, 'front')));

//  Serve uploaded report files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//  MongoDB Atlas Connection
mongoose.connect('mongodb+srv://basantbhargav335:basant@cluster0.thdcvhb.mongodb.net/medivault?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch(err => console.error("❌ MongoDB Atlas Connection Error:", err));


//  Authentication Routes
app.use('/', authRoutes);

//  Upload Routes
app.use('/', uploadRoutes);

//  Reports API Routes
app.use('/', reportsRoutes);

//  Hospital Routes
app.use('/', hospitalRoutes);

//  Middleware: Require Login
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    console.log("⚠️ Not logged in, redirecting...");
    return res.redirect('/login');
  }
  next();
};

//  Middleware: Require Admin
const requireAdmin = (req, res, next) => {
  if (!req.session.userId || req.session.role !== 'admin') {
    console.log("⛔ Admin access only. Redirecting to login...");
    return res.redirect('/login');
  }
  next();
};

//  Admin Routes (protected)
app.use('/api/admin', requireAdmin, adminRoutes);

//  Pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'front/home.html'));
});

//  Dashboards (Role Based)
app.get('/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'front/dashboard.html'));
});

app.get('/doctordashboard', requireAuth, (req, res) => {
  if (req.session.role !== 'doctor') return res.redirect('/login');
  res.sendFile(path.join(__dirname, 'front/doctordashboard.html'));
});

app.get('/patientdashboard', requireAuth, (req, res) => {
  if (req.session.role !== 'patient') return res.redirect('/login');
  res.sendFile(path.join(__dirname, 'front/patientdashboard.html'));
});

app.get('/hospitaldashboard', requireAuth, (req, res) => {
  if (req.session.role !== 'hospital_staff') return res.redirect('/login');
  res.sendFile(path.join(__dirname, 'front/hospitaldashboard.html'));
});

//  Protect Admin Dashboard
app.get('/admindashboard', requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'front/admindashboard.html'));
});

//  Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

//  Patient Dashboard API
app.get('/api/patient-dashboard', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findById(userId).lean();
    const reports = await Report.find({ patientId: userId }).sort({ uploadedAt: -1 }).lean();

    if (!user || user.role !== 'patient') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json({ user, reports });
  } catch (error) {
    console.error('❌ Error fetching patient dashboard data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// PRESCRIPTIONS KE LIYE ROUTES
const patientRoutes = require('./routes/patient');
const prescriptionRoutes = require('./routes/prescriptions');

// Use routes (existing app.use statements के बाद add करें)
app.use('/', patientRoutes);
app.use('/api/prescriptions', prescriptionRoutes);


//notification ke liye
const notificationsRoutes = require('./routes/notifications');
app.use('/notifications', notificationsRoutes);

//hospital setting ke liye 
const hospitalSettingsRoutes = require('./routes/hospitalSettings');
app.use('/', hospitalSettingsRoutes);
app.get('/hospital-settings', (req, res) => {
  if (!req.session.userId || req.session.role !== 'hospital_staff') {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'front', 'hospital-settings.html'));
});




//  Start Server
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
