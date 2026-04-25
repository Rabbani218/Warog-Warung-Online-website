const http = require('http');

const url = 'http://localhost:3000/admin';

function checkUrl(targetUrl, depth = 0) {
  if (depth > 25) {
    console.log('Too many redirects!');
    return;
  }
  console.log(`Checking ${targetUrl}...`);
  http.get(targetUrl, (res) => {
    console.log(`Status: ${res.statusCode}`);
    if (res.headers.location) {
      console.log(`Redirecting to: ${res.headers.location}`);
      let nextUrl = res.headers.location;
      if (nextUrl.startsWith('/')) {
        nextUrl = 'http://localhost:3000' + nextUrl;
      }
      checkUrl(nextUrl, depth + 1);
    } else {
      console.log('Final destination reached.');
    }
  }).on('error', (err) => {
    console.error(`Error: ${err.message}`);
  });
}

checkUrl(url);
