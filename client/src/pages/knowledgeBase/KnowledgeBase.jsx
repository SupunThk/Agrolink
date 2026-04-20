import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./knowledgeBase.css";
import { Link } from "react-router-dom";
import { Context } from "../../context/Context";
import { getKnowledgeImage } from "./knowledgeImageResolver";
import { fetchKnowledgeCropOptions } from "./knowledgeCropOptions";

function groupArticlesByCrop(articles) {
    return articles.reduce((groups, article) => {
        const cropName = article.diseaseId?.cropId?.name || "Other";

        if (!groups[cropName]) {
            groups[cropName] = [];
        }

        groups[cropName].push(article);
        return groups;
    }, {});
}

export default function KnowledgeBase() {
    const { user } = useContext(Context);
    const PAGE_SIZE = 6;
    const [articles, setArticles] = useState([]);
    const [cropOptions, setCropOptions] = useState(["All"]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [emptyMessage, setEmptyMessage] = useState("No approved crop disease articles are available yet.");
    const [imageFailures, setImageFailures] = useState({});
    const [selectedCrop, setSelectedCrop] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        const fetchKnowledgeBase = async () => {
            setLoading(true);
            setError("");
            setImageFailures({});

            try {
                const [cropRes, articleRes] = await Promise.all([
                    fetchKnowledgeCropOptions(),
                    axios.get("/knowledge", {
                        params: {
                            search: searchQuery.trim(),
                            crop: selectedCrop,
                        },
                    }),
                ]);

                setCropOptions(["All", ...cropRes]);
                setArticles(articleRes.data.articles || []);
                setEmptyMessage(articleRes.data.emptyMessage || "No approved crop disease articles are available yet.");
                setTotalCount(articleRes.data.totalCount || 0);
            } catch (err) {
                console.error("Error fetching knowledge base:", err);
                setError("Unable to load the crop disease information portal right now. Please make sure the backend server is running.");
            } finally {
                setLoading(false);
            }
        };

        fetchKnowledgeBase();
    }, [searchQuery, selectedCrop]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [currentPage, searchQuery, selectedCrop]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedCrop]);

    const totalPages = Math.max(Math.ceil(articles.length / PAGE_SIZE), 1);
    const pageNumbers = useMemo(() => Array.from({ length: totalPages }, (_, index) => index + 1), [totalPages]);
    const paginatedArticles = useMemo(() => {
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        return articles.slice(startIndex, startIndex + PAGE_SIZE);
    }, [articles, currentPage]);
    const groupedArticles = useMemo(() => groupArticlesByCrop(paginatedArticles), [paginatedArticles]);
    const cropSections = useMemo(
        () => Object.entries(groupedArticles).sort(([cropA], [cropB]) => cropA.localeCompare(cropB)),
        [groupedArticles]
    );

    return (
        <div className="about fadeIn">
            <div className="kbHero">
                <div className="kbHeroCopy">
                    <h1 className="kbHeading">Crop Disease Information Portal</h1>
                </div>
                <div className="kbHeroActions">
                    {user && (
                        <Link className="kbSecondaryButton" to="/my-knowledge-submissions">
                            My Submissions
                        </Link>
                    )}
                    {user?.isAdmin ? (
                        <>
                            <Link className="kbSecondaryButton" to="/knowledge-review">
                                Review Submissions
                            </Link>
                            <Link className="kbSecondaryButton" to="/knowledge/admin/new">
                                Add Approved Disease
                            </Link>
                        </>
                    ) : null}
                    <Link className="kbAddButton" to="/add-disease">
                        + Add New Disease
                    </Link>
                </div>
            </div>

            <div className="kbToolbar">
                <div className="kbSearchWrapper">
                    <label className="kbFilterLabel" htmlFor="kb-search">
                        Search diseases or crops
                    </label>
                    <div className="kbSearchField">
                        <span className="kbSearchIcon" aria-hidden="true">
                            🔍
                        </span>
                        <input
                            id="kb-search"
                            type="text"
                            className="kbSearchInput"
                            placeholder="Search by disease name or crop name"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="kbSelectWrapper">
                    <label className="kbFilterLabel" htmlFor="kb-crop-filter">
                        Filter by crop
                    </label>
                    <select
                        id="kb-crop-filter"
                        className="kbSelect"
                        value={selectedCrop}
                        onChange={(e) => setSelectedCrop(e.target.value)}
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
                <div className="kbCropSection">
                    <div className="kbCropGrid">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <article className="kbCard kbSkeletonCard" key={`kb-skeleton-${index}`}>
                                <div className="kbCardMedia kbSkeletonBlock"></div>
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
                </div>
            ) : error ? (
                <p className="kbEmpty">{error}</p>
            ) : articles.length === 0 ? (
                <p className="kbEmpty">
                    {searchQuery.trim() || selectedCrop !== "All"
                        ? "No diseases found for your search"
                        : emptyMessage}
                </p>
            ) : (
                <div className="kbSections">
                    {cropSections.map(([cropName, cropArticles]) => (
                        <section className="kbCropSection" key={cropName}>
                            <div className="kbCropHeader">
                                <div>
                                    <p className="kbCropEyebrow">{cropName}</p>
                                    <h2 className="kbCropTitle">{cropName} Diseases</h2>
                                </div>
                            </div>

                            <div className="kbCropGrid">
                                {cropArticles.map((article) => (
                                    <article className="kbCard" key={article._id}>
                                        <div className="kbCardMedia">
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
                                                    <span className="kbImgFallbackBadge">{cropName}</span>
                                                    <h3 className="kbImgFallbackTitle">{article.title}</h3>
                                                </div>
                                            )}
                                        </div>

                                        <div className="kbCardInfo">
                                            <span className="kbCropPill">{cropName}</span>
                                            <h3 className="kbCardTitle">{article.title}</h3>
                                            <p className="kbCardSummary">{article.description}</p>

                                            <div className="kbCardBottom">
                                                <Link to={`/disease-detail/${article._id}`} className="kbReadMore">
                                                    View Details
                                                </Link>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>
                    ))}

                    {articles.length > PAGE_SIZE ? (
                        <nav className="kbPagination" aria-label="Crop disease information portal pagination">
                            <button
                                type="button"
                                className="kbPaginationButton"
                                onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>

                            <div className="kbPaginationNumbers">
                                {pageNumbers.map((pageNumber) => (
                                    <button
                                        key={pageNumber}
                                        type="button"
                                        className={`kbPaginationNumber${pageNumber === currentPage ? " active" : ""}`}
                                        onClick={() => setCurrentPage(pageNumber)}
                                        aria-current={pageNumber === currentPage ? "page" : undefined}
                                    >
                                        {pageNumber}
                                    </button>
                                ))}
                            </div>

                            <button
                                type="button"
                                className="kbPaginationButton"
                                onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </nav>
                    ) : null}

                    {totalCount > 0 ? <p className="kbResultsCount">{totalCount} disease profiles found</p> : null}
                </div>
            )}
        </div>
    );
}
