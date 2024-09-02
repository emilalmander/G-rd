// server.js
require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./db'); // Import the DB connection
const Message = require('./models/Message'); // Import Message model
const Subscription = require('./models/Subscription'); // Import Subscription model

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to the database
connectDB();

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Kontakt endpoint
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  // Save message to database
  try {
    const newMessage = new Message({ name, email, message });
    await newMessage.save();

    const mailOptions = {
      from: email,
      to: process.env.EMAIL_USER,
      subject: `Nytt meddelande från ${name}`,
      text: message,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).send(error.toString());
      }
      res.status(200).send('Meddelande skickat och sparat!');
    });
  } catch (error) {
    res.status(500).send('Ett fel inträffade när meddelandet skulle sparas.');
  }
});

// Prenumeration endpoint
app.post('/api/subscribe', async (req, res) => {
  const { email } = req.body;

  try {
    // Save subscription to database
    const newSubscription = new Subscription({ email });
    await newSubscription.save();
    res.status(200).send('Prenumeration mottagen!');
  } catch (error) {
    res.status(500).send('Ett fel inträffade när prenumerationen skulle sparas.');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
