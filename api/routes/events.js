const router = require("express").Router();
const Event = require("../models/Event");

// ✅ CREATE EVENT
router.post("/", async (req, res) => {
    try {
        const { title, date, location, description } = req.body;

        if (!title || !date) {
            return res.status(400).json({ message: "Title and date are required" });
        }

        const newEvent = new Event({
            title,
            date,
            location,
            description,
        });

        const savedEvent = await newEvent.save();
        res.status(201).json(savedEvent);
    } catch (err) {
        res.status(500).json({ message: err.message || "Server error" });
    }
});

// ✅ GET ALL EVENTS
router.get("/", async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 });
        res.status(200).json(events);
    } catch (err) {
        res.status(500).json({ message: err.message || "Server error" });
    }
});

// ✅ REGISTER FOR AN EVENT
// POST /api/events/:id/register
// body: { name, phone, email }
router.post("/:id/register", async (req, res) => {
    try {
        const { name, phone, email } = req.body;

        if (!name || !phone) {
            return res.status(400).json({ message: "Name and phone are required" });
        }

        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });

        // prevent duplicate registration (same phone OR email)
        const alreadyRegistered = (event.attendees || []).some((a) => {
            const samePhone = a.phone === phone;
            const sameEmail = email && a.email && a.email.toLowerCase() === email.toLowerCase();
            return samePhone || sameEmail;
        });

        if (alreadyRegistered) {
            return res.status(400).json({ message: "This user is already registered for the event" });
        }

        event.attendees.push({
            name: String(name).trim(),
            phone: String(phone).trim(),
            email: email ? String(email).trim() : "",
        });

        const saved = await event.save();

        res.status(200).json({
            message: "Registered successfully ✅",
            attendeesCount: saved.attendees.length,
            event: saved,
        });
    } catch (err) {
        res.status(500).json({ message: err.message || "Server error" });
    }
});

// ✅ UPDATE EVENT
router.put("/:id", async (req, res) => {
    try {
        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        if (!updatedEvent) return res.status(404).json({ message: "Event not found" });

        res.status(200).json(updatedEvent);
    } catch (err) {
        res.status(500).json({ message: err.message || "Server error" });
    }
});

// ✅ DELETE EVENT
router.delete("/:id", async (req, res) => {
    try {
        const deleted = await Event.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Event not found" });

        res.status(200).json({ message: "Event deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message || "Server error" });
    }
});

module.exports = router;
