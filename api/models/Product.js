const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
    {
        crop_name: {
            type: String,
            required: true,
        },
        category_id: {
            type: String,
            required: true,
        },
        quantity: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        location: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        seller_id: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            default: "Pending",
        },
        image_url: {
            type: String,
            required: false,
        },
        phone: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
