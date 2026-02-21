const mongoose = require("mongoose");

const CategoySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
    },
    {timestamps: true}
);


module.exports = mongoose.model("Categoy", CategoySchema);