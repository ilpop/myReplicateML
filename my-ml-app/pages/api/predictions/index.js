export default async function handler(req, res) {
  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // Pinned to a specific version of Stable Diffusion
      // See https://replicate.com/stability-ai/sdxl
      version:
        "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",

      // This is the text prompt that will be submitted by a form on the frontend
      input: { prompt: req.body.prompt },
    }),
  });

  if (response.status !== 201) {
    try {
      let error = await response.json();
      res.statusCode = 500;
      res.end(JSON.stringify({ detail: error.detail }));
    } catch (parseError) {
      console.error("Error parsing JSON from response:", parseError);
      res.statusCode = 500;
      res.end(JSON.stringify({ detail: "Internal Server Error" }));
    }
    return;
  }

  const prediction = await response.json();
  res.statusCode = 201;
  res.end(JSON.stringify(prediction));
}
