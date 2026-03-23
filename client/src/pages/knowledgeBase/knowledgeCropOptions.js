import axios from "axios";

export async function fetchKnowledgeCropOptions() {
    const res = await axios.get("/knowledge/crops");
    return res.data?.crops || [];
}
