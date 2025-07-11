import axios from "axios";

export async function POST(req) {
  try {
    const body = await req.json(); // Parse request body

    // Base URL from environment variables (or fallback to localhost)https://divorce-bot-backend.nllnwr.easypanel.host
    const API_BASE_URL = "https://housing-backend.nllnwr.easypanel.host";

    // Determine the correct Flask endpoint based on the collection name
    const collectionName = body.collection_name;
    let flaskEndpoint = `${API_BASE_URL}/answer_in_general`; // Default endpoint

    if (["housing","housing_new_index", "inheritance", "LandAcquisition", "MPdata"].includes(collectionName)) {
      flaskEndpoint = `${API_BASE_URL}/answer_in_specific`;
    } 
    // else if (collectionName === "general") {
    //   flaskEndpoint = `${API_BASE_URL}/answer_in_general`;
    // }

    // Send request to Flask backend
    const response = await axios.post(flaskEndpoint, body);

    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in Next.js API:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

