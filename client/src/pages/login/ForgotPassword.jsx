import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./forgotPassword.css";
import { validateEmail, validateOtp, validatePassword } from "../../utils/validation";

const RESEND_COOLDOWN_SECONDS = 60;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });
  const [resetToken, setResetToken] = useState("");
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendSecondsLeft, setResendSecondsLeft] = useState(0);

  useEffect(() => {
    if (resendSecondsLeft <= 0) return;

    const timer = setInterval(() => {
      setResendSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendSecondsLeft]);

  const normalizedEmail = useMemo(() => form.email.trim().toLowerCase(), [form.email]);

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      delete next.general;
      return next;
    });
  };

  const parseApiErrors = (error) => {
    const apiErrors = error?.response?.data?.errors;
    if (apiErrors && typeof apiErrors === "object") {
      return apiErrors;
    }
    return { general: "Something went wrong. Please try again." };
  };

  const handleRequestOtp = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const currentErrors = {};
    if (!normalizedEmail) {
      currentErrors.email = "Email is required";
    } else if (!validateEmail(normalizedEmail)) {
      currentErrors.email = "Please enter a valid email address";
    }

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setStatusMessage("");

    try {
      const res = await axios.post("/auth/forgot-password", { email: normalizedEmail });
      setStatusMessage(res.data?.message || "OTP sent. Check your email inbox.");
      setStep(2);
      setResendSecondsLeft(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      setErrors(parseApiErrors(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const trimmedOtp = form.otp.trim();
    const currentErrors = {};

    if (!trimmedOtp) {
      currentErrors.otp = "OTP is required";
    } else if (!validateOtp(trimmedOtp)) {
      currentErrors.otp = "OTP must be exactly 6 digits";
    }

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setStatusMessage("");

    try {
      const res = await axios.post("/auth/verify-reset-otp", {
        email: normalizedEmail,
        otp: trimmedOtp,
      });
      setResetToken(res.data?.resetToken || "");
      setStatusMessage("OTP verified. You can now set a new password.");
      setStep(3);
    } catch (error) {
      setErrors(parseApiErrors(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const currentErrors = {};
    const passwordValidation = validatePassword(form.password);

    if (!passwordValidation.isValid) {
      currentErrors.password = passwordValidation.errors;
    }

    if (!form.confirmPassword) {
      currentErrors.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      currentErrors.confirmPassword = "Passwords do not match";
    }

    if (!resetToken) {
      currentErrors.general = "Reset session expired. Please verify OTP again.";
    }

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setStatusMessage("");

    try {
      const res = await axios.post("/auth/reset-password", {
        email: normalizedEmail,
        resetToken,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });

      setStatusMessage(res.data?.message || "Password reset successful.");
      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      setErrors(parseApiErrors(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendSecondsLeft > 0 || isSubmitting) return;

    setIsSubmitting(true);
    setErrors({});
    setStatusMessage("");

    try {
      const res = await axios.post("/auth/forgot-password", { email: normalizedEmail });
      setStatusMessage(res.data?.message || "A new OTP has been sent.");
      setResendSecondsLeft(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      setErrors(parseApiErrors(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPasswordErrors = () => {
    if (!errors.password) return null;

    if (Array.isArray(errors.password)) {
      return (
        <ul className="forgotPasswordListError">
          {errors.password.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    }

    return (
      <span className="loginFieldError">
        <i className="fas fa-exclamation-circle"></i>
        {errors.password}
      </span>
    );
  };

  return (
    <div className="login forgotPasswordPage fadeIn">
      <div className="loginCard forgotPasswordCard">
        <div className="loginBranding">
          <i className="fas fa-key"></i>
          <h2>Reset <span>Password</span></h2>
          <p>Step {step} of 3</p>
        </div>

        {statusMessage && (
          <div className="alert alert-success">
            <i className="fas fa-check-circle"></i>
            <span>{statusMessage}</span>
          </div>
        )}

        {errors.general && (
          <div className="alert alert-error">
            <i className="fas fa-exclamation-circle"></i>
            <span>{String(errors.general)}</span>
          </div>
        )}

        {step === 1 && (
          <form className="loginForm" onSubmit={handleRequestOtp}>
            <label>Email</label>
            <input
              className={`loginInput ${errors.email ? "error" : ""}`}
              type="email"
              placeholder="Enter your account email..."
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
            {errors.email && (
              <span className="loginFieldError">
                <i className="fas fa-exclamation-circle"></i>
                {errors.email}
              </span>
            )}

            <button className="loginButton" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form className="loginForm" onSubmit={handleVerifyOtp}>
            <label>OTP Code</label>
            <input
              className={`loginInput ${errors.otp ? "error" : ""}`}
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter 6-digit OTP"
              value={form.otp}
              onChange={(e) => updateField("otp", e.target.value.replace(/\D/g, ""))}
            />
            {errors.otp && (
              <span className="loginFieldError">
                <i className="fas fa-exclamation-circle"></i>
                {errors.otp}
              </span>
            )}

            <button className="loginButton" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              className="resendButton"
              type="button"
              onClick={handleResendOtp}
              disabled={resendSecondsLeft > 0 || isSubmitting}
            >
              {resendSecondsLeft > 0 ? `Resend OTP in ${resendSecondsLeft}s` : "Resend OTP"}
            </button>
          </form>
        )}

        {step === 3 && (
          <form className="loginForm" onSubmit={handleResetPassword}>
            <label>New Password</label>
            <input
              className={`loginInput ${errors.password ? "error" : ""}`}
              type="password"
              placeholder="Create a strong password..."
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
            />
            {renderPasswordErrors()}

            <label>Confirm Password</label>
            <input
              className={`loginInput ${errors.confirmPassword ? "error" : ""}`}
              type="password"
              placeholder="Confirm your new password..."
              value={form.confirmPassword}
              onChange={(e) => updateField("confirmPassword", e.target.value)}
            />
            {errors.confirmPassword && (
              <span className="loginFieldError">
                <i className="fas fa-exclamation-circle"></i>
                {errors.confirmPassword}
              </span>
            )}

            <button className="loginButton" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>

      <Link className="loginRegisterButton" to="/login" style={{ textDecoration: "none" }}>
        Back To Login
      </Link>
    </div>
  );
}
