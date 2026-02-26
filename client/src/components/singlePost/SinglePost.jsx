import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { Context } from "../../context/Context";
import "./singlePost.css";

export default function SinglePost() {
  const location = useLocation();
  const path = location.pathname.split("/")[2];
  const [post, setPost] = useState({});
  const PF = "http://localhost:5000/images/";
  const { user } = useContext(Context);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState(null);
  const [updateMode, setUpdateMode] = useState(false);

  useEffect(() => {
    const getPost = async () => {
      try {
        const res = await axios.get("/posts/" + path);
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
        setError("Failed to upload cover image.");
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
              <img src={PF + post.photo} alt="" className="singlePostImg" />
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
            <img src={PF + post.photo} alt="" className="singlePostImg" />
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
          <textarea
            className="singlePostDescInput"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        ) : (
          <p className="singlePostDesc">{desc}</p>
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