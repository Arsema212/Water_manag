require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/auth');
const providerRoutes = require('./routes/providers');
const orderRoutes = require('./routes/order');
const errorHandler = require('./middleware/errorHandler');


// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Your React frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json()); 

console.log("Loading orderRoutes...");

app.use('/api/auth', authRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/orders', orderRoutes);

// Routes

app.use(errorHandler);
// Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ message: 'Something broke!' });
// });

app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});


const PORT = process.env.PORT || 5001;



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} in use, trying ${Number(PORT)+1}...`);
    app.listen(Number(PORT)+1);
  }
});