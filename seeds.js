const mongoose = require('mongoose');

const User = require('./models/User.model');

// ℹ️ Connects to the database
mongoose
  .connect('mongodb://127.0.0.1:27017/Film-Club')
  .then(x => {
    console.log(`Connected to Mongo database: "${x.connections[0].name}"`);
  })
  .catch(err => {
    console.log(`An error occurred while connecting to the Database: ${err}`);
  });

