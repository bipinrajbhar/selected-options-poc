export default async function handler(req, res) {
  const { productId, selectedOptions } = req.query;
  const backendUrl = `https://44.197.228.204:5000/ng-all-options?productId=${encodeURIComponent(
    productId || ""
  )}&selectedOptions=${encodeURIComponent(selectedOptions || "")}`;

  try {
    const response = await fetch(backendUrl, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.text();
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.status(response.status).send(data);
  } catch (error) {
    res.status(500).json({ error: "Proxy error", details: error.message });
  }
}
