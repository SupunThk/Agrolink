import { useState } from "react"
import "./register.css"
import { Link } from "react-router-dom"
import axios from "axios"


export default function Register() {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [role, setRole] = useState("user");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!username || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (role === "expert" && !description.trim()) {
      setError("Please provide a description about your expertise.");
      return;
    }

    try {
      const res = await axios.post("/auth/register", {
        username,
        name: name || username,
        email,
        password,
        role,
        ...(role === "expert" ? { description } : {}),
      });
      if (res.data && res.data.pendingApproval) {
        setSuccess("Your expert account has been created! Please wait for admin approval before you can log in.");
      } else {
        res.data && window.location.replace("/login");
      }
    } catch (err) {
      const errorMsg = typeof err.response?.data === "string" 
        ? err.response.data 
        : "Username or email already exists!";
      setError(errorMsg);
    }
  };

  return (
    <div className="register fadeIn">
      <div className="registerCard">
        <div className="registerBranding">
          <i className="fas fa-leaf"></i>
          <h2>Agro<span>Link</span></h2>
          <p>Join our organic community</p>
        </div>
        <form className="registerForm" onSubmit={handleSubmit}>
          <label>Account Type</label>
          <div className="registerRoleSelector">
            <button
              type="button"
              className={`registerRoleBtn${role === "user" ? " active" : ""}`}
              onClick={() => setRole("user")}
            >
              <i className="fas fa-user"></i>
              <span>Normal User</span>
            </button>
            <button
              type="button"
              className={`registerRoleBtn${role === "expert" ? " active" : ""}`}
              onClick={() => setRole("expert")}
            >
              <i className="fas fa-user-tie"></i>
              <span>Expert</span>
            </button>
          </div>
          {role === "expert" && (
            <>
              <label>About You</label>
              <textarea
                className="registerInput registerTextarea"
                placeholder="Describe your expertise, qualifications, and experience..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="registerExpertNote">
                <i className="fas fa-info-circle"></i>
                <span>Expert accounts require admin approval before you can log in.</span>
              </div>
            </>
          )}
          <div className="registerGrid">
            <div className="registerField">
              <label>Username</label>
              <input
                className="registerInput"
                type="text"
                placeholder="Choose a username..."
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="registerField">
              <label>Full Name</label>
              <input
                className="registerInput"
                type="text"
                placeholder="Enter your full name..."
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
          <label>Email</label>
          <input
            className="registerInput"
            type="text"
            placeholder="Enter your email..."
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="registerGrid">
            <div className="registerField">
              <label>Password</label>
              <div className="registerInputWrapper">
                <input
                  className="registerInput"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password..."
                  onChange={(e) => setPassword(e.target.value)}
                />
                <i
                  className={`registerEyeIcon fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                  onClick={() => setShowPassword(!showPassword)}
                />
              </div>
            </div>
            <div className="registerField">
              <label>Confirm Password</label>
              <div className="registerInputWrapper">
                <input
                  className="registerInput"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm password..."
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <i
                  className={`registerEyeIcon fas ${showConfirm ? "fa-eye-slash" : "fa-eye"}`}
                  onClick={() => setShowConfirm(!showConfirm)}
                />
              </div>
            </div>
          </div>
          <button className="registerButton" type="submit">
            {role === "expert" ? "Submit for Approval" : "Create Account"}
          </button>
          {success && (
            <div className="alert alert-success">
              <i className="fas fa-check-circle"></i>
              <span>{success}</span>
            </div>
          )}
          {error && (
            <div className="alert alert-error">
              <i className="fas fa-exclamation-circle"></i>
              <span>{String(error)}</span>
            </div>
          )}
        </form>
      </div>
      <button className="registerLoginButton">
        <Link className="link" to="/login">
          Sign In
        </Link>
      </button>
    </div>
  );
}
