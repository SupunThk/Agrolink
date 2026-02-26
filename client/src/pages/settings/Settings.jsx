import "./settings.css";
import Sidebar from "../../components/sidebar/Sidebar";
import { useContext, useState, useEffect } from "react";
import { Context } from "../../context/Context";
import axios from "axios";

export default function Settings() {
  const { user, isVerified, dispatch } = useContext(Context);

  const [file, setFile] = useState(null);
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && !isVerified) {
      dispatch({ type: "SHOW_VMODAL" });
    }
  }, [user, isVerified, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch({ type: "UPDATE_START" });
    setError(null);
    setSuccess(false);

    if (!username || !email) {
      setError("Username and Email are required.");
      dispatch({ type: "UPDATE_FAILURE" });
      return;
    }

    const updatedUser = { userId: user._id, username, email };

    if (password) {
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        dispatch({ type: "UPDATE_FAILURE" });
        return;
      }
      updatedUser.password = password;
    }

    if (file) {
      const data = new FormData();
      const filename = Date.now() + file.name;
      data.append("name", filename);
      data.append("file", file);
      updatedUser.profilePic = filename;
      try {
        await axios.post("/upload", data);
      } catch (err) {
        setError("Profile image upload failed. Please try again.");
        dispatch({ type: "UPDATE_FAILURE" });
        return;
      }
    }

    setSaving(true);
    try {
      const res = await axios.put("/users/" + user._id, updatedUser);
      setSuccess(true);
      dispatch({ type: "UPDATE_SUCCESS", payload: res.data });
    } catch (err) {
      dispatch({ type: "UPDATE_FAILURE" });
      const errorMsg = typeof err.response?.data === "string"
        ? err.response.data : "Something went wrong.";
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const PF = "http://localhost:5000/images/";
  // Handle both local filenames and old Cloudinary URLs already in the DB
  const getImageSrc = (src) =>
    src && (src.startsWith("http://") || src.startsWith("https://")) ? src : PF + src;
  const avatarSrc = file ? URL.createObjectURL(file) : (user.profilePic ? getImageSrc(user.profilePic) : null);

  return (
    <div className="settings fadeIn">
      <div className="settingsMain">
        {isVerified ? (
          <form className="settingsForm" onSubmit={handleSubmit}>

            {/* Header */}
            <div className="settingsHeader">
              <div>
                <h1 className="settingsHeading">Account Settings</h1>
                <p className="settingsSubheading">Manage your profile and preferences</p>
              </div>
              <div className="settingsHeaderActions">
                <button
                  type="button"
                  className="settingsDangerBtn"
                  onClick={() => dispatch({ type: "SHOW_DMODAL" })}
                >
                  <i className="fas fa-trash-alt"></i> Delete Account
                </button>
                <button className="settingsSaveBtn" type="submit" disabled={saving}>
                  {saving ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : <><i className="fas fa-check"></i> Save Changes</>}
                </button>
              </div>
            </div>

            {/* Alerts */}
            {success && (
              <div className="alert alert-success">
                <i className="fas fa-check-circle"></i>
                <span>Profile updated successfully!</span>
              </div>
            )}
            {error && (
              <div className="alert alert-error">
                <i className="fas fa-exclamation-circle"></i>
                <span>{String(error)}</span>
              </div>
            )}

            {/* Profile Picture Card */}
            <div className="settingsCard">
              <div className="settingsCardTitle">
                <i className="fas fa-camera"></i>
                Profile Picture
              </div>
              <div className="settingsPP">
                <div className="settingsPPLeft">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="Profile"
                      onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
                  ) : null}
                  <div className="settingsPPDefault" style={{ display: avatarSrc ? "none" : "flex" }}>
                    <i className="fas fa-user"></i>
                  </div>
                </div>
                <div className="settingsPPRight">
                  <p className="settingsPPHint">Upload a profile photo. JPG, PNG or GIF. Max 5MB.</p>
                  <label htmlFor="fileInput" className="settingsPPBtn">
                    <i className="fas fa-upload"></i>
                    {file ? "Change Photo" : "Upload Photo"}
                  </label>
                  {file && (
                    <button type="button" className="settingsPPRemove" onClick={() => setFile(null)}>
                      <i className="fas fa-times"></i> Remove
                    </button>
                  )}
                  <input type="file" id="fileInput" style={{ display: "none" }} accept="image/*"
                    onChange={(e) => setFile(e.target.files[0])} />
                </div>
              </div>
            </div>

            {/* Personal Info Card */}
            <div className="settingsCard">
              <div className="settingsCardTitle">
                <i className="fas fa-user-edit"></i>
                Personal Information
              </div>
              <div className="settingsGrid">
                <div className="settingsField">
                  <label className="settingsLabel">Username</label>
                  <input className="settingsInput" type="text" value={username}
                    onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div className="settingsField">
                  <label className="settingsLabel">Email Address</label>
                  <input className="settingsInput" type="email" value={email}
                    onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Security Card */}
            <div className="settingsCard">
              <div className="settingsCardTitle">
                <i className="fas fa-lock"></i>
                Security
              </div>
              <div className="settingsField">
                <label className="settingsLabel">New Password <span className="settingsOptional">(leave blank to keep current)</span></label>
                <input className="settingsInput" type="password" placeholder="Enter a new password..."
                  value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>

          </form>
        ) : (
          <div className="settingsLocked">
            <div className="settingsLockedIcon">
              <i className="fas fa-shield-alt"></i>
            </div>
            <h2>Security Check Required</h2>
            <p>Please verify your identity to access account settings.</p>
          </div>
        )}
      </div>
      <Sidebar />
    </div>
  );
}
