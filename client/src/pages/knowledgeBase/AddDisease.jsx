import { useContext, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Context } from "../../context/Context";
import KnowledgeSubmissionForm from "./KnowledgeSubmissionForm";
import { validateKnowledgeSubmission } from "./submissionValidation";
import "./knowledgeBase.css";

const INITIAL_FORM = {
    cropName: "",
    diseaseName: "",
    title: "",
    symptoms: "",
    preventionMethods: "",
    treatmentPlan: "",
    imageUrl: "",
};

export default function AddDisease() {
    const { user } = useContext(Context);
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [fieldErrors, setFieldErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((current) => ({ ...current, [name]: value }));
        setFieldErrors((current) => ({ ...current, [name]: "" }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!user?._id) {
            setErrorMessage("Please log in to submit a disease for review.");
            return;
        }

        const validationErrors = validateKnowledgeSubmission(formData);
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
            await axios.post("/knowledge", {
                ...formData,
                userId: user._id,
            });
            setSuccessMessage("Submitted for admin review.");
            setFieldErrors({});
            setFormData(INITIAL_FORM);
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
                        Share crop disease knowledge for admin review using the same structured format as the public knowledge base.
                    </p>
                </div>
                <div className="kbHeroActions">
                    <Link className="kbSecondaryButton" to="/my-knowledge-submissions">
                        My Submissions
                    </Link>
                    <Link className="kbSecondaryButton" to="/knowledge">
                        Back to Knowledge Base
                    </Link>
                </div>
            </div>

            <KnowledgeSubmissionForm
                formData={formData}
                fieldErrors={fieldErrors}
                onChange={handleChange}
                onSubmit={handleSubmit}
                submitting={submitting}
                submitLabel="Submit for Review"
                successMessage={successMessage}
                errorMessage={errorMessage}
            />
        </div>
    );
}
