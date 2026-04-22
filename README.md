# Agrolink
Web Based Agriculture Community Management System

## Development

### One-time setup

Install dependencies for both projects:

```bash
cd api
npm install

cd ..\client
npm install
```

### Run API + Client together (two terminals)

This repo includes a VS Code compound task that starts both the backend and frontend in two separate VS Code terminals.

1. In VS Code, open the repo root folder.
2. Run: **Terminal → Run Task… → Dev: All**
	- (Shortcut: **Ctrl+Shift+B** runs **Dev: All** as the default build task.)

Ports:
- Client: http://localhost:3000
- API: http://localhost:5000

Stop:
- **Terminal → Run Task… → Terminate Task…**

## Password Reset OTP Setup (Nodemailer)

The forgot-password flow sends a 6-digit OTP email and allows users to reset their password after verification.

Add these variables in `api/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail-address@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM=AgroLink <your-gmail-address@gmail.com>
```

Notes:
- Use a Gmail **App Password** (not your normal Gmail password).
- OTP expiry is 5 minutes.
- OTP resend cooldown is 60 seconds.
- Password reset is enabled for all account roles.

## Event Reminder Emails

Registered attendees are automatically sent one reminder email before event start.

Current behavior:
- Channel: email only
- Trigger: about 24 hours before event start
- Frequency: one reminder per event per attendee email

Optional scheduler tuning in `api/.env`:

```env
EVENT_REMINDER_LEAD_HOURS=24
EVENT_REMINDER_WINDOW_MINUTES=30
EVENT_REMINDER_SCHEDULER_INTERVAL_MINUTES=10
```

Manual trigger (admin only):
- `POST /api/admin/event-reminders/run` with body `{ "userId": "<ADMIN_ID>" }`
- Forced mode: `{ "userId": "<ADMIN_ID>", "force": true }`
