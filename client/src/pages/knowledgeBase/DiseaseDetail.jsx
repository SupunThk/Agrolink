import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import "./DiseaseDetail.css";
import { getKnowledgeImage } from "./knowledgeImageResolver";

function InfoState({ title, message }) {
    return (
        <div className="diseaseDetailState">
            <h1 className="diseaseDetailStateTitle">{title}</h1>
            <p className="diseaseDetailStateText">{message}</p>
            <Link to="/knowledge" className="diseaseDetailBackButton">
                Back to Crop Disease Information Portal
            </Link>
        </div>
    );
}

export default function DiseaseDetail() {
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    const [relatedArticles, setRelatedArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notFound, setNotFound] = useState(false);
    const [imageFailed, setImageFailed] = useState(false);
    const [relatedImageFailures, setRelatedImageFailures] = useState({});

    useEffect(() => {
        const fetchArticle = async () => {
            setLoading(true);
            setError("");
            setNotFound(false);
            setImageFailed(false);
            setRelatedImageFailures({});

            try {
                const [articleRes, relatedRes] = await Promise.all([
                    axios.get(`/knowledge/${id}`),
                    axios.get(`/knowledge/${id}/related`),
                ]);

                setArticle(articleRes.data);
                setRelatedArticles(relatedRes.data || []);
            } catch (err) {
                if (err.response?.status === 404) {
                    setNotFound(true);
                } else {
                    setError("Unable to load this crop disease article right now.");
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
                </div>
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="about fadeIn">
                <InfoState title="Article not found" message="This crop disease article could not be found." />
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

    const cropName = article?.diseaseId?.cropId?.name || "Unknown Crop";
    const diseaseName = article?.diseaseId?.diseaseName || "Disease";
    const heroImage = getKnowledgeImage(article);
    const showImageFallback = !heroImage || imageFailed;

    return (
        <div className="about fadeIn">
            <div className="diseaseDetailPage">
                <Link to="/knowledge" className="diseaseDetailBackButton">
                    Back to Crop Disease Information Portal
                </Link>

                <section className="diseaseDetailHero">
                    <div className="diseaseDetailHeroContent">
                        <span className="diseaseDetailPill">{cropName}</span>
                        <h1 className="diseaseDetailTitle">{article.title}</h1>
                        <p className="diseaseDetailSubtitle">{diseaseName}</p>
                        <p className="diseaseDetailDescription">{article.description}</p>
                    </div>
                    <div className="diseaseDetailImageWrap">
                        {showImageFallback ? (
                            <div className="diseaseDetailImageFallback">
                                <span className="diseaseDetailImageBadge">{cropName}</span>
                                <h2 className="diseaseDetailImageFallbackTitle">{article.title}</h2>
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
                    <h2 className="diseaseDetailCardTitle">Treatment</h2>
                    <p className="diseaseDetailTreatmentText">{article.treatmentPlan}</p>
                </section>

                <section className="diseaseDetailRelatedSection">
                    <div className="diseaseDetailSectionHeading">
                        <span className="diseaseDetailRelatedEyebrow">Same Crop</span>
                        <h2 className="diseaseDetailCardTitle">Related Diseases</h2>
                    </div>

                    {relatedArticles.length === 0 ? (
                        <p className="diseaseDetailStateText">No related diseases were found for this crop.</p>
                    ) : (
                        <div className="diseaseDetailRelatedGrid">
                            {relatedArticles.map((relatedArticle) => (
                                <article className="diseaseDetailRelatedCard" key={relatedArticle._id}>
                                    <div className="diseaseDetailRelatedTop">
                                        {getKnowledgeImage(relatedArticle) && !relatedImageFailures[relatedArticle._id] ? (
                                            <img
                                                className="diseaseDetailRelatedImage"
                                                src={getKnowledgeImage(relatedArticle)}
                                                alt={relatedArticle.title}
                                                onError={() =>
                                                    setRelatedImageFailures((current) => ({
                                                        ...current,
                                                        [relatedArticle._id]: true,
                                                    }))
                                                }
                                            />
                                        ) : (
                                            <div className="diseaseDetailRelatedFallback">
                                                <span className="diseaseDetailImageBadge">
                                                    {relatedArticle.diseaseId?.cropId?.name || "Crop Disease"}
                                                </span>
                                                <h3 className="diseaseDetailRelatedFallbackTitle">{relatedArticle.title}</h3>
                                            </div>
                                        )}
                                    </div>
                                    <div className="diseaseDetailRelatedBody">
                                        <h3 className="diseaseDetailRelatedTitle">{relatedArticle.title}</h3>
                                        <p className="diseaseDetailRelatedText">{relatedArticle.description}</p>
                                        <Link to={`/disease-detail/${relatedArticle._id}`} className="diseaseDetailRelatedLink">
                                            View Details
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
