const Event = require("../models/Event");
const { sendEventReminderEmail } = require("../utils/mailer");

const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const REMINDER_LEAD_HOURS = Number(process.env.EVENT_REMINDER_LEAD_HOURS || 24);
const REMINDER_WINDOW_MINUTES = Number(process.env.EVENT_REMINDER_WINDOW_MINUTES || 30);
const SCHEDULER_INTERVAL_MINUTES = Number(process.env.EVENT_REMINDER_SCHEDULER_INTERVAL_MINUTES || 10);

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const isValidEmail = (email) => EMAIL_REGEX.test(normalizeEmail(email));

const getTargetWindow = (baseDate) => {
  const now = new Date(baseDate);
  const leadMs = REMINDER_LEAD_HOURS * 60 * 60 * 1000;
  const windowMs = REMINDER_WINDOW_MINUTES * 60 * 1000;
  const target = now.getTime() + leadMs;

  return {
    start: new Date(target - windowMs),
    end: new Date(target + windowMs),
  };
};

const getRecipientList = (attendees = []) => {
  const uniqueByEmail = new Map();

  for (const attendee of attendees) {
    const email = normalizeEmail(attendee?.email);
    if (!email || !isValidEmail(email) || uniqueByEmail.has(email)) continue;
    uniqueByEmail.set(email, attendee);
  }

  return Array.from(uniqueByEmail.entries()).map(([email, attendee]) => ({
    email,
    name: attendee?.name || "",
  }));
};

const processEventReminders = async ({ force = false, now = new Date() } = {}) => {
  const nowDate = new Date(now);
  const query = {
    reminderSentAt: null,
    date: { $gt: nowDate },
  };

  if (!force) {
    const window = getTargetWindow(nowDate);
    query.date.$gte = window.start;
    query.date.$lte = window.end;
  }

  const events = await Event.find(query).lean();

  const summary = {
    checkedAt: nowDate.toISOString(),
    mode: force ? "forced" : "scheduled",
    eventsMatched: events.length,
    eventsProcessed: 0,
    emailsSent: 0,
    skippedEvents: 0,
    failedEvents: 0,
    eventResults: [],
  };

  for (const event of events) {
    const recipients = getRecipientList(event.attendees || []);

    if (recipients.length === 0) {
      await Event.findByIdAndUpdate(event._id, {
        $set: {
          reminderSentAt: nowDate,
          reminderProcessedAt: nowDate,
          reminderStatus: "skipped",
          reminderLastError: "No valid attendee emails",
        },
      });

      summary.skippedEvents += 1;
      summary.eventsProcessed += 1;
      summary.eventResults.push({
        eventId: String(event._id),
        title: event.title,
        status: "skipped",
        recipients: 0,
      });
      continue;
    }

    let sentCount = 0;
    const deliveryErrors = [];

    for (const recipient of recipients) {
      try {
        await sendEventReminderEmail({
          toEmail: recipient.email,
          attendeeName: recipient.name,
          eventTitle: event.title,
          eventDate: event.date,
          eventLocation: event.location,
        });
        sentCount += 1;
      } catch (err) {
        deliveryErrors.push(`${recipient.email}: ${err.message}`);
      }
    }

    const hasFailure = deliveryErrors.length > 0 && sentCount === 0;
    const status = hasFailure ? "failed" : "sent";

    await Event.findByIdAndUpdate(event._id, {
      $set: {
        reminderSentAt: nowDate,
        reminderProcessedAt: nowDate,
        reminderStatus: status,
        reminderLastError: deliveryErrors.join(" | "),
      },
    });

    if (hasFailure) {
      summary.failedEvents += 1;
    }

    summary.eventsProcessed += 1;
    summary.emailsSent += sentCount;
    summary.eventResults.push({
      eventId: String(event._id),
      title: event.title,
      status,
      recipients: recipients.length,
      emailsSent: sentCount,
      failures: deliveryErrors.length,
    });
  }

  return summary;
};

const startEventReminderScheduler = () => {
  const intervalMs = Math.max(1, SCHEDULER_INTERVAL_MINUTES) * 60 * 1000;

  const tick = async () => {
    try {
      const result = await processEventReminders();
      if (result.eventsMatched > 0 || result.emailsSent > 0) {
        console.log("[EventReminder]", JSON.stringify(result));
      }
    } catch (err) {
      console.error("[EventReminder] Scheduler error:", err.message);
    }
  };

  // First run shortly after startup.
  setTimeout(tick, 5000);
  const intervalId = setInterval(tick, intervalMs);

  console.log(
    `[EventReminder] Scheduler started (interval=${SCHEDULER_INTERVAL_MINUTES}m, lead=${REMINDER_LEAD_HOURS}h, window=${REMINDER_WINDOW_MINUTES}m)`,
  );

  return () => clearInterval(intervalId);
};

module.exports = {
  processEventReminders,
  startEventReminderScheduler,
};
