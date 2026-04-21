import "./Events.css";
import { useEffect, useMemo, useState, useContext } from "react";
import axios from "axios";
import { Context } from "../../context/Context";

const emptyForm = {
    title: "",
    date: "",
    location: "",
    description: "",
};

const emptyErrors = {
    title: "",
    date: "",
    location: "",
};

function getEventBadge(dateStr) {
    if (!dateStr) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const eventDate = new Date(dateStr);
    eventDate.setHours(0, 0, 0, 0);

    return eventDate >= today ? "Upcoming" : "Past";
}

function getTodayInputValue() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
        today.getDate()
    ).padStart(2, "0")}`;
}

export default function Events() {
    const { user } = useContext(Context);
    const isAdminOrExpert = user && (user.isAdmin || user.role === "expert");

    const [events, setEvents] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [formErrors, setFormErrors] = useState(emptyErrors);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [msg, setMsg] = useState("");
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");

    const [eventModalOpen, setEventModalOpen] = useState(false);

    const [registerOpen, setRegisterOpen] = useState(false);
    const [registeringEvent, setRegisteringEvent] = useState(null);
    const [registerForm, setRegisterForm] = useState({ name: "", phone: "", email: "" });
    const [registerLoading, setRegisterLoading] = useState(false);

    const isEditing = useMemo(() => Boolean(editingId), [editingId]);

    const fetchEvents = async () => {
        setLoading(true);
        setMsg("");
        try {
            const res = await axios.get("/events");
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
        const { name, value } = e.target;

        setForm((prev) => ({ ...prev, [name]: value }));

        if (formErrors[name]) {
            setFormErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const resetForm = () => {
        setForm(emptyForm);
        setFormErrors(emptyErrors);
        setEditingId(null);
    };

    const openCreateModal = () => {
        resetForm();
        setMsg("");
        setEventModalOpen(true);
    };

    const closeEventModal = () => {
        setEventModalOpen(false);
        resetForm();
        setFormSubmitting(false);
    };

    const startEdit = (ev) => {
        setEditingId(ev._id);

        const d = ev.date ? new Date(ev.date) : null;
        const yyyyMmDd = d
            ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
                d.getDate()
            ).padStart(2, "0")}`
            : "";

        setForm({
            title: ev.title || "",
            date: yyyyMmDd,
            location: ev.location || "",
            description: ev.description || "",
        });

        setFormErrors(emptyErrors);
        setMsg("");
        setEventModalOpen(true);
    };

    const validateForm = () => {
        const errors = { ...emptyErrors };
        const trimmedTitle = form.title.trim();
        const trimmedLocation = form.location.trim();
        const today = getTodayInputValue();

        if (!trimmedTitle) {
            errors.title = "Title is required";
        }

        if (!form.date) {
            errors.date = "Date is required";
        } else if (!isEditing && form.date < today) {
            errors.date = "Past dates are not allowed for new events";
        }

        if (!trimmedLocation) {
            errors.location = "Location is required";
        }

        setFormErrors(errors);

        return !errors.title && !errors.date && !errors.location;
    };

    const removeEvent = async (id) => {
        const ok = window.confirm("Are you sure you want to delete this event?");
        if (!ok) return;

        setMsg("");
        try {
            await axios.delete(`/events/${id}`, { data: { userId: user ? user._id : null } });
            setEvents((prev) => prev.filter((e) => e._id !== id));
            setMsg("Event deleted successfully ✅");
        } catch (err) {
            setMsg(err?.response?.data?.message || err.message || "Delete failed");
        }
    };

    const submit = async (e) => {
        e.preventDefault();
        setMsg("");

        if (!validateForm()) return;

        const payload = {
            title: form.title.trim(),
            date: form.date,
            location: form.location.trim(),
            description: form.description.trim(),
            userId: user ? user._id : null
        };

        setFormSubmitting(true);

        try {
            if (isEditing) {
                const res = await axios.put(`/events/${editingId}`, payload);
                setEvents((prev) => prev.map((ev) => (ev._id === editingId ? res.data : ev)));
                setMsg("Event updated successfully ✅");
            } else {
                const res = await axios.post("/events", payload);
                setEvents((prev) => [res.data, ...prev]);
                setMsg("Event created successfully ✅");
            }

            closeEventModal();
        } catch (err) {
            setMsg(err?.response?.data?.message || err.message || "Save failed");
            setFormSubmitting(false);
        }
    };

    const filteredEvents = events.filter((ev) => {
        const q = (search || "").toLowerCase();
        const title = (ev.title || "").toLowerCase();
        const location = (ev.location || "").toLowerCase();
        const desc = (ev.description || "").toLowerCase();
        const badge = getEventBadge(ev.date);

        const matchesSearch = title.includes(q) || location.includes(q) || desc.includes(q);
        const matchesFilter = filter === "All" ? true : badge === filter;

        return matchesSearch && matchesFilter;
    });

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
        setRegisterForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
            const res = await axios.post(`/events/${registeringEvent._id}/register`, {
                name,
                phone,
                email,
            });

            const updatedEvent = res?.data?.event;
            if (updatedEvent?._id) {
                setEvents((prev) => prev.map((ev) => (ev._id === updatedEvent._id ? updatedEvent : ev)));
            } else {
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
            <div className="events-header">
                <div className="events-header-left">
                    <span className="events-logo-icon">🌿</span>
                    <div>
                        <h1 className="events-title">AgroLink Events</h1>
                        <p className="events-subtitle">Manage and track agricultural events</p>
                    </div>
                </div>

                <div className="events-header-actions">
                    <button className="btn btn-outline" type="button" onClick={fetchEvents}>
                        🔄 Refresh
                    </button>
                    {isAdminOrExpert && (
                        <button className="btn btn-primary btn-add-event" type="button" onClick={openCreateModal}>
                            ➕ Add New Event
                        </button>
                    )}
                </div>
            </div>

            {msg && (
                <div className={`events-msg ${msg.includes("✅") ? "events-msg--success" : "events-msg--error"}`}>
                    {msg}
                </div>
            )}

            <div className="events-list-section events-list-section--full">
                <div className="events-list-header">
                    <div className="events-list-top-left">
                        <h2 className="events-list-title">
                            All Events
                            <span className="events-count">{filteredEvents.length}</span>
                        </h2>

                        <div className="events-filters">
                            {["All", "Upcoming", "Past"].map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    className={`filter-chip ${filter === item ? "filter-chip--active" : ""}`}
                                    onClick={() => setFilter(item)}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>

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
                        <p>{search || filter !== "All" ? "No events match your current filters." : "No events yet. Create one!"}</p>
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
                                        {badge === "Upcoming" && (
                                            <button className="btn btn-register" onClick={() => openRegister(ev)} type="button">
                                                📝 Register
                                            </button>
                                        )}

                                        {isAdminOrExpert && (
                                            <>
                                                <button className="btn btn-edit" onClick={() => startEdit(ev)} type="button">
                                                    ✏️ Edit
                                                </button>

                                                <button className="btn btn-delete" onClick={() => removeEvent(ev._id)} type="button">
                                                    🗑 Delete
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {eventModalOpen && (
                <div className="modal-overlay" onClick={closeEventModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header modal-header--green">
                            <h3 className="modal-title">{isEditing ? "Edit Event" : "Add New Event"}</h3>
                            <button className="modal-close" onClick={closeEventModal} type="button">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={submit} className="modal-form">
                            <div className="form-row-2">
                                <div className="form-group">
                                    <label className="form-label">Title *</label>
                                    <input
                                        className={`form-input ${formErrors.title ? "form-input--error" : ""}`}
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        placeholder="e.g., Farmers Meetup"
                                    />
                                    {formErrors.title && <span className="field-error">{formErrors.title}</span>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Date *</label>
                                    <input
                                        className={`form-input ${formErrors.date ? "form-input--error" : ""}`}
                                        type="date"
                                        name="date"
                                        value={form.date}
                                        min={isEditing ? undefined : getTodayInputValue()}
                                        onChange={handleChange}
                                    />
                                    {formErrors.date && <span className="field-error">{formErrors.date}</span>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Location *</label>
                                <input
                                    className={`form-input ${formErrors.location ? "form-input--error" : ""}`}
                                    name="location"
                                    value={form.location}
                                    onChange={handleChange}
                                    placeholder="e.g., Hadapanagala, Wellawaya"
                                />
                                {formErrors.location && <span className="field-error">{formErrors.location}</span>}
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

                            <div className="modal-actions">
                                <button className="btn btn-primary" type="submit" disabled={formSubmitting}>
                                    {formSubmitting
                                        ? isEditing
                                            ? "Updating..."
                                            : "Creating..."
                                        : isEditing
                                            ? "✔ Update Event"
                                            : "➕ Create Event"}
                                </button>

                                <button className="btn btn-ghost" type="button" onClick={closeEventModal} disabled={formSubmitting}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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