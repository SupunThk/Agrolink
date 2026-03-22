import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { Context } from "../../context/Context";
import "./singlePost.css";
import RichEditor from "../richEditor/RichEditor";

const PF = "http://localhost:5000/images/";
// Handle both local filenames and any old Cloudinary URLs already in the DB
const getPhotoSrc = (src) =>
  src && (src.startsWith("http://") || src.startsWith("https://")) ? src : PF + src;

export default function SinglePost() {
  const location = useLocation();
  const path = location.pathname.split("/")[2];
  const [post, setPost] = useState({});
  // post.photo is now a full Cloudinary HTTPS URL — no local prefix needed
  const { user } = useContext(Context);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState(null);
  const [updateMode, setUpdateMode] = useState(false);

  useEffect(() => {
    const getPost = async () => {
      try {
        const urlToFetch = user?.username ? `/posts/${path}?user=${user.username}` : `/posts/${path}`;
        const res = await axios.get(urlToFetch);
        setPost(res.data);
        setTitle(res.data.title);
        setDesc(res.data.desc);
      } catch (err) {
        setPost({});
        setTitle("");
        setDesc("");
      }
    };
    getPost();
  }, [path]);

  const handleDelete = async () => {
    try {
      await axios.delete(`/posts/${post._id}`, {
        data: { username: user.username },
      });
      window.location.replace("/");
    } catch (err) {
      setError(
        typeof err.response?.data === "string"
          ? err.response.data
          : "Failed to delete post. Please try again."
      );
    }
  };

  const [error, setError] = useState(null);

  const handleUpdate = async () => {
    setError(null);
    const updatedPost = {
      username: user.username,
      title,
      desc,
    };

    if (file) {
      const data = new FormData();
      const filename = Date.now() + file.name;
      data.append("name", filename);
      data.append("file", file);
      updatedPost.photo = filename;
      try {
        await axios.post("/upload", data);
      } catch (err) {
        setError("Failed to upload cover image. Please try again.");
        return;
      }
    }

    try {
      await axios.put(`/posts/${post._id}`, updatedPost);
      setUpdateMode(false);
      setFile(null);
      // Reload page to show new image properly if updatedPost.photo changed
      if (updatedPost.photo) {
        window.location.reload();
      }
    } catch (err) {
      setError("Failed to update post. Please try again.");
    }
  };

  return (
    <div className="singlePost">
      <div className="singlePostWrapper">
        {updateMode ? (
          <div className="singlePostImgContainer">
            {file ? (
              <img src={URL.createObjectURL(file)} alt="" className="singlePostImg" />
            ) : post.photo ? (
              <img src={getPhotoSrc(post.photo)} alt="" className="singlePostImg" />
            ) : (
              <div className="singlePostImgPlaceholder">
                <i className="fas fa-image"></i>
                <span>No cover image</span>
              </div>
            )}
            <div className="singlePostImgUpdateOverlay">
              <label htmlFor="fileInput" className="singlePostImgUpdateBtn">
                <i className="fas fa-camera"></i> Change Cover
              </label>
              <input
                type="file"
                id="fileInput"
                style={{ display: "none" }}
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>
          </div>
        ) : (
          post.photo && (
            <img src={getPhotoSrc(post.photo)} alt="" className="singlePostImg" />
          )
        )}
        {updateMode ? (
          <input
            type="text"
            value={title}
            className="singlePostTitleInput"
            autoFocus
            onChange={(e) => setTitle(e.target.value)}
          />
        ) : (
          <h1 className="singlePostTitle">
            {title}
            {post.username === user?.username && (
              <div className="singlePostEdit">
                <i
                  className="singlePostIcon far fa-edit"
                  onClick={() => setUpdateMode(true)}
                ></i>
                <i
                  className="singlePostIcon far fa-trash-alt"
                  onClick={handleDelete}
                ></i>
              </div>
            )}
          </h1>
        )}
        <div className="singlePostInfo">
          <span className="singlePostAuthor">
            Author:
            <Link to={`/?user=${post.username}`} className="link">
              <b> {post.username}</b>
            </Link>
          </span>
          <span className="singlePostDate">
            {new Date(post.createdAt).toDateString()}
          </span>
        </div>
        {updateMode ? (
          <RichEditor
            value={desc}
            onChange={setDesc}
            placeholder="Write your story..."
            minHeight="360px"
          />
        ) : (
          <div className="singlePostDesc" dangerouslySetInnerHTML={{ __html: desc }} />
        )}
        {updateMode && (
          <div className="singlePostUpdateActions">
            {error && (
              <div className="alert alert-error">
                <i className="fas fa-exclamation-circle"></i>
                <span>{error}</span>
              </div>
            )}
            <div className="singlePostUpdateButtons">
              <button className="singlePostCancelButton" onClick={() => { setUpdateMode(false); setFile(null); }}>
                Cancel
              </button>
              <button className="singlePostButton" onClick={handleUpdate}>
                Update Post
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}