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
        error: "Meta CAPI environment variables are missing"
      });
    }

    const response = await fetch(
      `https://graph.facebook.com/v23.0/${pixelId}/events?access_token=${accessToken}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          data: [
            {
              event_name: event_name || "Lead",
              event_time: Math.floor(Date.now() / 1000),
              event_id: event_id,
              action_source: "website",
              event_source_url: event_source_url,
              user_data: {
                client_ip_address:
                  req.headers["x-forwarded-for"]?.split(",")[0] ||
                  req.socket?.remoteAddress,
                client_user_agent: req.headers["user-agent"]
              }
            }
          ]
        })
      }
    );

    const result = await response.json();

    return res.status(response.ok ? 200 : response.status).json(result);
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
