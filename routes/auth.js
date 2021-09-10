const express = require('express');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const fetchuser = require('../middleware/fetchuser')

const router = express.Router();

const SECRET = "singhisking"

// ROUTE_1 - Register a user using : POST "/api/auth/register". No login required
router.post('/register', [
    body('name', "Your name should at lease 2 characters long.").isLength({ min: 2 }),
    body('password', "Your password should at lease 5 characters long.").isLength({ min: 5 }),
    body('email', "Entered email is not valid.").isEmail()
], async (req, res) => {
    let success = false;

    // Finds the validation errors in this request and wraps them in an error message and returns bad request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ success, errors: errors.array() });
    }

    try {
        // Check if the user already exists with the email
        let user = await User.findOne({ email: req.body.email })
        if (user) {
            return res.status(400).json({ success, error: "User with this E-Mail already exists!" })
        }

        // Securing the password by hashing
        let salt = await bcrypt.genSalt(10)
        let secPass = await bcrypt.hash(req.body.password, salt)

        // Create a new user 
        user = await User.create({
            name: req.body.name,
            password: secPass,
            email: req.body.email
        })

        // Generating auth token to return
        let payload = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(payload, SECRET)
        success = true
        res.json({success, authtoken})
    } catch (error) {
        console.error(error.message)
        success = false
        res.status(500).json({ success, error: "Internal Server Error" })
    }
})

// ROUTE_2 - Authenticate a user using : POST "/api/auth/login". No login required
router.post('/login', [
    body('email', "Entered email is not valid.").isEmail(),
    body('password', "Password cannob be blank").exists()
], async (req, res) => {
    success = false

    // Finds the validation errors in this request and wraps them in an error message and returns bad request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
    }

    try {
        const {email, password} = req.body;

        // Check if the user exists with the email
        let user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ success, error: "Your email or password is wrong!" })
        }

        // Compare the password with the stored password and authenticate
        let passwordMatched = await bcrypt.compare(password, user.password)
        if (!passwordMatched) {
            return res.status(400).json({ success, error: "Your email or password is wrong!" })
        }

        // Everything is good!!

        // Generating auth token to return
        let payload = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(payload, SECRET)
        success = true
        res.json({success, authtoken})

    } catch (error) {
        console.error(error.message)
        success = false
        res.status(500).json({success, error: "Internal Server Error" })
    }
})

// ROUTE_3 - Get a user using : GET "/api/auth/get". Login required
router.get('/getuser', fetchuser, async (req, res) => {
    success = false
    try {
        let userId = req.user.id;
        const user = await User.findById(userId).select('-password')
        res.json({success, user})
    } catch (error) {
        console.error(error.message)
        success = false
        res.status(500).json({success, error: "Internal Server Error" })
    }
})

module.exports = router