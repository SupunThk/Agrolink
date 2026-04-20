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
    description: "",
    symptoms: "",
    preventionMethods: "",
    treatmentPlan: "",
};

function mapArticleToForm(article) {
    return {
        cropName: article?.diseaseId?.cropId?.name || "",
        diseaseName: article?.diseaseId?.diseaseName || "",
        title: article?.title || "",
        description: article?.description || "",
        symptoms: article?.symptoms?.join("\n") || "",
        preventionMethods: article?.preventionMethods?.join("\n") || "",
        treatmentPlan: article?.treatmentPlan || "",
    };
}

export default function AdminDiseaseEdit() {
    const { id } = useParams();
    const { user } = useContext(Context);
    const navigate = useNavigate();
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [cropOptions, setCropOptions] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [currentImageUrl, setCurrentImageUrl] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

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

    useEffect(() => {
        const fetchArticle = async () => {
            setLoading(true);
            setErrorMessage("");

            try {
                const res = await axios.get(`/knowledge/${id}`);
                setFormData(mapArticleToForm(res.data));
                setCurrentImageUrl(res.data.imageUrl || "");
            } catch (err) {
                setErrorMessage(err.response?.data?.message || "Unable to load this disease profile.");
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
    }, [id]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((current) => ({ ...current, [name]: value }));
        setFieldErrors((current) => ({ ...current, [name]: "" }));
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0] || null;
        setImageFile(file);
        setFieldErrors((current) => ({ ...current, image: "" }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationErrors = validateKnowledgeSubmission(formData, imageFile);
        if (Object.keys(validationErrors).length > 0) {
            setFieldErrors(validationErrors);
            setErrorMessage("Please fix the highlighted fields before saving.");
            setSuccessMessage("");
            return;
        }

        setSubmitting(true);
        setSuccessMessage("");
        setErrorMessage("");

        try {
            const payload = new FormData();
            payload.append("cropName", formData.cropName);
            payload.append("diseaseName", formData.diseaseName);
            payload.append("title", formData.title);
            payload.append("description", formData.description);
            payload.append("symptoms", formData.symptoms);
            payload.append("preventionMethods", formData.preventionMethods);
            payload.append("treatmentPlan", formData.treatmentPlan);
            payload.append("imageUrl", currentImageUrl);
            payload.append("userId", user._id);

            if (imageFile) {
                payload.append("image", imageFile);
            }

            const res = await axios.put(`/knowledge/admin/${id}`, payload, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setSuccessMessage("Crop disease profile updated successfully.");
            navigate(`/disease-detail/${res.data.article._id}`);
        } catch (err) {
            setFieldErrors(err.response?.data?.errors || {});
            setErrorMessage(err.response?.data?.message || "Unable to update this disease profile right now.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!user) {
        return (
            <div className="about fadeIn">
                <p className="kbEmpty">
                    Please log in as an admin to manage crop disease profiles.{" "}
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
                    <h1 className="kbHeading">Edit Disease Profile</h1>
                    <p className="kbSubheading">Update public crop disease information without changing any code.</p>
                </div>
                <div className="kbHeroActions">
                    <Link className="kbSecondaryButton" to={`/disease-detail/${id}`}>
                        Back to Disease Profile
                    </Link>
                </div>
            </div>

            {loading ? (
                <p className="kbEmpty">Loading disease profile...</p>
            ) : (
                <div className="kbFormShell">
                    <KnowledgeSubmissionForm
                        formData={formData}
                        cropOptions={cropOptions}
                        fieldErrors={fieldErrors}
                        onChange={handleChange}
                        onFileChange={handleFileChange}
                        onSubmit={handleSubmit}
                        submitting={submitting}
                        submitLabel="Save Disease Profile"
                        successMessage={successMessage}
                        errorMessage={errorMessage}
                        selectedImageName={imageFile?.name || ""}
                    />
                </div>
            )}
        </div>
    );
}
