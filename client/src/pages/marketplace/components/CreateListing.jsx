import React, { useState, useContext } from "react";
import axios from "axios";
import { Context } from "../../../context/Context";
import "./createListing.css";

export default function CreateListing({ setActiveTab, initialProduct }) {
    const [cropName, setCropName] = useState(initialProduct ? initialProduct.crop_name : "");
    const [categoryId, setCategoryId] = useState(initialProduct ? initialProduct.category_id : "");
    const [quantity, setQuantity] = useState(initialProduct ? initialProduct.quantity : "");
    const [price, setPrice] = useState(initialProduct ? initialProduct.price : "");
    const [location, setLocation] = useState(initialProduct ? initialProduct.location : "");
    const [phone, setPhone] = useState(initialProduct ? initialProduct.phone || "" : "");
    const [description, setDescription] = useState(initialProduct ? initialProduct.description : "");
    const [file, setFile] = useState(null);
    const [customCategory, setCustomCategory] = useState("");
    // Predefined categories
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Validation error states
    const [fileError, setFileError] = useState("");
    const [cropNameError, setCropNameError] = useState("");
    const [categoryError, setCategoryError] = useState("");
    const [priceError, setPriceError] = useState("");
    const [quantityError, setQuantityError] = useState("");
    const [locationError, setLocationError] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [descriptionError, setDescriptionError] = useState("");

    const { user } = useContext(Context);

    const agricultureCategories = [
        "Vegetables",
        "Fruits",
        "Grains & Cereals",
        "Pulses & Legumes",
        "Spices & Herbs",
        "Cash Crops",
        "Leafy Greens",
        "Root & Tubers",
        "Seeds & Seedlings",
        "Organic Produce",
        "Other (Specify)"
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        setError(null);
        setFileError("");
        setCropNameError("");
        setCategoryError("");
        setPriceError("");
        setQuantityError("");
        setLocationError("");
        setPhoneError("");
        setDescriptionError("");

        let isValid = true;

        if (!file && !initialProduct?.image_url) {
            setFileError("An image is required.");
            isValid = false;
        }

        if (cropName.trim().length < 3) {
            setCropNameError("Crop name must be at least 3 characters.");
            isValid = false;
        }

        if (!categoryId) {
            setCategoryError("Please select a category.");
            isValid = false;
        } else if (categoryId === "Other (Specify)" && customCategory.trim() === "") {
            setCategoryError("Please specify your custom category.");
            isValid = false;
        }

        if (Number(price) <= 0) {
            setPriceError("Price must be a positive number.");
            isValid = false;
        }

        if (quantity === "") {
            setQuantityError("Quantity is required.");
            isValid = false;
        } else {
            const num = parseFloat(quantity);
            if (!isNaN(num) && num <= 0) {
                setQuantityError("Quantity must be a positive number.");
                isValid = false;
            }
        }

        if (location.trim() === "") {
             setLocationError("Location is required.");
             isValid = false;
        }

        const cleanPhone = phone.replace(/[-.\s]/g, "");
        const slPhoneRegex = /^0[1-9]\d{8}$/;
        if (!slPhoneRegex.test(cleanPhone) || /(.)\1{6,}/.test(cleanPhone) || /456789/.test(cleanPhone)) {
            setPhoneError("Please enter a valid and real phone number (e.g., 0716615672)");
            isValid = false;
        }

        if (description.trim().length < 10) {
            setDescriptionError("Description must be at least 10 characters.");
            isValid = false;
        }

        if (!isValid) return;

        setLoading(true);

        if (!user) {
            setError("User is not logged in");
            setLoading(false);
            console.error("User is not logged in");
            return;
        }

        const finalCategory = categoryId === "Other (Specify)" ? customCategory : categoryId;

        const newProduct = {
            crop_name: cropName,
            category_id: finalCategory,
            quantity,
            price,
            location,
            phone,
            description,
            username: user.username, // for validation in backend
            seller_id: user.username,
        };

        if (file) {
            const data = new FormData();
            const filename = Date.now() + file.name;
            data.append("name", filename);
            data.append("file", file);
            try {
                const uploadRes = await axios.post("/upload", data);
                // Assuming uploadRes.data.url contains the Cloudinary URL
                newProduct.image_url = uploadRes.data.url || uploadRes.data;
            } catch (err) {
                console.log(err);
                setError(err.response?.data?.message || err.response?.data || err.message || "Image upload failed");
                setLoading(false);
                return;
            }
        } else if (initialProduct && initialProduct.image_url) {
            newProduct.image_url = initialProduct.image_url;
        }

        try {
            if (initialProduct) {
                await axios.put(`/products/${initialProduct._id}`, newProduct);
            } else {
                await axios.post("/products", newProduct);
            }
            setLoading(false);
            setActiveTab("listings"); // redirect back to listings
        } catch (err) {
            console.error("API error:", err);
            setError(err.response?.data?.message || err.response?.data || err.message || "Something went wrong!");
            setLoading(false);
        }
    };

    return (
        <div className="createListing">
            <form className="createListingForm" onSubmit={handleSubmit}>
                <div className="createListingGroup">
                    {file ? (
                        <img className="createListingImg" src={URL.createObjectURL(file)} alt="" />
                    ) : initialProduct?.image_url ? (
                        <img className="createListingImg" src={initialProduct.image_url} alt="" />
                    ) : null}
                    <label htmlFor="fileInput">
                        <i className="createListingIcon fas fa-plus"></i> Add Image
                    </label>
                    <input
                        type="file"
                        id="fileInput"
                        style={{ display: "none" }}
                        accept="image/*"
                        onChange={(e) => {
                            const selectedFile = e.target.files[0];
                            if (selectedFile) {
                                if (!selectedFile.type.startsWith("image/")) {
                                    setFileError("Only image files are allowed! Please select a valid image.");
                                    setFile(null);
                                    e.target.value = null;
                                } else {
                                    setFile(selectedFile);
                                    setFileError("");
                                }
                            }
                        }}
                    />
                    {fileError && <span style={{ color: "red", fontSize: "14px", marginTop: "5px", alignSelf: "flex-start", width: "100%" }}>{fileError}</span>}
                </div>

                <div className="createListingGroup" style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                    <label className="createListingLabel">Crop Name</label>
                    <input
                        type="text"
                        placeholder="Crop Name (e.g., Organic Tomatoes)"
                        className="createListingInput"
                        autoFocus={true}
                        required
                        value={cropName}
                        onChange={(e) => {
                            setCropName(e.target.value);
                            setCropNameError("");
                        }}
                        onBlur={() => {
                            if (cropName.trim().length > 0 && cropName.trim().length < 3) {
                                setCropNameError("Crop name must be at least 3 characters.");
                            }
                        }}
                    />
                    {cropNameError && <span style={{ color: "red", fontSize: "14px", marginTop: "5px", alignSelf: "flex-start" }}>{cropNameError}</span>}
                </div>

                <div className="createListingGroup split">
                    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                        <label className="createListingLabel">Category</label>
                        <select
                            className="createListingInput selectCategory"
                            value={categoryId}
                            onChange={(e) => {
                                setCategoryId(e.target.value);
                                setCategoryError("");
                            }}
                            required
                        >
                            <option value="" disabled>Select a Category...</option>
                            {agricultureCategories.map((cat, index) => (
                                <option key={index} value={cat}>{cat}</option>
                            ))}
                        </select>
                        {categoryId === "Other (Specify)" && (
                            <>
                                <label className="createListingLabel" style={{ marginTop: "10px" }}>Specify Category</label>
                                <input
                                    type="text"
                                placeholder="Please specify your category"
                                className="createListingInput"
                                required
                                value={customCategory}
                                onChange={(e) => {
                                    setCustomCategory(e.target.value);
                                    setCategoryError("");
                                }}
                                onBlur={() => {
                                    if (categoryId === "Other (Specify)" && customCategory.trim() === "") {
                                        setCategoryError("Please specify your custom category.");
                                    }
                                }}
                                style={{ marginTop: "10px" }}
                            />
                            </>
                        )}
                        {categoryError && <span style={{ color: "red", fontSize: "14px", marginTop: "5px", alignSelf: "flex-start" }}>{categoryError}</span>}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                        <label className="createListingLabel">Price (Rs)</label>
                        <input
                            type="number"
                            placeholder="Price (Rs)"
                            className="createListingInput"
                            required
                            value={price}
                            onChange={(e) => {
                                setPrice(e.target.value);
                                setPriceError("");
                            }}
                            onBlur={() => {
                                if (price !== "" && Number(price) <= 0) {
                                    setPriceError("Price must be a positive number.");
                                }
                            }}
                        />
                        {priceError && <span style={{ color: "red", fontSize: "14px", marginTop: "5px", alignSelf: "flex-start" }}>{priceError}</span>}
                    </div>
                </div>

                <div className="createListingGroup split">
                    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                        <label className="createListingLabel">Quantity</label>
                        <input
                            type="number"
                            placeholder="Quantity (e.g., 50)"
                            className="createListingInput"
                            required
                            value={quantity}
                            onChange={(e) => {
                                setQuantity(e.target.value);
                                setQuantityError("");
                            }}
                            onBlur={() => {
                                if (quantity !== "") {
                                    const num = parseFloat(quantity);
                                    if (!isNaN(num) && num <= 0) {
                                        setQuantityError("Quantity must be a positive number.");
                                    }
                                }
                            }}
                        />
                        {quantityError && <span style={{ color: "red", fontSize: "14px", marginTop: "5px", alignSelf: "flex-start" }}>{quantityError}</span>}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                        <label className="createListingLabel">Location</label>
                        <input
                            type="text"
                            placeholder="Location"
                            className="createListingInput"
                            required
                            value={location}
                            onChange={(e) => {
                                setLocation(e.target.value);
                                setLocationError("");
                            }}
                        />
                        {locationError && <span style={{ color: "red", fontSize: "14px", marginTop: "5px", alignSelf: "flex-start" }}>{locationError}</span>}
                    </div>
                </div>

                <div className="createListingGroup" style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                    <label className="createListingLabel">Phone Number</label>
                    <input
                        type="tel"
                        placeholder="Phone Number (e.g., 0716615672)"
                        className="createListingInput"
                        required
                        value={phone}
                        onChange={(e) => {
                            setPhone(e.target.value);
                            setPhoneError("");
                        }}
                        onBlur={() => {
                            if (phone.trim().length > 0) {
                                const cleanPhone = phone.replace(/[-.\s]/g, "");
                                const slPhoneRegex = /^0[1-9]\d{8}$/;
                                if (!slPhoneRegex.test(cleanPhone) || /(.)\1{6,}/.test(cleanPhone) || /456789/.test(cleanPhone)) {
                                    setPhoneError("Please enter a valid and real phone number (e.g., 0716615672)");
                                }
                            }
                        }}
                    />
                    {phoneError && <span style={{ color: "red", fontSize: "14px", marginTop: "5px", alignSelf: "flex-start" }}>{phoneError}</span>}
                </div>

                <div className="createListingGroup" style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                    <label className="createListingLabel">Description</label>
                    <textarea
                        placeholder="Describe your product..."
                        type="text"
                        className="createListingInput createListingText"
                        required
                        value={description}
                        onChange={(e) => {
                            setDescription(e.target.value);
                            setDescriptionError("");
                        }}
                        onBlur={() => {
                            if (description.trim().length > 0 && description.trim().length < 10) {
                                setDescriptionError("Description must be at least 10 characters.");
                            }
                        }}
                    ></textarea>
                    {descriptionError && <span style={{ color: "red", fontSize: "14px", marginTop: "5px", alignSelf: "flex-start" }}>{descriptionError}</span>}
                </div>

                <button className="createListingSubmit" type="submit" disabled={loading}>
                    {loading ? (initialProduct ? "Updating..." : "Publishing...") : (initialProduct ? "Update Listing" : "Publish Listing")}
                </button>
                {error && <span className="createListingError" style={{color: 'red', marginTop: '10px'}}>{typeof error === 'string' ? error : "Something went wrong!"}</span>}
            </form>
        </div>
    );
}
