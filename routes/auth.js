const express = require('express');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Register a user using : POST "/api/auth/register". No login required
router.post('/register', [
    body('name', "Your name should at lease 2 characters long.").isLength({ min: 2 }),
    body('password', "Your password should at lease 5 characters long.").isLength({ min: 5 }),
    body('email', "Entered email is not valid.").isEmail()
], async (req, res) => {
    
    // Finds the validation errors in this request and wraps them in an error message and returns bad request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
    }

    try {
        // Check if the user already exists with the email
        let user = await User.findOne({ email: req.body.email })
        if (user) {
            return res.status(400).json({ error: "User with this E-Mail already exists!" })
        }

        // Create a new user 
        user = await User.create({
            name: req.body.name,
            password: req.body.password,
            email: req.body.email
        })

        res.json({ message: "User registered successfully" })
    } catch (err) {
        console.error(err.message)
        res.status(500).json({ error: "Some unknown error occured!" })
    }
})

module.exports = router