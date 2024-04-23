const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const authRouter = require('./route/authRouter');

const app = express();
const PORT = 8080;

app.use(bodyParser.json());
app.use(cors());
app.use('/api/auth', authRouter);


mongoose.connect('mongodb://localhost:27017/laundry', {

})
.then(() => {
  console.log('MongoDB connected');
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});


app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
