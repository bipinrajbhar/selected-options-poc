const axios = require("axios");

exports.handler = async function (event, context) {
  // Enable CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
  };

  // Handle preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  try {
    const { productId } = event.queryStringParameters || {};

    if (!productId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Product ID is required" }),
      };
    }

    const response = await axios.get(
      `http://44.197.228.204:5000/ng-all-options?productId=${productId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error("Error fetching options:", error);

    return {
      statusCode: error.response?.status || 500,
      headers,
      body: JSON.stringify({
        error: "Failed to fetch options",
        details: error.message,
      }),
    };
  }
};
