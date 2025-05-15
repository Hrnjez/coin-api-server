const axios = require('axios');

module.exports = async (req, res) => {
  try {
    const response = await axios.get(
      'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest',
      {
        headers: {
          'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY,
        },
        params: {
          start: 1,
          limit: 10,
          convert: 'USD',
        },
      }
    );

    const data = response.data.data.map((coin) => ({
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
