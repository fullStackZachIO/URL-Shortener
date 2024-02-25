require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dns = require('dns');
const app = express();
const url = require('url');
let urlDatabase = [];

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(
  bodyParser.urlencoded({extended: false})
);

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

function generateShortUrl() {
  return urlDatabase.length.toString();
}

app.post("/api/shorturl", function(req, res) {
  let original_url = req.body.url;
  console.log("Original URL: " + original_url);

  try {
    const { hostname } = new URL(original_url);
    dns.lookup(hostname, (err, address, family) => {
      if (err) {
        console.log("DNS lookup failed", err);
        res.json({error: "invalid url"});
      } else {
        console.log(`Address: ${address} Family: IPv${family}`);
        const shortUrl = generateShortUrl();
        urlDatabase.push({"short_url": shortUrl, "original_url": original_url});
        res.json({original_url: original_url, short_url: shortUrl});
      }
    });
  } catch (error) {
    console.log("Error parsing URL", error);
    res.json({error: "Invalid URL"});
  }
});

app.get('/api/shorturl/:shorturl', function(req, res) {
  
  function findUrl(shortUrl) {
    let urlInfo = urlDatabase.find((item) => item.short_url === shortUrl);
    console.log(urlInfo.original_url);
    if (urlInfo) {
      res.redirect(urlInfo.original_url);
    } else {
      res.status(404).send('URL not found');
    }
  }
  const shortUrl = req.params.shorturl;
  findUrl(shortUrl);
})

