const mongoose = require('mongoose');

mongoose.connect(process.env.CONN_STR);

const db = mongoose.connection;
db.on('connected', () => {
  console.log('Connected to MongoDB');
});

db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

module.exports = db;