import "./knowledgeBase.css";

export default function KnowledgeSubmissionForm({
    formData,
    cropOptions = [],
    fieldErrors,
    onChange,
    onFileChange,
    onSubmit,
    submitting,
    submitLabel,
    successMessage,
    errorMessage,
    showImageUpload = true,
    selectedImageName = "",
}) {
    const getFieldClassName = (fieldName, baseClass = "kbInput") =>
        fieldErrors[fieldName] ? `${baseClass} hasError` : baseClass;

    return (
        <div className="kbFormCard">
            <form className="kbForm" onSubmit={onSubmit} noValidate>
                {successMessage ? <div className="kbMessage success">{successMessage}</div> : null}
                {errorMessage ? <div className="kbMessage error">{errorMessage}</div> : null}

                <div className="kbFormGrid">
                    <div className="kbField">
                        <label className="kbLabel" htmlFor="cropName">Crop Type</label>
                        <select
                            id="cropName"
                            name="cropName"
                            className={getFieldClassName("cropName")}
                            value={formData.cropName}
                            onChange={onChange}
                        >
                            <option value="">Select Crop...</option>
                            {cropOptions.map((crop) => (
                                <option key={crop} value={crop}>{crop}</option>
                            ))}
                        </select>
                        {fieldErrors.cropName ? <p className="kbFieldError">{fieldErrors.cropName}</p> : null}
                    </div>

                    <div className="kbField">
                        <label className="kbLabel" htmlFor="diseaseName">Disease Name</label>
                        <input
                            id="diseaseName"
                            name="diseaseName"
                            type="text"
                            placeholder="e.g. Early Blight"
                            className={getFieldClassName("diseaseName")}
                            value={formData.diseaseName}
                            onChange={onChange}
                        />
                        {fieldErrors.diseaseName ? <p className="kbFieldError">{fieldErrors.diseaseName}</p> : null}
                    </div>
                </div>

                <div className="kbField">
                    <label className="kbLabel" htmlFor="title">Article Title</label>
                    <input
                        id="title"
                        name="title"
                        type="text"
                        placeholder="e.g. Managing Early Blight in Tomato Crops"
                        className={getFieldClassName("title")}
                        value={formData.title}
                        onChange={onChange}
                    />
                    {fieldErrors.title ? <p className="kbFieldError">{fieldErrors.title}</p> : null}
                </div>

                <div className="kbField">
                    <label className="kbLabel" htmlFor="symptoms">Symptoms</label>
                    <textarea
                        id="symptoms"
                        name="symptoms"
                        placeholder="One item per line or comma-separated..."
                        className={getFieldClassName("symptoms", "kbTextarea")}
                        value={formData.symptoms}
                        onChange={onChange}
                    />
                    <p className="kbFieldHint">Add at least 20 characters describing the symptoms.</p>
                    {fieldErrors.symptoms ? <p className="kbFieldError">{fieldErrors.symptoms}</p> : null}
                </div>

                <div className="kbField">
                    <label className="kbLabel" htmlFor="preventionMethods">Prevention Methods</label>
                    <textarea
                        id="preventionMethods"
                        name="preventionMethods"
                        placeholder="One item per line or comma-separated..."
                        className={getFieldClassName("preventionMethods", "kbTextarea")}
                        value={formData.preventionMethods}
                        onChange={onChange}
                    />
                    <p className="kbFieldHint">Add at least 20 characters describing preventive actions.</p>
                    {fieldErrors.preventionMethods ? <p className="kbFieldError">{fieldErrors.preventionMethods}</p> : null}
                </div>

                <div className="kbField">
                    <label className="kbLabel" htmlFor="treatmentPlan">Treatment Plan</label>
                    <textarea
                        id="treatmentPlan"
                        name="treatmentPlan"
                        placeholder="Describe the recommended treatment plan..."
                        className={getFieldClassName("treatmentPlan", "kbTextarea")}
                        value={formData.treatmentPlan}
                        onChange={onChange}
                    />
                    <p className="kbFieldHint">Add at least 20 characters describing the treatment plan.</p>
                    {fieldErrors.treatmentPlan ? <p className="kbFieldError">{fieldErrors.treatmentPlan}</p> : null}
                </div>

                {showImageUpload ? (
                    <div className="kbField">
                        <label className="kbLabel" htmlFor="image">Upload Disease Image</label>
                        <input
                            id="image"
                            name="image"
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp"
                            className={getFieldClassName("image")}
                            onChange={onFileChange}
                        />
                        <p className="kbFieldHint">
                            Accepted formats: JPG, JPEG, PNG, and WEBP.
                            {selectedImageName ? ` Selected: ${selectedImageName}` : ""}
                        </p>
                        {fieldErrors.image ? <p className="kbFieldError">{fieldErrors.image}</p> : null}
                    </div>
                ) : null}

                <button type="submit" className="kbSubmitButton" disabled={submitting}>
                    {submitting ? "Saving..." : submitLabel}
                </button>
            </form>
        </div>
    );
}
