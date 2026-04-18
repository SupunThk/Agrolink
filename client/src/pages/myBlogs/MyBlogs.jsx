import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../../context/Context";
import Post from "../../components/post/Post";
import "./myBlogs.css";

const PF = "http://localhost:5000/images/";
const getPhotoSrc = (src) =>
    src && (src.startsWith("http://") || src.startsWith("https://")) ? src : PF + src;

const stripHtml = (html) => {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
};

export default function MyBlogs() {
    const [posts, setPosts] = useState([]);
    const { user } = useContext(Context);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // authorRequestsOwn=true bypasses the "Approved only" filter in the backend
                const res = await axios.get(`/posts?user=${user.username}&authorRequestsOwn=true`);
                setPosts(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        if (user) {
            fetchPosts();
        }
    }, [user]);

    if (!user) {
        navigate("/login");
        return null;
    }

    return (
        <div className="myBlogs">
            <div className="myBlogsHeader">
                <h1>My Blogs</h1>
                <p>Manage all your written posts here</p>
            </div>

            <div className="myBlogsContainer">
                {posts.length === 0 ? (
                    <div className="myBlogsEmpty">
                        <p>You haven't written any blogs yet.</p>
                        <Link to="/write" className="link myBlogsWriteBtn">Write a Blog</Link>
                    </div>
                ) : (
                    <div className="myBlogsPosts">
                        {posts.map((post) => (
                            <Post key={post._id} post={post} showStatus={true} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
