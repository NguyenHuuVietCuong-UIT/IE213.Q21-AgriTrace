const axios = require('axios');

async function pinJsonToIPFS(jsonData) {
  const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
  const apiKey = process.env.PINATA_API_KEY;
  const apiSecret = process.env.PINATA_API_SECRET;
  if (!apiKey || !apiSecret) throw new Error('Pinata credentials are missing');

  const response = await axios.post(url, jsonData, {
    headers: {
      pinata_api_key: apiKey,
      pinata_secret_api_key: apiSecret,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
}

module.exports = { pinJsonToIPFS };
