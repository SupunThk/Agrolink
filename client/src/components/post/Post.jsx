import "./post.css"
import { Link } from "react-router-dom"

const PF = "http://localhost:5000/images/";

// Handle both local filenames and any old Cloudinary URLs already in the DB
const getPhotoSrc = (src) =>
  src && (src.startsWith("http://") || src.startsWith("https://")) ? src : PF + src;

// Strip HTML tags so the card preview shows plain text
const stripHtml = (html) => {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
};

export default function Post({ post }) {
  return (
    <div className="postCard">
      {/* ── Image Block ── */}
      <div className="postCardImageWrapper">
        {post.photo ? (
          <img className="postCardImage" src={getPhotoSrc(post.photo)} alt={post.title} />
        ) : (
          <div className="postCardImagePlaceholder">
            <i className="fas fa-leaf"></i>
          </div>
        )}
        {post.categories?.length > 0 && (
          <span className="postCardCategory">{post.categories[0]}</span>
        )}
      </div>

      {/* ── Content Block ── */}
      <div className="postCardContent">

        {/* Author Meta */}
        <div className="postCardMeta">
          <div className="postCardAuthor">
            <div className="postCardAvatar">
              {post.authorPic ? (
                <img
                  src={
                    post.authorPic.startsWith("http://") || post.authorPic.startsWith("https://")
                      ? post.authorPic
                      : PF + post.authorPic
                  }
                  alt={post.username}
                  className="postCardAvatarImg"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling && (e.target.nextSibling.style.display = "flex");
                  }}
                />
              ) : null}
              <i
                className="fas fa-user postCardAvatarFallback"
                style={{ display: post.authorPic ? "none" : "flex" }}
              ></i>
            </div>
            <span className="postCardAuthorName">{post.username}</span>
          </div>
          <span className="postCardDate">
            {new Date(post.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>

        {/* Title */}
        <Link to={`/post/${post._id}`} className="postCardTitleLink">
          <h3 className="postCardTitle">{post.title}</h3>
        </Link>

        {/* Description */}
        <p className="postCardDesc">{stripHtml(post.desc)}</p>

        {/* Read Article (Anchors to bottom) */}
        <Link to={`/post/${post._id}`} className="postCardReadMore">
          READ ARTICLE <i className="fas fa-arrow-right"></i>
        </Link>

      </div>
    </div>
  )
}
