import { Link } from "react-router-dom";
import "./topbar.css";
import { useContext, useState } from "react";
import { Context } from "../../context/Context";
import Logo from "../logo/Logo";
import MobileSidebar from "../mobileSidebar/MobileSidebar";

export default function Topbar() {
  const {user, theme, dispatch} = useContext(Context);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const PF = "http://localhost:5000/images/";
  const getAvatarSrc = (src) =>
    src && (src.startsWith("http://") || src.startsWith("https://")) ? src : PF + src;

  const handleLogout = () => {
    dispatch({type:"LOGOUT"});
  }
  
  const handleProfileClick = () => {
    dispatch({type: "SHOW_VMODAL"});
  }

  return (
    <>
      <div className="top glass-panel">
        <div className="topLeft">
          <button className="topHamburger" onClick={() => setSidebarOpen(true)}>
            <i className="fas fa-bars"></i>
          </button>
          <div className="topLogoTrigger">
            <Logo />
          </div>
        </div>
        <div className="topCenter">
          <ul className="topList">
            <li className="topListItem">
              <Link className="link" to="/">
                HOME
              </Link>
            </li>
            <li className="topListItem">
              <Link className="link" to="/about">
                ABOUT
              </Link>
            </li>
            <li className="topListItem">
              <Link className="link" to="/contact">
                CONTACT
              </Link>
            </li>
            <li className="topListItem">
              <Link className="link" to="/knowledge">
                CROP DISEASES
              </Link>
            </li>
            <li className="topListItem">
              <Link className="link" to="/write">
                WRITE
              </Link>
            </li>
            {user && (
              <li className="topListItem" onClick={handleLogout}>
                LOGOUT
              </li>
            )}
          </ul>
        </div>
        <div className="topRight">
          {user ? (
            <div onClick={handleProfileClick} style={{cursor: "pointer"}} className="topProfileBtn">
              {user.profilePic ? (
                <img
                  className="topImg"
                  src={getAvatarSrc(user.profilePic)}
                  alt="Profile"
                  onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                />
              ) : null}
              <div className="topImgDefault" style={{display: user.profilePic ? "none" : "flex"}}>
                <i className="fas fa-user"></i>
              </div>
            </div>
          ) : (
            <ul className="topList">
              <li className="topListItem">
                <Link className="link" to="/login">
                  LOGIN
                </Link>
              </li>
              <li className="topListItem">
                <Link className="link" to="/register">
                  REGISTER
                </Link>
              </li>
            </ul>
          )}
          <div className="themeToggle" onClick={() => dispatch({type: "TOGGLE_THEME"})}>
            {theme === "light" ? (
              <i className="fas fa-moon"></i>
            ) : (
              <i className="fas fa-sun"></i>
            )}
          </div>
        </div>
      </div>
      <MobileSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
    </>
  );
}
