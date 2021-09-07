const express = require('express')
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Note = require('../models/Note');
const { body, validationResult } = require('express-validator');

// ROUTE_1 - Fetch all notes of the user : GET "/api/notes/". Login required
router.get('/', fetchuser, async (req, res) => {
    try {
        // Fetch the notes of the user from database
        const notes = await Note.find({ user: req.user.id })
        res.json(notes)
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

// ROUTE_2 - Add a new note : POST "/api/notes/new". Login required
router.post('/new', fetchuser, [
    body('title', "Enter a valid title!").isLength({ min: 5 }),
    body('description', "Description should be at least 5 characters long.").isLength({ min: 5 })
], async (req, res) => {

    try {
        // Finds the validation errors in this request and wraps them in an error message and returns bad request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
        }

        // Taking out the note data from the request body
        const { title, description, tag } = req.body;

        // Creating and saving a new note
        const note = new Note({ title, description, tag, user: req.user.id });
        const savedNote = await note.save();

        // Send back the saved note
        res.json(savedNote);
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

// ROUTE_3 - Add a new note : PUT "/api/notes/update/:id". Login required
router.put('/update/:id', fetchuser, async (req, res) => {
    // Get the note data from the request body
    const { title, description, tag } = req.body;

    // Create the object for the updates to be made in the note
    const updates = {}
    if (title) { updates.title = title }
    if (description) { updates.description = description }
    if (tag) { updates.tag = tag }

    // Get the note from the database
    let note = await Note.findById(req.params.id)
    if (!note) { return res.status(404).send("Not Found") }

    // Return error if user doesn't owns the note
    if (note.user.toString() !== req.user.id) { return res.status(401).send("Not Allowed") }

    // Find the note by id and update it
    note = await Note.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true })

    res.json({ note })
})

module.exports = router