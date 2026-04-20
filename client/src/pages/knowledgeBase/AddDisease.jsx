import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Context } from "../../context/Context";
import KnowledgeSubmissionForm from "./KnowledgeSubmissionForm";
import { validateKnowledgeSubmission } from "./submissionValidation";
import { fetchKnowledgeCropOptions } from "./knowledgeCropOptions";
import "./knowledgeBase.css";

const INITIAL_FORM = {
    cropName: "",
    diseaseName: "",
    title: "",
    symptoms: "",
    preventionMethods: "",
    treatmentPlan: "",
};

export default function AddDisease() {
    const { user } = useContext(Context);
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [imageFile, setImageFile] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [cropOptions, setCropOptions] = useState([]);

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

        if (!user?._id) {
            setErrorMessage("Please log in to submit a disease for review.");
            return;
        }

        const validationErrors = validateKnowledgeSubmission(formData, imageFile);
        if (Object.keys(validationErrors).length > 0) {
            setFieldErrors(validationErrors);
            setErrorMessage("Please fix the highlighted fields before submitting.");
            setSuccessMessage("");
            return;
        }

        setSubmitting(true);
        setSuccessMessage("");
        setErrorMessage("");

        try {
            const payload = new FormData();
            const derivedDescription = formData.symptoms.trim();

            payload.append("cropName", formData.cropName);
            payload.append("diseaseName", formData.diseaseName);
            payload.append("title", formData.title);
            payload.append("description", derivedDescription);
            payload.append("symptoms", formData.symptoms);
            payload.append("preventionMethods", formData.preventionMethods);
            payload.append("treatmentPlan", formData.treatmentPlan);
            payload.append("userId", user._id);

            if (imageFile) {
                payload.append("image", imageFile);
            }

            await axios.post("/knowledge", payload, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setSuccessMessage("Submitted for admin review.");
            setFieldErrors({});
            setFormData(INITIAL_FORM);
            setImageFile(null);
        } catch (err) {
            setFieldErrors(err.response?.data?.errors || {});
            setErrorMessage(
                err.response?.data?.message || "Unable to submit this article right now."
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
                        <h1 className="kbHeading">Submit Disease Information</h1>
                        <p className="kbSubheading">
                            Log in to submit a new disease article for admin review.
                        </p>
                    </div>
                </div>
                <p className="kbEmpty">
                    Please log in to submit a disease for review.{" "}
                    <Link to="/login" className="kbInlineLink">Go to Login</Link>
                </p>
            </div>
        );
    }

    return (
        <div className="about fadeIn">
            <div className="kbHero">
                <div>
                    <h1 className="kbHeading">Submit Disease Information</h1>
                    <p className="kbSubheading">
                        Share crop disease information for admin review using the same structured format as the public information portal.
                    </p>
                </div>
                <div className="kbHeroActions">
                    <Link className="kbSecondaryButton" to="/my-knowledge-submissions">
                        My Submissions
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
                    submitLabel="Submit for Review"
                    successMessage={successMessage}
                    errorMessage={errorMessage}
                    selectedImageName={imageFile?.name || ""}
                />
            </div>
        </div>
    );
}
