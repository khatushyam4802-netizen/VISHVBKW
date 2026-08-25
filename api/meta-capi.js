export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const {
      event_name,
      event_id,
      event_source_url
    } = req.body || {};

    const pixelId = process.env.META_PIXEL_ID;
    const accessToken = process.env.META_ACCESS_TOKEN;

    if (!pixelId) {
      return res.status(500).json({
        error: "META_PIXEL_ID is missing"
      });
    }

    if (!accessToken) {
      return res.status(500).json({
        error: "META_ACCESS_TOKEN is missing"
      });
    }

    const eventData = {
      event_name: event_name || "Lead",
      event_time: Math.floor(Date.now() / 1000),
      event_id: event_id || `lead_${Date.now()}`,
      action_source: "website",
      event_source_url:
        event_source_url || "https://vishvbkw.vercel.app/"
    };

    const metaUrl =
      `https://graph.facebook.com/v23.0/${pixelId}/events`;

    const response = await fetch(metaUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        data: [eventData],
        access_token: accessToken
      })
    });

    const result = await response.json();

    console.log(
      "META CAPI STATUS:",
      response.status
    );

    console.log(
      "META CAPI RESPONSE:",
      JSON.stringify(result)
    );

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        meta_status: response.status,
        meta_response: result
      });
    }

    return res.status(200).json({
      success: true,
      meta_response: result
    });

  } catch (error) {
    console.error(
      "CAPI SERVER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
