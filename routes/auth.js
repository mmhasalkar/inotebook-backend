const express = require('express');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

const router = express.Router();

router.post('/', [
    body('name', "Your name should at lease 2 characters long.").isLength({ min: 2 }),
    body('password', "Your password should at lease 5 characters long.").isLength({ min: 5 }),
    body('email', "Entered email is not valid.").isEmail()
], (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    console.log(req.body)
    User.create({
        name: req.body.name,
        password: req.body.password,
        email: req.body.email
    }).then(user => res.json(user)).catch(err => {
        console.log("error while creating user:", err)
        res.status(400).json({ message: err.message })
    });
})

module.exports = router