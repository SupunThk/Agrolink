import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import "./DiseaseDetail.css";

const IMAGE_BASE_URL = "http://localhost:5000";

function InfoState({ title, message }) {
    return (
        <div className="diseaseDetailState">
            <h1 className="diseaseDetailStateTitle">{title}</h1>
            <p className="diseaseDetailStateText">{message}</p>
            <Link to="/knowledge" className="diseaseDetailBackButton">
                Back to Knowledge Base
            </Link>
        </div>
    );
}

export default function DiseaseDetail() {
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notFound, setNotFound] = useState(false);
    const [imageFailed, setImageFailed] = useState(false);

    useEffect(() => {
        const fetchArticle = async () => {
            setLoading(true);
            setError("");
            setNotFound(false);
            setImageFailed(false);

            try {
                const res = await axios.get(`/knowledge/${id}`);
                setArticle(res.data);
            } catch (err) {
                if (err.response?.status === 404) {
                    setNotFound(true);
                } else {
                    setError("Unable to load this knowledge article right now. Please try again after the backend is running.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
    }, [id]);

    if (loading) {
        return (
            <div className="about fadeIn">
                <InfoState title="Loading article..." message="Fetching disease details from the knowledge base." />
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="about fadeIn">
                <InfoState title="Article not found" message="This knowledge article could not be found or may have been removed." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="about fadeIn">
                <InfoState title="Unable to load article" message={error} />
            </div>
        );
    }

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

    const cropName = article?.diseaseId?.cropId?.name || "Unknown Crop";
    const diseaseName = article?.diseaseId?.diseaseName || "Disease";
    const heroImage = getImageSrc(article?.imageUrl);
    const showImageFallback = !heroImage || imageFailed;

    return (
        <div className="about fadeIn">
            <div className="diseaseDetailPage">
                <Link to="/knowledge" className="diseaseDetailBackButton">
                    Back to Knowledge Base
                </Link>

                <section className="diseaseDetailHero">
                    <div className="diseaseDetailHeroContent">
                        <span className="diseaseDetailPill">{cropName}</span>
                        <h1 className="diseaseDetailTitle">{article.title}</h1>
                        <p className="diseaseDetailSubtitle">{diseaseName}</p>
                    </div>
                    <div className="diseaseDetailImageWrap">
                        {showImageFallback ? (
                            <div className="diseaseDetailImageFallback">
                                <span className="diseaseDetailImageBadge">{cropName}</span>
                                <h2 className="diseaseDetailImageFallbackTitle">{article.title}</h2>
                                <p className="diseaseDetailImageFallbackText">
                                    Detailed diagnosis, prevention, and treatment guidance for this crop disease.
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
                        <ul className="diseaseDetailList">
                            {article.symptoms?.map((symptom, index) => (
                                <li key={`${symptom}-${index}`}>{symptom}</li>
                            ))}
                        </ul>
                    </article>

                    <article className="diseaseDetailCard">
                        <h2 className="diseaseDetailCardTitle">Prevention</h2>
                        <ul className="diseaseDetailList">
                            {article.preventionMethods?.map((method, index) => (
                                <li key={`${method}-${index}`}>{method}</li>
                            ))}
                        </ul>
                    </article>
                </section>

                <section className="diseaseDetailTreatment">
                    <h2 className="diseaseDetailCardTitle">Treatment Plan</h2>
                    <p className="diseaseDetailTreatmentText">{article.treatmentPlan}</p>
                </section>
            </div>
        </div>
    );
}
