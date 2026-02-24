import "./write.css";
import { useContext, useState } from "react";
import axios from "axios";
import { Context } from "../../context/Context";

export default function Write() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState(null);
  const [cat, setCat] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useContext(Context);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title || !desc) {
      setError("Please provide both a title and a story.");
      return;
    }

    setPublishing(true);
    const newPost = { username: user.username, title, desc };
    if (cat) newPost.categories = [cat];

    if (file) {
      const data = new FormData();
      const filename = Date.now() + file.name;
      data.append("name", filename);
      data.append("file", file);
      try {
        const uploadRes = await axios.post("/upload", data);
        newPost.photo = uploadRes.data.url;
      } catch (err) {
        console.error("Upload failed", err);
      }
    }
    try {
      const res = await axios.post("/posts", newPost);
      window.location.replace("/post/" + res.data._id);
    } catch (err) {
      setError("Oops! Something went wrong while publishing.");
      setPublishing(false);
    }
  };

  return (
    <div className="write fadeIn">
      {/* Cover Image Preview */}
      <div className="writeCoverArea">
        {file ? (
          <div className="writeCoverPreview">
            <img src={URL.createObjectURL(file)} alt="Cover" className="writeCoverImg" />
            <div className="writeCoverOverlay">
              <label htmlFor="fileInput" className="writeCoverChange">
                <i className="fas fa-camera"></i> Change Cover
              </label>
              <button className="writeCoverRemove" onClick={() => setFile(null)}>
                <i className="fas fa-times"></i> Remove
              </button>
            </div>
          </div>
        ) : (
          <label htmlFor="fileInput" className="writeCoverUpload">
            <div className="writeCoverUploadInner">
              <i className="fas fa-image"></i>
              <span>Add a cover photo</span>
              <small>Click to browse — recommended 1200×600px</small>
            </div>
          </label>
        )}
        <input
          type="file"
          id="fileInput"
          style={{ display: "none" }}
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
        />
      </div>

      {/* Editor */}
      <form className="writeEditor" onSubmit={handleSubmit}>
        {/* Toolbar */}
        <div className="writeToolbar">
          <div className="writeToolbarLeft">
            <div className="writeAuthor">
              <div className="writeAuthorAvatar">
                <i className="fas fa-user"></i>
              </div>
              <div>
                <span className="writeAuthorName">{user.username}</span>
                <span className="writeAuthorLabel">Writing a post</span>
              </div>
            </div>
          </div>
          <div className="writeToolbarRight">
            {error && (
              <div className="alert alert-error writeAlert">
                <i className="fas fa-exclamation-circle"></i>
                <span>{error}</span>
              </div>
            )}
            <button className="writePublishBtn" type="submit" disabled={publishing}>
              {publishing ? (
                <><i className="fas fa-spinner fa-spin"></i> Publishing...</>
              ) : (
                <><i className="fas fa-paper-plane"></i> Publish</>
              )}
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="writeTitleArea">
          <input
            type="text"
            className="writeTitleInput"
            placeholder="Your post title..."
            autoFocus
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Category */}
        <div className="writeCategoryArea">
          <i className="fas fa-tag writeCategoryIcon"></i>
          <input
            type="text"
            className="writeCategoryInput"
            placeholder="Add a category (e.g. Organic, Crops)..."
            onChange={(e) => setCat(e.target.value)}
          />
        </div>

        {/* Body */}
        <div className="writeBodyArea">
          <textarea
            className="writeBodyInput"
            placeholder="Share your story with the community..."
            onChange={(e) => setDesc(e.target.value)}
          />
        </div>
      </form>
    </div>
  );
}
