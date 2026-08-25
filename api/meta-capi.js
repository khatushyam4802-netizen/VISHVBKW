export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { event_name, event_id, event_source_url } = req.body;

    const pixelId = process.env.META_PIXEL_ID;
    const accessToken = process.env.META_ACCESS_TOKEN;

    if (!pixelId || !accessToken) {
      return res.status(500).json({
        error: "Missing META_PIXEL_ID or META_ACCESS_TOKEN"
      });
    }

    const event = {
      event_name: event_name || "Lead",
      event_time: Math.floor(Date.now() / 1000),
      event_id: event_id,
      action_source: "website",
      event_source_url: event_source_url || "https://vishvbkw.vercel.app/"
    };

    const response = await fetch(
      `https://graph.facebook.com/v23.0/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          data: [event]
        })
      }
    );

    const result = await response.json();

    return res.status(response.ok ? 200 : 400).json(result);

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
