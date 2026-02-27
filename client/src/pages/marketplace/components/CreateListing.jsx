import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { Context } from "../../../context/Context";
import "./createListing.css";

export default function CreateListing({ setActiveTab }) {
    const [cropName, setCropName] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [quantity, setQuantity] = useState("");
    const [price, setPrice] = useState("");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState(null);
    const [customCategory, setCustomCategory] = useState("");
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

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
        setError(false);
        setLoading(true);

        const finalCategory = categoryId === "Other (Specify)" ? customCategory : categoryId;

        const newProduct = {
            crop_name: cropName,
            category_id: finalCategory,
            quantity,
            price,
            location,
            description,
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
                setError(true);
                setLoading(false);
                return;
            }
        }

        try {
            const res = await axios.post("/products", newProduct);
            setLoading(false);
            setActiveTab("listings"); // redirect back to listings
        } catch (err) {
            setError(true);
            setLoading(false);
        }
    };

    return (
        <div className="createListing">
            <form className="createListingForm" onSubmit={handleSubmit}>
                <div className="createListingGroup">
                    {file && (
                        <img className="createListingImg" src={URL.createObjectURL(file)} alt="" />
                    )}
                    <label htmlFor="fileInput">
                        <i className="createListingIcon fas fa-plus"></i> Add Image
                    </label>
                    <input
                        type="file"
                        id="fileInput"
                        style={{ display: "none" }}
                        onChange={(e) => setFile(e.target.files[0])}
                    />
                </div>

                <div className="createListingGroup">
                    <input
                        type="text"
                        placeholder="Crop Name (e.g., Organic Tomatoes)"
                        className="createListingInput"
                        autoFocus={true}
                        required
                        onChange={(e) => setCropName(e.target.value)}
                    />
                </div>

                <div className="createListingGroup split">
                    <select
                        className="createListingInput selectCategory"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        required
                    >
                        <option value="" disabled>Select a Category...</option>
                        {agricultureCategories.map((cat, index) => (
                            <option key={index} value={cat}>{cat}</option>
                        ))}
                    </select>

                    {categoryId === "Other (Specify)" && (
                        <input
                            type="text"
                            placeholder="Please specify your category"
                            className="createListingInput"
                            required
                            onChange={(e) => setCustomCategory(e.target.value)}
                            style={{ marginTop: "0px" }}
                        />
                    )}

                    <input
                        type="number"
                        placeholder="Price ($)"
                        className="createListingInput"
                        required
                        onChange={(e) => setPrice(e.target.value)}
                    />
                </div>

                <div className="createListingGroup split">
                    <input
                        type="text"
                        placeholder="Quantity (e.g., 50 kg)"
                        className="createListingInput"
                        required
                        onChange={(e) => setQuantity(e.target.value)}
                    />

                    <input
                        type="text"
                        placeholder="Location"
                        className="createListingInput"
                        required
                        onChange={(e) => setLocation(e.target.value)}
                    />
                </div>

                <div className="createListingGroup">
                    <textarea
                        placeholder="Describe your product..."
                        type="text"
                        className="createListingInput createListingText"
                        required
                        onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                </div>

                <button className="createListingSubmit" type="submit" disabled={loading}>
                    {loading ? "Publishing..." : "Publish Listing"}
                </button>
                {error && <span className="createListingError">Something went wrong!</span>}
            </form>
        </div>
    );
}
