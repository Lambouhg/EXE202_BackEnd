const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import các routes
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const ticketRequestRoutes = require('./routes/ticketRequestRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const busCompanyRoutes = require('./routes/busCompanyRoutes');
const routeRouters = require('./routes/routeRoutes');
const exchangeRoutes = require('./routes/exchangeRoutes');
// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('Error connecting to MongoDB: ', err));
  
  

// Middleware
app.use(cors());
app.use(express.json());  // Middleware để parse JSON từ body request

// Sử dụng các routes
app.use('/api/auth', authRoutes);
app.use('/api/ticket', ticketRoutes);
app.use('/api/ticketRequest', ticketRequestRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/busCompany', busCompanyRoutes);
app.use('/api/route', routeRouters);
app.use('/api/exchange', exchangeRoutes);
// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
