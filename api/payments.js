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
    let allPayments = [];
    let hasMore = true;
    let startingAfter = null;

    while (hasMore) {
      const url = startingAfter
        ? `https://api.zeffy.com/api/v1/payments?starting_after=${startingAfter}&limit=100`
        : 'https://api.zeffy.com/api/v1/payments?limit=100';

      const response = await fetch(url, {
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
      allPayments = allPayments.concat(data.data || []);
      hasMore = data.has_more;
      startingAfter = data.next_cursor;
    }

    // Filter for Locker Rental payments
    const lockerPayments = allPayments.filter(payment =>
      payment.description && payment.description.toLowerCase().includes('locker rental')
    );

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({ data: lockerPayments, has_more: false }));
  } catch (error) {
    console.error('Error fetching from Zeffy API:', error);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
}