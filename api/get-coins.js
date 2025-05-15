const { Redis } = require('@upstash/redis');
// Triggering redeploy

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://www.counterparty.tv');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const raw = await redis.get('coin-data');
    if (!raw) {
      return res.status(503).json({ error: 'No cached data available yet' });
    }

    const data = JSON.parse(raw);
    return res.status(200).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to load cached coin data' });
  }
};
