const axios = require('axios');
const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

module.exports = async (req, res) => {
  if (req.headers['x-vercel-cron'] !== '1') {
    return res.status(403).json({ error: 'Forbidden. This endpoint is for cron only.' });
  }

  try {
    const response = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest', {
      headers: {
        'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY,
      },
      params: {
        start: 1,
        limit: 15,
        convert: 'USD',
      },
    });

    const data = response.data.data.map((coin) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      price: coin.quote.USD.price,
      percent_change_24h: coin.quote.USD.percent_change_24h,
    }));

    await redis.set('coin-data', JSON.stringify(data));

    return res.status(200).json({ status: 'Coin data updated', count: data.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update coin data' });
  }
};
