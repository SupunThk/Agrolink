import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Context } from "../../context/Context";
import KnowledgeSubmissionForm from "./KnowledgeSubmissionForm";
import { validateKnowledgeSubmission } from "./submissionValidation";
import { fetchKnowledgeCropOptions } from "./knowledgeCropOptions";
import "./knowledgeBase.css";

const EMPTY_FORM = {
    cropName: "",
    diseaseName: "",
    title: "",
    symptoms: "",
    preventionMethods: "",
    treatmentPlan: "",
};

function mapArticleToForm(article) {
    return {
        cropName: article?.diseaseId?.cropId?.name || "",
        diseaseName: article?.diseaseId?.diseaseName || "",
        title: article?.title || "",
        symptoms: article?.symptoms?.join("\n") || "",
        preventionMethods: article?.preventionMethods?.join("\n") || "",
        treatmentPlan: article?.treatmentPlan || "",
    };
}

export default function EditDiseaseSubmission() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(Context);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [fieldErrors, setFieldErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [cropOptions, setCropOptions] = useState([]);

    useEffect(() => {
        const fetchSubmission = async () => {
            if (!user?._id) {
                setLoading(false);
                setErrorMessage("Please log in to edit your submission.");
                return;
            }

            setLoading(true);
            setErrorMessage("");

            try {
                const res = await axios.get(`/knowledge/mine/${id}?userId=${user._id}`);

                if (res.data.status !== "pending") {
                    setErrorMessage("Only pending submissions can be edited.");
                } else {
                    setFormData(mapArticleToForm(res.data));
                }
            } catch (err) {
                setErrorMessage(
                    err.response?.data?.message || "Unable to load this submission for editing."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchSubmission();
    }, [id, user]);

    useEffect(() => {
        const loadCropOptions = async () => {
            try {
                setCropOptions(await fetchKnowledgeCropOptions());
            } catch (err) {
                console.error("Error fetching knowledge crop options:", err);
            }
        };

        loadCropOptions();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((current) => ({ ...current, [name]: value }));
        setFieldErrors((current) => ({ ...current, [name]: "" }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationErrors = validateKnowledgeSubmission(formData);
        if (Object.keys(validationErrors).length > 0) {
            setFieldErrors(validationErrors);
            setErrorMessage("Please fix the highlighted fields before saving.");
            return;
        }

        setSubmitting(true);
        setSuccessMessage("");
        setErrorMessage("");

        try {
            await axios.put(`/knowledge/mine/${id}`, {
                ...formData,
                userId: user._id,
            });
            setSuccessMessage("Pending submission updated successfully.");
            navigate(`/my-knowledge-submissions/${id}`);
        } catch (err) {
            setFieldErrors(err.response?.data?.errors || {});
            setErrorMessage(
                err.response?.data?.message || "Unable to update this submission right now."
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (!user) {
        return (
            <div className="about fadeIn">
                <div className="kbHero">
                    <div>
                        <h1 className="kbHeading">Edit Submission</h1>
                        <p className="kbSubheading">Log in to update your pending disease submission.</p>
                    </div>
                </div>
                <p className="kbEmpty">
                    Please log in to edit your submission.{" "}
                    <Link to="/login" className="kbInlineLink">Go to Login</Link>
                </p>
            </div>
        );
    }

    return (
        <div className="about fadeIn">
            <div className="kbHero">
                <div>
                    <h1 className="kbHeading">Edit Pending Submission</h1>
                    <p className="kbSubheading">
                        Update your pending disease article before it reaches admin review.
                    </p>
                </div>
                <div className="kbHeroActions">
                    <Link className="kbSecondaryButton" to={`/my-knowledge-submissions/${id}`}>
                        Back to Submission
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="kbGrid">
                    <article className="kbCard kbSkeletonCard">
                        <div className="kbCardTop kbSkeletonBlock"></div>
                        <div className="kbCardInfo">
                            <div className="kbSkeletonTitle kbSkeletonBlock"></div>
                            <div className="kbSkeletonText kbSkeletonBlock"></div>
                            <div className="kbSkeletonText short kbSkeletonBlock"></div>
                            <div className="kbSkeletonButton kbSkeletonBlock"></div>
                        </div>
                    </article>
                </div>
            ) : errorMessage && !Object.values(formData).some(Boolean) ? (
                <p className="kbEmpty">{errorMessage}</p>
            ) : (
                <KnowledgeSubmissionForm
                    formData={formData}
                    cropOptions={cropOptions}
                    fieldErrors={fieldErrors}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    submitting={submitting}
                    submitLabel="Save Changes"
                    successMessage={successMessage}
                    errorMessage={errorMessage}
                    showImageUpload={false}
                />
            )}
        </div>
    );
}
