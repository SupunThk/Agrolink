import "./Events.css";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const emptyForm = {
    title: "",
    date: "",
    location: "",
    description: "",
};

function getEventBadge(dateStr) {
    if (!dateStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(dateStr);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate >= today ? "Upcoming" : "Past";
}

export default function Events() {
    const [events, setEvents] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");
    const [search, setSearch] = useState("");

    // ✅ Registration state
    const [registerOpen, setRegisterOpen] = useState(false);
    const [registeringEvent, setRegisteringEvent] = useState(null);
    const [registerForm, setRegisterForm] = useState({ name: "", phone: "", email: "" });
    const [registerLoading, setRegisterLoading] = useState(false);

    const isEditing = useMemo(() => Boolean(editingId), [editingId]);

    const fetchEvents = async () => {
        setLoading(true);
        setMsg("");
        try {
            const res = await axios.get("/api/events");
            setEvents(res.data || []);
        } catch (err) {
            setMsg(err?.response?.data?.message || err.message || "Failed to load events");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleChange = (e) => {
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
    };

    const startEdit = (ev) => {
        setEditingId(ev._id);

        const d = ev.date ? new Date(ev.date) : null;
        const yyyyMmDd = d
            ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
            : "";

        setForm({
            title: ev.title || "",
            date: yyyyMmDd,
            location: ev.location || "",
            description: ev.description || "",
        });

        setMsg("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const removeEvent = async (id) => {
        const ok = window.confirm("Delete this event?");
        if (!ok) return;

        setMsg("");
        try {
            await axios.delete(`/api/events/${id}`);
            setEvents((prev) => prev.filter((e) => e._id !== id));
            setMsg("Event deleted ✅");
        } catch (err) {
            setMsg(err?.response?.data?.message || err.message || "Delete failed");
        }
    };

    const submit = async (e) => {
        e.preventDefault();
        setMsg("");

        if (!form.title.trim()) return setMsg("Title is required");
        if (!form.date) return setMsg("Date is required");
        if (!form.location.trim()) return setMsg("Location is required");

        const payload = {
            title: form.title.trim(),
            date: form.date,
            location: form.location.trim(),
            description: form.description.trim(),
        };

        try {
            if (isEditing) {
                const res = await axios.put(`/api/events/${editingId}`, payload);
                setEvents((prev) => prev.map((ev) => (ev._id === editingId ? res.data : ev)));
                setMsg("Event updated ✅");
            } else {
                const res = await axios.post("/api/events", payload);
                setEvents((prev) => [res.data, ...prev]);
                setMsg("Event created ✅");
            }
            resetForm();
        } catch (err) {
            setMsg(err?.response?.data?.message || err.message || "Save failed");
        }
    };

    // ✅ Small search fix: safe strings (no crash when description is missing)
    const filteredEvents = events.filter((ev) => {
        const q = (search || "").toLowerCase();
        const title = (ev.title || "").toLowerCase();
        const location = (ev.location || "").toLowerCase();
        const desc = (ev.description || "").toLowerCase();
        return title.includes(q) || location.includes(q) || desc.includes(q);
    });

    // ✅ Open register modal (only for upcoming events)
    const openRegister = (ev) => {
        setRegisteringEvent(ev);
        setRegisterForm({ name: "", phone: "", email: "" });
        setRegisterOpen(true);
        setMsg("");
    };

    const closeRegister = () => {
        setRegisterOpen(false);
        setRegisteringEvent(null);
        setRegisterForm({ name: "", phone: "", email: "" });
        setRegisterLoading(false);
    };

    const handleRegisterChange = (e) => {
        setRegisterForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    };

    const submitRegister = async (e) => {
        e.preventDefault();
        if (!registeringEvent?._id) return;

        const name = registerForm.name.trim();
        const phone = registerForm.phone.trim();
        const email = registerForm.email.trim();

        if (!name) return setMsg("Name is required to register");
        if (!phone) return setMsg("Phone is required to register");

        setRegisterLoading(true);
        setMsg("");

        try {
            const res = await axios.post(`/api/events/${registeringEvent._id}/register`, {
                name,
                phone,
                email,
            });

            // update local events list with updated event returned by API
            const updatedEvent = res?.data?.event;
            if (updatedEvent?._id) {
                setEvents((prev) => prev.map((ev) => (ev._id === updatedEvent._id ? updatedEvent : ev)));
            } else {
                // fallback: refetch if server didn't return event
                await fetchEvents();
            }

            setMsg(res?.data?.message || "Registered successfully ✅");
            closeRegister();
        } catch (err) {
            setMsg(err?.response?.data?.message || err.message || "Registration failed");
            setRegisterLoading(false);
        }
    };

    return (
        <div className="events-page">
            {/* Header */}
            <div className="events-header">
                <div className="events-header-left">
                    <span className="events-logo-icon">🌿</span>
                    <div>
                        <h1 className="events-title">AgroLink Events</h1>
                        <p className="events-subtitle">Manage and track agricultural events</p>
                    </div>
                </div>
                <button className="btn btn-outline" type="button" onClick={fetchEvents}>
                    🔄 Refresh
                </button>
            </div>

            {/* Status message */}
            {msg && (
                <div className={`events-msg ${msg.includes("✅") ? "events-msg--success" : "events-msg--error"}`}>
                    {msg}
                </div>
            )}

            <div className="events-layout">
                {/* LEFT: Form Card */}
                <div className="events-form-card">
                    <div className="form-card-header">
                        <span className="form-card-icon">{isEditing ? "✏️" : "➕"}</span>
                        <h2 className="form-card-title">{isEditing ? "Edit Event" : "Add New Event"}</h2>
                    </div>

                    <form onSubmit={submit} className="events-form">
                        <div className="form-row-2">
                            <div className="form-group">
                                <label className="form-label">Title *</label>
                                <input
                                    className="form-input"
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    placeholder="e.g., Farmers Meetup"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Date *</label>
                                <input
                                    className="form-input"
                                    type="date"
                                    name="date"
                                    value={form.date}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Location *</label>
                            <input
                                className="form-input"
                                name="location"
                                value={form.location}
                                onChange={handleChange}
                                placeholder="e.g., Hadapanagala, Wellawaya"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Description <span className="form-label-optional">(optional)</span>
                            </label>
                            <textarea
                                className="form-input form-textarea"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Details about the event..."
                                rows={4}
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">
                                {isEditing ? "✔ Update Event" : "➕ Create Event"}
                            </button>
                            {isEditing && (
                                <button type="button" onClick={resetForm} className="btn btn-ghost">
                                    ✕ Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* RIGHT: Events List */}
                <div className="events-list-section">
                    <div className="events-list-header">
                        <h2 className="events-list-title">
                            All Events
                            <span className="events-count">{filteredEvents.length}</span>
                        </h2>
                        <input
                            className="events-search"
                            type="text"
                            placeholder="🔍 Search events..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {loading ? (
                        <div className="events-loading">
                            <div className="spinner" />
                            <p>Loading events…</p>
                        </div>
                    ) : filteredEvents.length === 0 ? (
                        <div className="events-empty">
                            <span className="events-empty-icon">📭</span>
                            <p>{search ? "No events match your search." : "No events yet. Create one!"}</p>
                        </div>
                    ) : (
                        <div className="events-grid">
                            {filteredEvents.map((ev) => {
                                const badge = getEventBadge(ev.date);
                                const attendeesCount = ev.attendees?.length || 0;

                                return (
                                    <div key={ev._id} className="event-card">
                                        <div className="event-card-top">
                                            <div className="event-card-info">
                                                <div className="event-card-title-row">
                                                    <h3 className="event-card-name">{ev.title}</h3>
                                                    {badge && (
                                                        <span className={`event-badge event-badge--${badge.toLowerCase()}`}>
                                                            {badge}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="event-card-meta">
                                                    <span className="event-meta-item">
                                                        📅{" "}
                                                        {ev.date
                                                            ? new Date(ev.date).toLocaleDateString("en-US", {
                                                                year: "numeric",
                                                                month: "short",
                                                                day: "numeric",
                                                            })
                                                            : ""}
                                                    </span>
                                                    <span className="event-meta-sep">•</span>
                                                    <span className="event-meta-item">📍 {ev.location}</span>
                                                    {attendeesCount > 0 && (
                                                        <>
                                                            <span className="event-meta-sep">•</span>
                                                            <span className="event-meta-item">👥 {attendeesCount} Registered</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {ev.description && <p className="event-card-description">{ev.description}</p>}

                                        <div className="event-card-actions">
                                            {/* ✅ Register only if Upcoming */}
                                            {badge === "Upcoming" && (
                                                <button className="btn btn-register" onClick={() => openRegister(ev)}>
                                                    📝 Register
                                                </button>
                                            )}

                                            <button className="btn btn-edit" onClick={() => startEdit(ev)}>
                                                ✏️ Edit
                                            </button>
                                            <button className="btn btn-delete" onClick={() => removeEvent(ev._id)}>
                                                🗑 Delete
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ✅ Register Modal */}
            {registerOpen && registeringEvent && (
                <div className="modal-overlay" onClick={closeRegister}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Register for: {registeringEvent.title}</h3>
                            <button className="modal-close" onClick={closeRegister} type="button">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={submitRegister} className="modal-form">
                            <div className="form-group">
                                <label className="form-label">Name *</label>
                                <input
                                    className="form-input"
                                    name="name"
                                    value={registerForm.name}
                                    onChange={handleRegisterChange}
                                    placeholder="Your name"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Phone *</label>
                                <input
                                    className="form-input"
                                    name="phone"
                                    value={registerForm.phone}
                                    onChange={handleRegisterChange}
                                    placeholder="07XXXXXXXX"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Email <span className="form-label-optional">(optional)</span>
                                </label>
                                <input
                                    className="form-input"
                                    name="email"
                                    value={registerForm.email}
                                    onChange={handleRegisterChange}
                                    placeholder="example@gmail.com"
                                />
                            </div>

                            <div className="modal-actions">
                                <button className="btn btn-primary" type="submit" disabled={registerLoading}>
                                    {registerLoading ? "Registering..." : "✅ Confirm Registration"}
                                </button>
                                <button className="btn btn-ghost" type="button" onClick={closeRegister} disabled={registerLoading}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}