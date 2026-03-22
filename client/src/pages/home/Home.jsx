import { useEffect, useState } from "react";
import Header from "../../components/header/Header";
import Icon from "../../components/icon/Icon";
import Posts from "../../components/posts/Posts";
import Sidebar from "../../components/sidebar/Sidebar";
import "./home.css";
import axios from "axios";
import { useLocation } from "react-router";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const { search } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await axios.get("/posts" + search);
      setPosts(res.data);
    };
    fetchPosts();
  }, [search]);

  return (
    <>
      <Header />
      <div className="homeTabs">
        <button
          className="homeTabBtn active"
          onClick={() => navigate("/")}
        >
          <i className="fas fa-newspaper"></i> Community Posts
        </button>
        <button
          className="homeTabBtn"
          onClick={() => navigate("/ask-expert")}
        >
          <i className="fas fa-user-graduate"></i> Ask an Expert
        </button>
      </div>
      <div className="home fadeIn">
        <Posts posts={posts} />
        <Sidebar />
        <Icon />
      </div>
    </>
  );
}
