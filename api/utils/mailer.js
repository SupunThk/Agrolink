const nodemailer = require("nodemailer");

const SMTP_PORT = Number(process.env.SMTP_PORT || 587);

const createTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("SMTP is not configured");
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendOtpEmail = async ({ toEmail, otpCode, otpExpiryMinutes = 5 }) => {
  const transporter = createTransporter();
  const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;

  const subject = "AgroLink Password Reset OTP";
  const text = [
    "You requested a password reset for your AgroLink account.",
    "",
    `Your OTP code is: ${otpCode}`,
    `This OTP will expire in ${otpExpiryMinutes} minutes.`,
    "",
    "If you did not request this reset, you can ignore this email.",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #14532d;">AgroLink Password Reset</h2>
      <p>You requested a password reset for your AgroLink account.</p>
      <p style="font-size: 16px;">Use the OTP below to continue:</p>
      <div style="font-size: 30px; font-weight: 700; letter-spacing: 6px; color: #065f46; margin: 18px 0;">
        ${otpCode}
      </div>
      <p>This OTP will expire in <strong>${otpExpiryMinutes} minutes</strong>.</p>
      <p style="color: #475569;">If you did not request this reset, you can safely ignore this email.</p>
    </div>
  `;

  await transporter.sendMail({
    from: fromAddress,
    to: toEmail,
    subject,
    text,
    html,
  });
};

const formatEventDate = (value) => {
  const eventDate = new Date(value);
  if (Number.isNaN(eventDate.getTime())) return "Soon";

  return eventDate.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const sendEventReminderEmail = async ({ toEmail, attendeeName, eventTitle, eventDate, eventLocation }) => {
  const transporter = createTransporter();
  const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;

  const safeName = attendeeName || "Farmer";
  const formattedDate = formatEventDate(eventDate);
  const locationText = eventLocation ? `Location: ${eventLocation}` : "Location: Online / TBA";

  const subject = `Reminder: ${eventTitle} starts in 24 hours`;
  const text = [
    `Hi ${safeName},`,
    "",
    `This is a reminder that your registered event \"${eventTitle}\" is starting in about 24 hours.`,
    `Date & Time: ${formattedDate}`,
    locationText,
    "",
    "Thank you for using AgroLink.",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; line-height: 1.5;">
      <h2 style="color: #14532d; margin-bottom: 8px;">AgroLink Event Reminder</h2>
      <p>Hi ${safeName},</p>
      <p>Your registered event is starting in about <strong>24 hours</strong>.</p>
      <div style="padding: 12px 14px; border: 1px solid #d1fae5; border-radius: 10px; background: #f0fdf4;">
        <p style="margin: 0 0 6px;"><strong>${eventTitle}</strong></p>
        <p style="margin: 0 0 6px;">Date & Time: ${formattedDate}</p>
        <p style="margin: 0;">${locationText}</p>
      </div>
      <p style="margin-top: 14px; color: #334155;">See you there!</p>
    </div>
  `;

  await transporter.sendMail({
    from: fromAddress,
    to: toEmail,
    subject,
    text,
    html,
  });
};

const sendExpertApprovedEmail = async ({ toEmail, expertName }) => {
  const transporter = createTransporter();
  const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;

  const safeName = expertName || "Expert";
  const subject = "Your AgroLink Expert Account Has Been Approved";
  const text = [
    `Hi ${safeName},`,
    "",
    "Great news! Your AgroLink expert account has been approved.",
    "You can now log in and start answering farmer questions on the platform.",
    "",
    "Thank you for joining AgroLink.",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; line-height: 1.5;">
      <h2 style="color: #14532d; margin-bottom: 8px;">AgroLink Expert Approval</h2>
      <p>Hi ${safeName},</p>
      <p>Great news! Your <strong>AgroLink expert account</strong> has been approved.</p>
      <p>You can now sign in and start helping farmers by answering questions on the platform.</p>
      <p style="margin-top: 14px; color: #334155;">Thank you for being part of AgroLink.</p>
    </div>
  `;

  await transporter.sendMail({
    from: fromAddress,
    to: toEmail,
    subject,
    text,
    html,
  });
};

const sendExpertRejectedEmail = async ({ toEmail, expertName, rejectionReason }) => {
  const transporter = createTransporter();
  const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;

  const safeName = expertName || "Expert";
  const safeReason = rejectionReason || "Farm image verification failed. Please reapply.";
  const subject = "Update on Your AgroLink Expert Verification";
  const text = [
    `Hi ${safeName},`,
    "",
    "Your AgroLink expert verification request was not approved this time.",
    `Reason: ${safeReason}`,
    "",
    "Please update your verification details and apply again.",
    "",
    "Thank you for your interest in supporting AgroLink farmers.",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; line-height: 1.5;">
      <h2 style="color: #991b1b; margin-bottom: 8px;">AgroLink Expert Verification Update</h2>
      <p>Hi ${safeName},</p>
      <p>Your expert verification request was <strong>not approved</strong> this time.</p>
      <div style="padding: 12px 14px; border: 1px solid #fecaca; border-radius: 10px; background: #fef2f2;">
        <p style="margin: 0;"><strong>Reason:</strong> ${safeReason}</p>
      </div>
      <p style="margin-top: 14px;">Please update your verification details and apply again.</p>
      <p style="color: #334155;">Thank you for your interest in supporting AgroLink farmers.</p>
    </div>
  `;

  await transporter.sendMail({
    from: fromAddress,
    to: toEmail,
    subject,
    text,
    html,
  });
};

module.exports = {
  sendOtpEmail,
  sendEventReminderEmail,
  sendExpertApprovedEmail,
  sendExpertRejectedEmail,
};
