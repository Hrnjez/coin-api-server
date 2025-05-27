const { Redis } = require('@upstash/redis');
const axios = require('axios');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://www.counterparty.tv');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const cached = await redis.get('coin-data');
    const lastUpdated = await redis.get('coin-data-timestamp');
    const now = Date.now();

    const isFresh = cached && lastUpdated && now - parseInt(lastUpdated) < 60 * 60 * 1000;

    if (isFresh && Array.isArray(cached)) {
      return res.status(200).json(cached); // No JSON.parse needed
    }

    const response = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest', {
      headers: {
        'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY,
      },
      params: {
        symbol: 'BTC,ETH,SOL,HYPE,PEPE,DOGE,GOAT',
        convert: 'USD',
      },
    });

   const data = Object.values(response.data.data).map((coin) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      price: coin.quote.USD.price,
      percent_change_24h: coin.quote.USD.percent_change_24h,
    }));

    await redis.set('coin-data', data);
    await redis.set('coin-data-timestamp', now.toString());

    return res.status(200).json(data);
  } catch (err) {
    console.error('Coin fetch error:', err);
    return res.status(500).json({ error: 'Failed to fetch coin data' });
  }
};
