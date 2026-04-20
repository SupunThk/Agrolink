import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Context } from "../../context/Context";
import "./DiseaseDetail.css";

const IMAGE_BASE_URL = "http://localhost:5000";

function InfoState({ title, message }) {
    return (
        <div className="diseaseDetailState">
            <h1 className="diseaseDetailStateTitle">{title}</h1>
            <p className="diseaseDetailStateText">{message}</p>
            <Link to="/my-knowledge-submissions" className="diseaseDetailBackButton">
                Back to My Submissions
            </Link>
        </div>
    );
}

export default function MySubmissionDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(Context);
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notFound, setNotFound] = useState(false);
    const [invalidId, setInvalidId] = useState(false);
    const [imageFailed, setImageFailed] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [actionError, setActionError] = useState("");

    useEffect(() => {
        const fetchArticle = async () => {
            if (!user?._id) {
                setError("Please log in to view your submission details.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError("");
            setNotFound(false);
            setInvalidId(false);
            setImageFailed(false);
            setActionError("");

            try {
                const res = await axios.get(`/knowledge/mine/${id}?userId=${user._id}`);
                setArticle(res.data);
            } catch (err) {
                if (err.response?.status === 400) {
                    setInvalidId(true);
                } else if (err.response?.status === 404) {
                    setNotFound(true);
                } else if (err.response?.status === 401) {
                    setError("Please log in to view your submission details.");
                } else {
                    setError("Unable to load this submission right now.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
    }, [id, user]);

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

    const handleDelete = async () => {
        if (!user?._id || !article || article.status !== "pending") {
            return;
        }

        const shouldDelete = window.confirm("Delete this pending submission?");
        if (!shouldDelete) {
            return;
        }

        setDeleting(true);
        setActionError("");

        try {
            await axios.delete(`/knowledge/mine/${id}`, { data: { userId: user._id } });
            navigate("/my-knowledge-submissions");
        } catch (err) {
            setActionError(err.response?.data?.message || "Unable to delete this submission.");
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="about fadeIn">
                <div className="kbPage">
                <div className="diseaseDetailPage">
                    <div className="diseaseDetailBackButton diseaseDetailSkeletonBar"></div>
                    <section className="diseaseDetailHero">
                        <div className="diseaseDetailHeroContent diseaseDetailSkeletonCard">
                            <div className="diseaseDetailSkeletonPill"></div>
                            <div className="diseaseDetailSkeletonTitle"></div>
                            <div className="diseaseDetailSkeletonSubtitle"></div>
                            <div className="diseaseDetailSkeletonSubtitle short"></div>
                        </div>
                        <div className="diseaseDetailImageWrap diseaseDetailSkeletonCard"></div>
                    </section>
                    <section className="diseaseDetailGrid">
                        <article className="diseaseDetailCard diseaseDetailSkeletonCard"></article>
                        <article className="diseaseDetailCard diseaseDetailSkeletonCard"></article>
                    </section>
                    <section className="diseaseDetailTreatment diseaseDetailSkeletonCard"></section>
                </div>
                </div>
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="about fadeIn">
                <div className="kbPage">
                <InfoState title="Submission not found" message="This submission could not be found under your account." />
                </div>
            </div>
        );
    }

    if (invalidId) {
        return (
            <div className="about fadeIn">
                <div className="kbPage">
                <InfoState title="Invalid submission link" message="The submission link is invalid. Please open it again from My Submissions." />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="about fadeIn">
                <div className="kbPage">
                <InfoState title="Unable to load submission" message={error} />
                </div>
            </div>
        );
    }

    const cropName = article?.diseaseId?.cropId?.name || "Unknown Crop";
    const diseaseName = article?.diseaseId?.diseaseName || "Disease";
    const heroImage = getImageSrc(article?.imageUrl);
    const showImageFallback = !heroImage || imageFailed;
    const status = (article?.status || "pending").toLowerCase();

    return (
        <div className="about fadeIn">
            <div className="kbPage">
            <div className="diseaseDetailPage">
                <Link to="/my-knowledge-submissions" className="diseaseDetailBackButton">
                    Back to My Submissions
                </Link>

                <section className="diseaseDetailHero">
                    <div className="diseaseDetailHeroContent">
                        <div className="diseaseDetailStatusRow">
                            <span className="diseaseDetailPill">{cropName}</span>
                            <span className={`diseaseDetailStatusPill ${status}`}>{status.toUpperCase()}</span>
                        </div>
                        <h1 className="diseaseDetailTitle">{article.title}</h1>
                        <p className="diseaseDetailSubtitle">{diseaseName}</p>
                        {actionError ? <p className="diseaseDetailCardIntro">{actionError}</p> : null}
                        {article.status === "pending" ? (
                            <div className="diseaseDetailActionRow">
                                <Link to={`/my-knowledge-submissions/${id}/edit`} className="diseaseDetailActionButton primary">
                                    Edit Submission
                                </Link>
                                <button
                                    type="button"
                                    className="diseaseDetailActionButton secondary"
                                    disabled={deleting}
                                    onClick={handleDelete}
                                >
                                    {deleting ? "Deleting..." : "Delete Submission"}
                                </button>
                            </div>
                        ) : null}
                    </div>
                    <div className="diseaseDetailImageWrap">
                        {showImageFallback ? (
                            <div className="diseaseDetailImageFallback">
                                <span className="diseaseDetailImageBadge">{cropName}</span>
                                <h2 className="diseaseDetailImageFallbackTitle">{article.title}</h2>
                                <p className="diseaseDetailImageFallbackText">
                                    Review status, diagnosis, prevention, and treatment guidance for your submission.
                                </p>
                            </div>
                        ) : (
                            <img
                                className="diseaseDetailImage"
                                src={heroImage}
                                alt={article.title}
                                onError={() => setImageFailed(true)}
                            />
                        )}
                    </div>
                </section>

                <section className="diseaseDetailGrid">
                    <article className="diseaseDetailCard">
                        <h2 className="diseaseDetailCardTitle">Symptoms</h2>
                        <p className="diseaseDetailCardIntro">
                            Key visual signs and field symptoms included in your submitted disease article.
                        </p>
                        <ul className="diseaseDetailList">
                            {article.symptoms?.map((symptom, index) => (
                                <li key={`${symptom}-${index}`}>{symptom}</li>
                            ))}
                        </ul>
                    </article>

                    <article className="diseaseDetailCard">
                        <h2 className="diseaseDetailCardTitle">Prevention</h2>
                        <p className="diseaseDetailCardIntro">
                            Preventive measures and management suggestions provided with your submission.
                        </p>
                        <ul className="diseaseDetailList">
                            {article.preventionMethods?.map((method, index) => (
                                <li key={`${method}-${index}`}>{method}</li>
                            ))}
                        </ul>
                    </article>
                </section>

                <section className="diseaseDetailTreatment">
                    <h2 className="diseaseDetailCardTitle">Treatment Plan</h2>
                    <p className="diseaseDetailCardIntro">
                        The treatment guidance attached to your submission for admin review.
                    </p>
                    <p className="diseaseDetailTreatmentText">{article.treatmentPlan}</p>
                </section>
            </div>
            </div>
        </div>
    );
}
