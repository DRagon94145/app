const express = require('express')
const app = express()
const { scrape } = require('./scraper')
const http = require('http');
const hostname = 'localhost';
const port = 3000;

app.get('/api/:bin', async (req, res) => {
    let data = await scrape(req.params.bin);
    res.set("Cache-Control", "public, max-age=86400");
    res.type('application/json');
    res.send(data);
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

module.exports = app
