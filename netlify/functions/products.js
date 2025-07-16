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
      `https://stg2.rhnonprod.com/rh/api/products/v1?ids=${productId}`,
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
    console.error("Error fetching product:", error);

    return {
      statusCode: error.response?.status || 500,
      headers,
      body: JSON.stringify({
        error: "Failed to fetch product",
        details: error.message,
      }),
    };
  }
};
