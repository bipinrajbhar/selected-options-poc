export default async function handler(req, res) {
  const { ids } = req.query;
  const backendUrl = `https://rh.com/rh/api/products/v1?ids=${encodeURIComponent(
    ids || ""
  )}`;

  console.log("Proxying products request to:", backendUrl);

  try {
    console.log("Attempting to fetch from:", backendUrl);
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Vercel-Proxy/1.0",
        Accept: "application/json",
        "Accept-Language": "en-US,en;q=0.9",
      },
      timeout: 15000, // 15 second timeout
      redirect: "follow", // Follow redirects
    });

    if (!response.ok) {
      console.error("Backend responded with status:", response.status);
      return res.status(response.status).json({
        error: "Backend error",
        status: response.status,
        statusText: response.statusText,
      });
    }

    const data = await response.text();

    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Return the data with the same content type as the backend
    res.setHeader(
      "Content-Type",
      response.headers.get("content-type") || "application/json"
    );
    res.status(200).send(data);
  } catch (error) {
    console.error("Proxy error:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Error name:", error.name);
    console.error("Error cause:", error.cause);

    // Try to provide more specific error information
    let errorDetails = error.message;
    if (error.cause) {
      errorDetails += ` (Cause: ${error.cause.message || error.cause})`;
    }

    res.status(500).json({
      error: "Proxy error",
      details: errorDetails,
      backendUrl: backendUrl,
      errorType: error.name,
      timestamp: new Date().toISOString(),
    });
  }
}
