import { useEffect, useState } from "react";
import Header from "../../components/header/Header"
import Icon from "../../components/icon/Icon";
import Posts from "../../components/posts/Posts";
import Sidebar from "../../components/sidebar/Sidebar";
import "./home.css";
import axios from "axios";
import { useLocation } from "react-router-dom";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const {search} = useLocation();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get("/posts" + search);
        setPosts(res.data);
      } catch (err) {
        // Avoid unhandled Axios errors in the UI when the API is down.
        setPosts([]);
      }
    }
    fetchPosts();
  },[search]);

  return (
    <>
      <Header/>
      <div className="home fadeIn">
        <Posts posts={posts}/>
        <Sidebar />
      <Icon/>
      </div>
      
    </>
  );
}
