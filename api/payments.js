export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    return res.end('Method Not Allowed');
  }

  const apiKey = process.env.ZEFFY_APIKEY;
  if (!apiKey) {
    res.statusCode = 500;
    return res.end('ZEFFY_APIKEY environment variable not set');
  }

  try {
    const response = await fetch('https://api.zeffy.com/api/v1/payments', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      res.statusCode = response.status;
      return res.end(`Error fetching payments: ${response.statusText}`);
    }

    const data = await response.json();
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify(data));
  } catch (error) {
    console.error('Error fetching from Zeffy API:', error);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
}