import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Context } from "../../context/Context";
import "./knowledgeBase.css";

const IMAGE_BASE_URL = "http://localhost:5000";

function getSummary(article) {
    const sourceText =
        article.treatmentPlan ||
        article.symptoms?.[0] ||
        "Practical prevention and treatment guidance for this crop disease.";

    return sourceText.length > 120 ? `${sourceText.slice(0, 117)}...` : sourceText;
}

export default function MyKnowledgeSubmissions() {
    const { user } = useContext(Context);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [imageFailures, setImageFailures] = useState({});

    const getImageSrc = (imageUrl) => {
        if (!imageUrl) {
            return null;
        }

        if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
            return imageUrl;
        }

        if (imageUrl.startsWith("/")) {
            return `${IMAGE_BASE_URL}${imageUrl}`;
        }

        return `${IMAGE_BASE_URL}/images/${imageUrl}`;
    };

    useEffect(() => {
        const fetchMine = async () => {
            if (!user?._id) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError("");
            setImageFailures({});

            try {
                const res = await axios.get(`/knowledge/mine?userId=${user._id}`);
                setItems(res.data);
            } catch (err) {
                setError(err.response?.data?.message || "Unable to load your submissions.");
            } finally {
                setLoading(false);
            }
        };

        fetchMine();
    }, [user]);

    if (!user) {
        return (
            <div className="about fadeIn">
                <div className="kbHero">
                    <div>
                        <h1 className="kbHeading">My Disease Submissions</h1>
                        <p className="kbSubheading">Log in to view the disease articles you have submitted for review.</p>
                    </div>
                </div>
                <p className="kbEmpty">
                    Please log in to view your submissions. <Link to="/login" className="kbInlineLink">Go to Login</Link>
                </p>
            </div>
        );
    }

    return (
        <div className="about fadeIn">
            <div className="kbHero">
                <div>
                    <h1 className="kbHeading">My Disease Submissions</h1>
                    <p className="kbSubheading">
                        Track the review status of the disease articles you have submitted.
                    </p>
                </div>
                <div className="kbHeroActions">
                    <Link className="kbSecondaryButton" to="/knowledge">
                        Back to Knowledge Base
                    </Link>
                    <Link className="kbAddButton" to="/add-disease">
                        + Add New Disease
                    </Link>
                </div>
            </div>

            {error ? (
                <p className="kbEmpty">{error}</p>
            ) : loading ? (
                <div className="kbGrid">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <article className="kbCard kbSkeletonCard" key={`my-kb-skeleton-${index}`}>
                            <div className="kbCardTop kbSkeletonBlock"></div>
                            <div className="kbCardInfo">
                                <div className="kbMetaRow">
                                    <div className="kbSkeletonPill kbSkeletonBlock"></div>
                                    <div className="kbSkeletonStatus kbSkeletonBlock"></div>
                                </div>
                                <div className="kbSkeletonTitle kbSkeletonBlock"></div>
                                <div className="kbSkeletonText kbSkeletonBlock"></div>
                                <div className="kbSkeletonText short kbSkeletonBlock"></div>
                                <div className="kbMetaText">
                                    <div className="kbSkeletonMeta kbSkeletonBlock"></div>
                                </div>
                                <div className="kbCardBottom">
                                    <div className="kbSkeletonButton kbSkeletonBlock"></div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            ) : items.length === 0 ? (
                <p className="kbEmpty">You have not submitted any disease articles yet.</p>
            ) : (
                <div className="kbGrid">
                    {items.map((item) => (
                        <article className="kbCard glass-panel" key={item._id}>
                            <div className="kbCardTop">
                                {getImageSrc(item.imageUrl) && !imageFailures[item._id] ? (
                                    <img
                                        className="kbImg"
                                        src={getImageSrc(item.imageUrl)}
                                        alt={item.title}
                                        onError={() =>
                                            setImageFailures((current) => ({ ...current, [item._id]: true }))
                                        }
                                    />
                                ) : (
                                    <div className="kbImgFallback">
                                        <span className="kbImgFallbackBadge">
                                            {item.diseaseId?.cropId?.name || "Submission"}
                                        </span>
                                        <h3 className="kbImgFallbackTitle">{item.title}</h3>
                                        <p className="kbImgFallbackText">
                                            Review status, crop context, and article details for your submission.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="kbCardInfo">
                                <div className="kbMetaRow">
                                    {item.diseaseId?.cropId?.name && (
                                        <span className="kbCropPill">{item.diseaseId.cropId.name}</span>
                                    )}
                                    <span className={`kbStatusPill ${(item.status || "pending").toLowerCase()}`}>
                                        {(item.status || "pending").toUpperCase()}
                                    </span>
                                </div>

                                <h2 className="kbCardTitle">{item.title}</h2>
                                <p className="kbCardSummary">{getSummary(item)}</p>
                                <p className="kbMetaText">
                                    Submitted: {new Date(item.createdAt).toLocaleString()}
                                </p>

                                <div className="kbCardBottom">
                                    <Link to={`/my-knowledge-submissions/${item._id}`} className="kbReadMore">
                                        Read More
                                    </Link>
                                    {item.status !== "approved" ? (
                                        <div className="kbPendingNote">
                                            {item.status === "rejected"
                                                ? "This submission was rejected and is not visible in the public knowledge base."
                                                : "Awaiting admin approval before appearing in the public knowledge base."}
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
