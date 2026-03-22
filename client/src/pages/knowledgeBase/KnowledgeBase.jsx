import { useContext, useEffect, useState } from "react";
import axios from "axios";
import "./knowledgeBase.css";
import { Link } from "react-router-dom";
import { Context } from "../../context/Context";
import { getKnowledgeImage } from "./knowledgeImageResolver";

function getSummary(article) {
    const sourceText =
        article.treatmentPlan ||
        article.symptoms?.[0] ||
        "Practical prevention and treatment guidance for this crop disease.";

    return sourceText.length > 120 ? `${sourceText.slice(0, 117)}...` : sourceText;
}

export default function KnowledgeBase() {
    const { user } = useContext(Context);
    const [articles, setArticles] = useState([]);
    const [cropOptions, setCropOptions] = useState(["All"]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [emptyMessage, setEmptyMessage] = useState("No approved knowledge articles are available yet.");
    const [imageFailures, setImageFailures] = useState({});
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCrop, setSelectedCrop] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const PAGE_SIZE = 6;

    useEffect(() => {
        const fetchCropOptions = async () => {
            try {
                const res = await axios.get("/knowledge/crops");
                setCropOptions(["All", ...(res.data.crops || [])]);
            } catch (err) {
                console.error("Error fetching crop options:", err);
            }
        };

        fetchCropOptions();
    }, []);

    useEffect(() => {
        const fetchArticles = async () => {
            setLoading(true);
            setError("");
            setImageFailures({});
            try {
                const res = await axios.get(
                    `/knowledge?search=${encodeURIComponent(searchQuery)}&crop=${encodeURIComponent(selectedCrop)}&page=${currentPage}&limit=${PAGE_SIZE}`
                );
                setArticles(res.data.articles || []);
                setEmptyMessage(res.data.emptyMessage || "No approved knowledge articles are available yet.");
                setTotalPages(res.data.totalPages || 0);
                setTotalCount(res.data.totalCount || 0);
            } catch (err) {
                console.error("Error fetching knowledge articles:", err);
                setError("Unable to load the knowledge base right now. Please make sure the backend server and MongoDB are running.");
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, [searchQuery, selectedCrop, currentPage]);

    return (
        <div className="about fadeIn">
            <div className="kbHero">
                <div>
                    <h1 className="kbHeading">Crop Disease Knowledge Base</h1>
                    <p className="kbSubheading">
                        Search for diseases or filter by crop type to find management strategies.
                    </p>
                </div>
                <div className="kbHeroActions">
                    {user && (
                        <Link className="kbSecondaryButton" to="/my-knowledge-submissions">
                            My Submissions
                        </Link>
                    )}
                    <Link className="kbAddButton" to="/add-disease">
                        + Add New Disease
                    </Link>
                </div>
            </div>

            <div className="kbFilterContainer">
                <div className="kbSearchWrapper">
                    <i className="fas fa-search searchIcon"></i>
                    <input
                        type="text"
                        placeholder="Search by disease name..."
                        className="kbSearchInput"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
                <div className="kbSelectWrapper">
                    <select
                        className="kbSelect"
                        value={selectedCrop}
                        onChange={(e) => {
                            setSelectedCrop(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        {cropOptions.map((crop) => (
                            <option key={crop} value={crop}>
                                {crop === "All" ? "All Crops" : crop}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="kbGrid">
                    {Array.from({ length: PAGE_SIZE }).map((_, index) => (
                        <article className="kbCard kbSkeletonCard" key={`kb-skeleton-${index}`}>
                            <div className="kbCardTop kbSkeletonBlock"></div>
                            <div className="kbCardInfo">
                                <div className="kbSkeletonPill kbSkeletonBlock"></div>
                                <div className="kbSkeletonTitle kbSkeletonBlock"></div>
                                <div className="kbSkeletonText kbSkeletonBlock"></div>
                                <div className="kbSkeletonText short kbSkeletonBlock"></div>
                                <div className="kbCardBottom">
                                    <div className="kbSkeletonButton kbSkeletonBlock"></div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            ) : error ? (
                <p className="kbEmpty">{error}</p>
            ) : (
                <div className="kbGrid">
                    {articles.length > 0 ? (
                        <>
                            {articles.map((article) => (
                                <article className="kbCard glass-panel" key={article._id}>
                                    <div className="kbCardTop">
                                        {getKnowledgeImage(article) && !imageFailures[article._id] ? (
                                            <img
                                                className="kbImg"
                                                src={getKnowledgeImage(article)}
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
                            ))}
                            {totalPages > 1 ? (
                                <div className="kbPagination">
                                    <button
                                        type="button"
                                        className="kbPaginationButton"
                                        onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </button>
                                    <span className="kbPaginationInfo">
                                        Page {currentPage} of {totalPages} | {totalCount} article{totalCount === 1 ? "" : "s"}
                                    </span>
                                    <button
                                        type="button"
                                        className="kbPaginationButton"
                                        onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                    </button>
                                </div>
                            ) : null}
                        </>
                    ) : (
                        <p className="kbEmpty">{emptyMessage}</p>
                    )}
                </div>
            )}
        </div>
    );
}
