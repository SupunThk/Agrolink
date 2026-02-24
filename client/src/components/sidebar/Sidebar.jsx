import { useState, useEffect } from "react";
import "./sidebar.css";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Sidebar() {
  const [cats, setCats] = useState([]);

  useEffect(() => {
    const getCats = async () => {
      try {
        const res = await axios.get("/categories");
        setCats(res.data);
      } catch (err) { }
    };
    getCats();
  }, []);

  return (
    <div className="sidebar fadeIn">
      <div className="sidebarWrapper">

        {/* About Card */}
        <div className="sidebarCard">
          <div className="sidebarCardHeader">
            <i className="fas fa-leaf sidebarCardIcon"></i>
            <span className="sidebarTitle">About AgroLink</span>
          </div>
          <div className="sidebarImageContainer">
            <img
              className="sidebarImg"
              src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=1600&auto=format&fit=crop"
              alt="AgroLink mission"
            />
            <div className="sidebarImgOverlay">
              <div className="sidebarImgBadge">
                <i className="fas fa-leaf"></i>
                <span>Sustainable Farming</span>
              </div>
            </div>
          </div>
          <p className="sidebarDesc">
            Dedicated to the intersection of modern technology and organic agriculture.
            Fostering a community of sustainable growth and shared knowledge.
          </p>
          <Link className="sidebarReadMore link" to="/about">
            Learn More <i className="fas fa-arrow-right"></i>
          </Link>
        </div>

        {/* Categories Card */}
        {cats.length > 0 && (
          <div className="sidebarCard">
            <div className="sidebarCardHeader">
              <i className="fas fa-tags sidebarCardIcon"></i>
              <span className="sidebarTitle">Categories</span>
            </div>
            <ul className="sidebarList">
              {cats.map((c) => (
                <Link key={c._id} className="link" to={`/?cat=${c.name}`}>
                  <li className="sidebarListItem">
                    <i className="fas fa-seedling"></i>
                    {c.name}
                  </li>
                </Link>
              ))}
            </ul>
          </div>
        )}

        {/* Social Card */}
        <div className="sidebarCard">
          <div className="sidebarCardHeader">
            <i className="fas fa-share-nodes sidebarCardIcon"></i>
            <span className="sidebarTitle">Follow Us</span>
          </div>
          <div className="sidebarSocial">
            <a href="#" className="sidebarSocialBtn sidebarTwitter" aria-label="Twitter">
              <i className="fa-brands fa-twitter"></i>
              <span>Twitter</span>
            </a>
            <a href="#" className="sidebarSocialBtn sidebarInstagram" aria-label="Instagram">
              <i className="fa-brands fa-instagram"></i>
              <span>Instagram</span>
            </a>
            <a href="#" className="sidebarSocialBtn sidebarFacebook" aria-label="Facebook">
              <i className="fa-brands fa-facebook"></i>
              <span>Facebook</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
