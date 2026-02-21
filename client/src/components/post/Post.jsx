import "./post.css"
import { Link } from "react-router-dom"

export default function Post({ post }) {
  const PF = "http://localhost:5000/images/";

  return (
    <div className="post">
      {/* Image */}
      <div className="postImgWrapper">
        {post.photo ? (
          <img className="postImg" src={PF + post.photo} alt={post.title} />
        ) : (
          <div className="postImgPlaceholder">
            <i className="fas fa-leaf"></i>
          </div>
        )}
        <div className="postImgOverlay"></div>
        {post.categories?.length > 0 && (
          <span className="postCatBadge">{post.categories[0]}</span>
        )}
      </div>

      {/* Content */}
      <div className="postInfo">
        <div className="postMeta">
          <div className="postAuthorPill">
            <div className="postAuthorAvatar">
              <i className="fas fa-user"></i>
            </div>
            <span className="postAuthorName">{post.username}</span>
          </div>
          <span className="postDate">
            {new Date(post.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>

        <Link to={`/post/${post._id}`} className="link">
          <h3 className="postTitle">{post.title}</h3>
        </Link>

        <p className="postDesc">{post.desc}</p>

        <Link to={`/post/${post._id}`} className="link postReadMore">
          Read Article <i className="fas fa-arrow-right"></i>
        </Link>
      </div>
    </div>
  )
}
