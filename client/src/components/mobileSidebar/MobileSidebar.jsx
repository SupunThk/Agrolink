import "./mobileSidebar.css";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { Context } from "../../context/Context";
import Logo from "../logo/Logo";

export default function MobileSidebar({ isOpen, setIsOpen }) {
  const { user, dispatch } = useContext(Context);

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    setIsOpen(false);
  };

  return (
    <div className={`navSidebarContainer ${isOpen ? "open" : ""}`}>
      <div className="navSidebarBackdrop" onClick={() => setIsOpen(false)}></div>
      <div className="navSidebarWrapper">
        <div className="navSidebarHeader">
          <Logo />
          <p className="navSidebarSubtitle">Community Management</p>
        </div>
        
        <div className="navSidebarContent">
          <div className="navSidebarSection">
            <h4 className="navSidebarSectionTitle">MAIN NAVIGATION</h4>
            <ul className="navSidebarList">
              <li className="navSidebarListItem">
                <Link className="link" to="/" onClick={() => setIsOpen(false)}>
                  <i className="fas fa-th-large"></i> Overview
                </Link>
              </li>
              <li className="navSidebarListItem">
                <Link className="link" to="/write" onClick={() => setIsOpen(false)}>
                  <i className="fas fa-plus-circle"></i> Create Post
                </Link>
              </li>
              <li className="navSidebarListItem">
                <Link className="link" to="/knowledge" onClick={() => setIsOpen(false)}>
                  <i className="fas fa-book-open"></i> Crop Diseases
                </Link>
              </li>
            </ul>
          </div>

          <div className="navSidebarSection">
            <h4 className="navSidebarSectionTitle">GROUP PARTS</h4>
            <ul className="navSidebarList">
              <li className="navSidebarListItem">
                <Link className="link" to="/about" onClick={() => setIsOpen(false)}>
                  <i className="fas fa-info-circle"></i> Part 01: About Us
                </Link>
              </li>
              <li className="navSidebarListItem">
                <Link className="link" to="/about" onClick={() => setIsOpen(false)}>
                  <i className="fas fa-users"></i> Part 02: Our Team
                </Link>
              </li>
              <li className="navSidebarListItem">
                <Link className="link" to="/contact" onClick={() => setIsOpen(false)}>
                  <i className="fas fa-comment-alt"></i> Part 03: Discussion
                </Link>
              </li>
              <li className="navSidebarListItem">
                <Link className="link" to="/" onClick={() => setIsOpen(false)}>
                  <i className="fas fa-file-alt"></i> Part 04: Research
                </Link>
              </li>
              <li className="navSidebarListItem">
                <Link className="link" to="/" onClick={() => setIsOpen(false)}>
                  <i className="fas fa-chart-line"></i> Part 05: Reports
                </Link>
              </li>
              <li className="navSidebarListItem">
                <Link className="link" to="/" onClick={() => setIsOpen(false)}>
                  <i className="fas fa-shield-alt"></i> Part 06: Security
                </Link>
              </li>
            </ul>
          </div>

          <div className="navSidebarSection">
            <h4 className="navSidebarSectionTitle">ACCOUNT</h4>
            <ul className="navSidebarList">
              {user ? (
                <>
                  <li className="navSidebarListItem">
                    <Link className="link" to="/settings" onClick={() => setIsOpen(false)}>
                      <i className="fas fa-user-cog"></i> Settings
                    </Link>
                  </li>
                  <li className="navSidebarListItem" onClick={handleLogout}>
                    <div className="link logoutBtn">
                      <i className="fas fa-sign-out-alt"></i> Logout
                    </div>
                  </li>
                </>
              ) : (
                <>
                  <li className="navSidebarListItem">
                    <Link className="link" to="/login" onClick={() => setIsOpen(false)}>
                      <i className="fas fa-sign-in-alt"></i> Sign In
                    </Link>
                  </li>
                  <li className="navSidebarListItem">
                    <Link className="link" to="/register" onClick={() => setIsOpen(false)}>
                      <i className="fas fa-user-plus"></i> Join Now
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="navSidebarFooter">
          <div className="navSidebarStatus">
            <span className="statusIcon pulse"></span>
            <span>System Operational</span>
          </div>
        </div>
      </div>
    </div>
  );
}
