import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../../context/Context";
import KnowledgeSubmissionForm from "./KnowledgeSubmissionForm";
import { validateKnowledgeSubmission } from "./submissionValidation";
import { fetchKnowledgeCropOptions } from "./knowledgeCropOptions";
import "./knowledgeBase.css";

const INITIAL_FORM = {
    cropName: "",
    diseaseName: "",
    title: "",
    description: "",
    symptoms: "",
    preventionMethods: "",
    treatmentPlan: "",
};

function appendFormData(formData, imageFile, userId) {
    const payload = new FormData();
    payload.append("cropName", formData.cropName);
    payload.append("diseaseName", formData.diseaseName);
    payload.append("title", formData.title);
    payload.append("description", formData.description);
    payload.append("symptoms", formData.symptoms);
    payload.append("preventionMethods", formData.preventionMethods);
    payload.append("treatmentPlan", formData.treatmentPlan);
    payload.append("userId", userId);

    if (imageFile) {
        payload.append("image", imageFile);
    }

    return payload;
}

export default function AdminDiseaseCreate() {
    const { user } = useContext(Context);
    const navigate = useNavigate();
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [cropOptions, setCropOptions] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
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
            setErrorMessage("Please fix the highlighted fields before publishing.");
            setSuccessMessage("");
            return;
        }

        setSubmitting(true);
        setSuccessMessage("");
        setErrorMessage("");

        try {
            const payload = appendFormData(formData, imageFile, user._id);
            const res = await axios.post("/knowledge/admin", payload, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setSuccessMessage("Crop disease profile published successfully.");
            navigate(`/disease-detail/${res.data.article._id}`);
        } catch (err) {
            setFieldErrors(err.response?.data?.errors || {});
            setErrorMessage(err.response?.data?.message || "Unable to publish this disease profile right now.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!user) {
        return (
            <div className="about fadeIn">
                <div className="kbPage">
                <p className="kbEmpty">
                    Please log in as an admin to manage crop disease profiles.{" "}
                    <Link to="/login" className="kbInlineLink">Go to Login</Link>
                </p>
                </div>
            </div>
        );
    }

    if (!user.isAdmin) {
        return (
            <div className="about fadeIn">
                <div className="kbPage">
                <p className="kbEmpty">This page is available to admins only.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="about fadeIn">
            <div className="kbPage">
            <div className="kbHero">
                <div>
                    <h1 className="kbHeading">Add Approved Disease Profile</h1>
                    <p className="kbSubheading">Create a public crop disease profile that is immediately available in the information portal.</p>
                </div>
                <div className="kbHeroActions">
                    <Link className="kbSecondaryButton" to="/knowledge-review">
                        Review Submissions
                    </Link>
                    <Link className="kbSecondaryButton" to="/knowledge">
                        Back to Crop Disease Information Portal
                    </Link>
                </div>
            </div>

            <div className="kbFormShell">
                <KnowledgeSubmissionForm
                    formData={formData}
                    cropOptions={cropOptions}
                    fieldErrors={fieldErrors}
                    onChange={handleChange}
                    onFileChange={handleFileChange}
                    onSubmit={handleSubmit}
                    submitting={submitting}
                    submitLabel="Publish Disease Profile"
                    successMessage={successMessage}
                    errorMessage={errorMessage}
                    selectedImageName={imageFile?.name || ""}
                />
            </div>
            </div>
        </div>
    );
}
