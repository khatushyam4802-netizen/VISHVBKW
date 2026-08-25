export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const pixelId = process.env.META_PIXEL_ID;
    const accessToken = process.env.META_ACCESS_TOKEN;

    if (!pixelId || !accessToken) {
      return res.status(500).json({
        error: "Environment variable missing"
      });
    }

    const body = req.body || {};

    const event = {
      event_name: body.event_name || "Lead",
      event_time: Math.floor(Date.now() / 1000),
      event_id: body.event_id || `lead_${Date.now()}`,
      action_source: "website",
      event_source_url:
        body.event_source_url || "https://vishvbkw.vercel.app/"
    };

    const url =
      `https://graph.facebook.com/v23.0/${pixelId}/events` +
      `?access_token=${encodeURIComponent(accessToken)}`;

    const metaResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        data: [event]
      })
    });

    const text = await metaResponse.text();

    console.log("META STATUS:", metaResponse.status);
    console.log("META RESPONSE:", text);

    return res.status(metaResponse.status).json({
      meta_status: metaResponse.status,
      meta_response: text
    });

  } catch (error) {
    console.error("SERVER ERROR:", error);

    return res.status(500).json({
      error: error.message
    });
  }
}
