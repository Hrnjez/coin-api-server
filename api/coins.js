const axios = require('axios');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // 👈 allow all domains (or use specific one)
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const response = await axios.get(
      'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest',
      {
        headers: {
          'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY,
        },
        params: {
          start: 1,
          limit: 15,
          convert: 'USD',
        },
      }
    );

    const data = response.data.data.map((coin) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      price: coin.quote.USD.price,
      percent_change_24h: coin.quote.USD.percent_change_24h,
    }));

    res.status(200).json(data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch coin data' });
  }
};
