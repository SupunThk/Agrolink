import { useEffect, useState } from "react";
import axios from "axios";
import "./knowledgeBase.css";
import { Link } from "react-router-dom";

const IMAGE_BASE_URL = "http://localhost:5000";

function getSummary(article) {
    const sourceText =
        article.treatmentPlan ||
        article.symptoms?.[0] ||
        "Practical prevention and treatment guidance for this crop disease.";

    return sourceText.length > 120 ? `${sourceText.slice(0, 117)}...` : sourceText;
}

export default function KnowledgeBase() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [imageFailures, setImageFailures] = useState({});
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCrop, setSelectedCrop] = useState("All");

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
        const fetchArticles = async () => {
            setLoading(true);
            setError("");
            setImageFailures({});
            try {
                const res = await axios.get(
                    `/knowledge?search=${encodeURIComponent(searchQuery)}&crop=${encodeURIComponent(selectedCrop)}`
                );
                setArticles(res.data);
            } catch (err) {
                console.error("Error fetching knowledge articles:", err);
                setError("Unable to load the knowledge base right now. Please make sure the backend server and MongoDB are running.");
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, [searchQuery, selectedCrop]);

    return (
        <div className="about fadeIn">
            <div className="kbHero">
                <div>
                    <h1 className="kbHeading">Crop Disease Knowledge Base</h1>
                    <p className="kbSubheading">
                        Search for diseases or filter by crop type to find management strategies.
                    </p>
                </div>
                <Link className="kbAddButton" to="/add-disease">
                    + Add New Disease
                </Link>
            </div>

            <div className="kbFilterContainer">
                <div className="kbSearchWrapper">
                    <i className="fas fa-search searchIcon"></i>
                    <input
                        type="text"
                        placeholder="Search by disease name..."
                        className="kbSearchInput"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="kbSelectWrapper">
                    <select
                        className="kbSelect"
                        value={selectedCrop}
                        onChange={(e) => setSelectedCrop(e.target.value)}
                    >
                        <option value="All">All Crops</option>
                        <option value="Tomato">Tomato</option>
                        <option value="Rice">Rice</option>
                        <option value="Papaya">Papaya</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="kbLoading">
                    <i className="fas fa-spinner fa-spin"></i> Loading Articles...
                </div>
            ) : error ? (
                <p className="kbEmpty">{error}</p>
            ) : (
                <div className="kbGrid">
                    {articles.length > 0 ? (
                        articles.map((article) => (
                            <article className="kbCard glass-panel" key={article._id}>
                                <div className="kbCardTop">
                                    {getImageSrc(article.imageUrl) && !imageFailures[article._id] ? (
                                        <img
                                            className="kbImg"
                                            src={getImageSrc(article.imageUrl)}
                                            alt={article.title}
                                            onError={() =>
                                                setImageFailures((current) => ({ ...current, [article._id]: true }))
                                            }
                                        />
                                    ) : (
                                        <div className="kbImgFallback">
                                            <span className="kbImgFallbackBadge">
                                                {article.diseaseId?.cropId?.name || "Knowledge"}
                                            </span>
                                            <h3 className="kbImgFallbackTitle">{article.title}</h3>
                                            <p className="kbImgFallbackText">
                                                Practical crop disease guidance with symptoms, prevention, and treatment.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="kbCardInfo">
                                    {article.diseaseId?.cropId?.name && (
                                        <span className="kbCropPill">{article.diseaseId.cropId.name}</span>
                                    )}

                                    <h2 className="kbCardTitle">{article.title}</h2>
                                    <p className="kbCardSummary">{getSummary(article)}</p>

                                    <div className="kbCardBottom">
                                        <Link
                                            to={`/disease-detail/${article._id}`}
                                            className="kbReadMore"
                                        >
                                            Read More
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))
                    ) : (
                        <p className="kbEmpty">No articles found matching your criteria.</p>
                    )}
                </div>
            )}
        </div>
    );
}
