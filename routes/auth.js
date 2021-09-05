const express = require('express');
const User = require('../models/User');
const router = express.Router();

router.post('/', (req, res) => {
    const user = User(req.body)
    console.log(req.body)
    user.save()
    res.json(req.body)
})

module.exports = router