import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Context } from "../../context/Context";
import "./knowledgeBase.css";

function getSummary(item) {
    const sourceText =
        item.treatmentPlan ||
        item.symptoms?.[0] ||
        "Awaiting admin review.";

    return sourceText.length > 120 ? `${sourceText.slice(0, 117)}...` : sourceText;
}

export default function AdminPendingReview() {
    const { user } = useContext(Context);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [busyId, setBusyId] = useState("");

    useEffect(() => {
        const fetchPending = async () => {
            if (!user?.isAdmin) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError("");

            try {
                const res = await axios.get(`/knowledge/pending?userId=${user._id}`);
                setItems(res.data);
            } catch (err) {
                setError(err.response?.data?.message || "Unable to load pending submissions.");
            } finally {
                setLoading(false);
            }
        };

        fetchPending();
    }, [user]);

    const handleStatusUpdate = async (articleId, nextStatus) => {
        setBusyId(articleId);
        setError("");

        try {
            await axios.put(`/knowledge/${articleId}/${nextStatus}`, { userId: user._id });
            setItems((current) => current.filter((item) => item._id !== articleId));
        } catch (err) {
            setError(err.response?.data?.message || "Unable to update this submission.");
        } finally {
            setBusyId("");
        }
    };

    if (!user) {
        return (
            <div className="about fadeIn">
                <p className="kbEmpty">
                    Please log in to review pending knowledge submissions.{" "}
                    <Link to="/login" className="kbInlineLink">Go to Login</Link>
                </p>
            </div>
        );
    }

    if (!user.isAdmin) {
        return (
            <div className="about fadeIn">
                <p className="kbEmpty">This page is available to admins only.</p>
            </div>
        );
    }

    return (
        <div className="about fadeIn">
            <div className="kbHero">
                <div>
                    <h1 className="kbHeading">Pending Knowledge Review</h1>
                    <p className="kbSubheading">
                        Review pending disease submissions, approve ready articles, or reject incomplete ones.
                    </p>
                </div>
                <div className="kbHeroActions">
                    <Link className="kbSecondaryButton" to="/knowledge">
                        Back to Knowledge Base
                    </Link>
                </div>
            </div>

            {error ? <div className="kbMessage error">{error}</div> : null}

            {loading ? (
                <div className="kbGrid">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <article className="kbCard kbSkeletonCard" key={`review-skeleton-${index}`}>
                            <div className="kbCardTop kbSkeletonBlock"></div>
                            <div className="kbCardInfo">
                                <div className="kbMetaRow">
                                    <div className="kbSkeletonPill kbSkeletonBlock"></div>
                                    <div className="kbSkeletonStatus kbSkeletonBlock"></div>
                                </div>
                                <div className="kbSkeletonTitle kbSkeletonBlock"></div>
                                <div className="kbSkeletonText kbSkeletonBlock"></div>
                                <div className="kbSkeletonText short kbSkeletonBlock"></div>
                                <div className="kbCardBottom">
                                    <div className="kbActionRow">
                                        <div className="kbSkeletonButton kbSkeletonBlock"></div>
                                        <div className="kbSkeletonButton kbSkeletonBlock"></div>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            ) : items.length === 0 ? (
                <p className="kbEmpty">No pending submissions right now.</p>
            ) : (
                <div className="kbGrid">
                    {items.map((item) => (
                        <article className="kbCard glass-panel" key={item._id}>
                            <div className="kbCardTop">
                                <div className="kbImgFallback">
                                    <span className="kbImgFallbackBadge">
                                        {item.diseaseId?.cropId?.name || "Submission"}
                                    </span>
                                    <h3 className="kbImgFallbackTitle">{item.title}</h3>
                                    <p className="kbImgFallbackText">
                                        Submitted by {item.submittedBy?.username || "a user"} for admin moderation.
                                    </p>
                                </div>
                            </div>

                            <div className="kbCardInfo">
                                <div className="kbMetaRow">
                                    {item.diseaseId?.cropId?.name ? (
                                        <span className="kbCropPill">{item.diseaseId.cropId.name}</span>
                                    ) : null}
                                    <span className="kbStatusPill pending">PENDING</span>
                                </div>

                                <h2 className="kbCardTitle">{item.title}</h2>
                                <p className="kbCardSummary">{getSummary(item)}</p>
                                <p className="kbMetaText">
                                    Disease: {item.diseaseId?.diseaseName || "Unknown"}<br />
                                    Submitted: {new Date(item.createdAt).toLocaleString()}
                                </p>

                                <div className="kbCardBottom">
                                    <div className="kbActionRow">
                                        <button
                                            type="button"
                                            className="kbActionButton approve"
                                            disabled={busyId === item._id}
                                            onClick={() => handleStatusUpdate(item._id, "approve")}
                                        >
                                            {busyId === item._id ? "Updating..." : "Approve"}
                                        </button>
                                        <button
                                            type="button"
                                            className="kbActionButton reject"
                                            disabled={busyId === item._id}
                                            onClick={() => handleStatusUpdate(item._id, "reject")}
                                        >
                                            {busyId === item._id ? "Updating..." : "Reject"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
