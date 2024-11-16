const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
require('dotenv').config();
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MongoDB Atlas connection string
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI)
.then(() => {
    console.log('Connected to MongoDB Atlas');
})
.catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

// Define the Registration model
const Registration = mongoose.model('Registration', new mongoose.Schema({
    name: String,
    mobile: String,
    whatsapp: String,
    email: String,
    business_name: String,
    business_address: String,
    persons_attending: Number,
    food_required: String,
    veg_persons: Number,
    nonveg_persons: Number,
    status: { type: String, default: 'Pending' }
}));

// Form Submission Endpoint
app.post('/submit-form', async (req, res) => {
    try {
        const newRegistration = new Registration(req.body);
        const savedRegistration = await newRegistration.save();

        // Send email to admin
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,  // Get email from environment variables
                pass: process.env.EMAIL_PASS,  // Get password from environment variables
            },
        });

        const mailOptions = {
            from: 'sshr22084.it@rmkec.ac.in',  // Sender's email (your official email)
            to: 'sssankarshreya2205@gmail.com', // Admin email where the notification will be sent
            subject: 'New Event Registration',
            html: `
                <h3>New Registration</h3>
                <p>Name: ${req.body.name}</p>
                <p>Email: ${req.body.email}</p>
                <p>Click <a href="http://localhost:3000/admin/approve/${savedRegistration._id}">here</a> to Approve</p>
                <p>Click <a href="http://localhost:3000/admin/reject/${savedRegistration._id}">here</a> to Reject</p>
            `,
        };

        // Send the email to the admin
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).send('Error submitting registration and sending email.');
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        res.send('Registration submitted successfully and emailed to admin.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error submitting registration.');
    }
});

// Admin Approval Endpoint
app.get('/admin/approve/:id', async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id);
        if (registration) {
            registration.status = 'Approved';
            await registration.save();

            // Send approval email to registrant (optional)
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: registration.email,
                subject: 'Event Registration Approved',
                text: `Hello ${registration.name},\nYour registration has been approved. We look forward to seeing you at the event!`
            };

            transporter.sendMail(mailOptions);

            res.send('Registration approved');
        } else {
            res.status(404).send('Registration not found');
        }
    } catch (err) {
        console.error('Error approving registration:', err);
        res.status(500).send('Error approving registration');
    }
});

// Admin Rejection Endpoint
app.get('/admin/reject/:id', async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id);
        if (registration) {
            registration.status = 'Rejected';
            await registration.save();

            // Send rejection email to registrant (optional)
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: registration.email,
                subject: 'Event Registration Rejected',
                text: `Hello ${registration.name},\nWe regret to inform you that your registration has been rejected. Thank you for your understanding.`
            };

            transporter.sendMail(mailOptions);

            res.send('Registration rejected');
        } else {
            res.status(404).send('Registration not found');
        }
    } catch (err) {
        console.error('Error rejecting registration:', err);
        res.status(500).send('Error rejecting registration');
    }
});

// Admin Dashboard (Optional)
app.get('/admin/dashboard', async (req, res) => {
    try {
        const registrations = await Registration.find();
        res.json(registrations);  // Return all registrations in JSON format
    } catch (err) {
        console.error('Error fetching registrations:', err);
        res.status(500).send('Error fetching registrations');
    }
});

// Start the server
app.listen(3000, () => console.log('Server running on http://localhost:3000'));
