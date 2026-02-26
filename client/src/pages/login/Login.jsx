import { Link } from "react-router-dom";
import "./login.css";
import { useRef, useContext, useState, useEffect } from "react";
import { Context } from "../../context/Context";
import axios from "axios";

export default function Login() {
  const userRef = useRef();
  const passwordRef = useRef();
  const { dispatch, isFetching } = useContext(Context);
  const [error, setError] = useState(false);
  const [deactivatedMsg, setDeactivatedMsg] = useState(null);

  // Show deactivation message if redirected from a forced logout
  useEffect(() => {
    const msg = sessionStorage.getItem("deactivatedMessage");
    if (msg) {
      setDeactivatedMsg(msg);
      sessionStorage.removeItem("deactivatedMessage");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(false);
    
    const username = userRef.current.value;
    const password = passwordRef.current.value;

    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }

    dispatch({ type: "LOGIN_START" });
    try {
      const res = await axios.post("/auth/login", {
        username,
        password,
      });
      dispatch({ type: "LOGIN_SUCCESS", payload: res.data });
      // Redirect based on role
      if (res.data.isAdmin || res.data.role === "admin") {
        window.location.replace("/admin");
      } else {
        window.location.replace("/");
      }
    } catch (err) {
      dispatch({ type: "LOGIN_FAILURE" });
      const errorMsg = typeof err.response?.data === "string" 
        ? err.response.data 
        : "Something went wrong!";
      setError(errorMsg);
    }
  };

  return (
    <div className="login fadeIn">
      <div className="loginCard">
        <div className="loginBranding">
          <i className="fas fa-leaf"></i>
          <h2>Agro<span>Link</span></h2>
          <p>Welcome back to the community</p>
        </div>
        <form className="loginForm" onSubmit={handleSubmit}>
          {deactivatedMsg && (
            <div className="alert alert-warning" style={{ marginBottom: 16 }}>
              <i className="fas fa-ban"></i>
              <span>{deactivatedMsg}</span>
            </div>
          )}
          <label>Username</label>
          <input
            className="loginInput"
            type="text"
            placeholder="Enter your username..."
            ref={userRef}
          />
          <label>Password</label>
          <input
            className="loginInput"
            type="password"
            placeholder="Enter your password..."
            ref={passwordRef}
          />
          <button className="loginButton" type="submit" disabled={isFetching}>
            {isFetching ? "Authenticating..." : "Sign In"}
          </button>
          {error && (
            <div className="alert alert-error">
              <i className="fas fa-exclamation-circle"></i>
              <span>{String(error)}</span>
            </div>
          )}
        </form>
      </div>
      <button className="loginRegisterButton">
        <Link className="link" to="/register">
          Create Account
        </Link>
      </button>
    </div>
  );
}
