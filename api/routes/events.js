const router = require("express").Router();
const Event = require("../models/Event");
const User = require("../models/User");
const requireDb = require("../middleware/requireDb");

router.use(requireDb);

async function getActor(userId) {
    if (!userId) return null;
    return User.findById(userId).select("isAdmin role").lean();
}

function isAdmin(actor) {
    return Boolean(actor && (actor.isAdmin || actor.role === "admin"));
}

function isExpert(actor) {
    return Boolean(actor && actor.role === "expert");
}

function normalizeGeo(geo) {
    const lat = geo && geo.lat !== undefined && geo.lat !== null ? Number(geo.lat) : null;
    const lng = geo && geo.lng !== undefined && geo.lng !== null ? Number(geo.lng) : null;
    const hasGeo = Number.isFinite(lat) && Number.isFinite(lng);
    return hasGeo ? { lat, lng } : { lat: null, lng: null };
}

function isOwnedBy(actorId, event) {
    if (!actorId || !event || !event.createdBy) return false;
    return String(event.createdBy) === String(actorId);
}

// ✅ CREATE EVENT
router.post("/", async (req, res) => {
    try {
        const { title, date, location, description, userId, geo } = req.body;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: Missing user ID" });
        }
        const actor = await getActor(userId);
        if (!actor || (!isAdmin(actor) && !isExpert(actor))) {
            return res.status(403).json({ message: "Forbidden: Only admins and experts can create events" });
        }

        if (!title || !date) {
            return res.status(400).json({ message: "Title and date are required" });
        }

        const newEvent = new Event({
            title,
            date,
            location,
            geo: normalizeGeo(geo),
            description,
            createdBy: userId,
            createdByRole: isAdmin(actor) ? "admin" : "expert",
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
        const events = await Event.find().sort({ date: 1 }).lean();
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

        // Validate phone: only 10 digits
        if (!/^\d{10}$/.test(String(phone).trim())) {
            return res.status(400).json({ message: "Phone number must be exactly 10 digits" });
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
        const { userId, geo, ...updateData } = req.body;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: Missing user ID" });
        }
        const actor = await getActor(userId);
        if (!actor || (!isAdmin(actor) && !isExpert(actor))) {
            return res.status(403).json({ message: "Forbidden: Only admins and experts can update events" });
        }

        const existingEvent = await Event.findById(req.params.id).select("createdBy").lean();
        if (!existingEvent) return res.status(404).json({ message: "Event not found" });

        if (!isAdmin(actor)) {
            if (!existingEvent.createdBy) {
                return res.status(403).json({
                    message: "Forbidden: Legacy events can only be managed by admins",
                });
            }

            if (!isOwnedBy(userId, existingEvent)) {
                return res.status(403).json({
                    message: "Forbidden: Experts can only update their own events",
                });
            }
        }

        if (geo !== undefined) {
            updateData.geo = normalizeGeo(geo);
        }

        // Prevent ownership or attendee tampering from update payloads
        delete updateData.createdBy;
        delete updateData.createdByRole;
        delete updateData.attendees;

        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
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
        const userId = req.body.userId;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: Missing user ID" });
        }
        const actor = await getActor(userId);
        if (!actor || (!isAdmin(actor) && !isExpert(actor))) {
            return res.status(403).json({ message: "Forbidden: Only admins and experts can delete events" });
        }

        const existingEvent = await Event.findById(req.params.id).select("createdBy").lean();
        if (!existingEvent) return res.status(404).json({ message: "Event not found" });

        if (!isAdmin(actor)) {
            if (!existingEvent.createdBy) {
                return res.status(403).json({
                    message: "Forbidden: Legacy events can only be managed by admins",
                });
            }

            if (!isOwnedBy(userId, existingEvent)) {
                return res.status(403).json({
                    message: "Forbidden: Experts can only delete their own events",
                });
            }
        }

        const deleted = await Event.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Event deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message || "Server error" });
    }
});

module.exports = router;
