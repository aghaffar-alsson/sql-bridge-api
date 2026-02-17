const express = require('express');
const app = express();
app.use(express.json());

const API_KEY = process.env.API_KEY;
let pendingRequests = [];
let resultsCache = {};

app.get('/', (req, res) => {
  res.send("Render API Running");
});

app.get('/pending', (req, res) => {
  if (req.headers['x-api-key'] !== API_KEY)
    return res.status(401).send('Unauthorized');

  res.json(pendingRequests);
});

app.post('/pending', (req, res) => {
  if (req.headers['x-api-key'] !== API_KEY)
    return res.status(401).send('Unauthorized');

  const { requestId, data } = req.body;
  resultsCache[requestId] = data;
  pendingRequests = pendingRequests.filter(r => r.requestId !== requestId);
  res.send('ok');
});

app.get('/alerts', (req, res) => {
  if (req.headers['x-api-key'] !== API_KEY)
    return res.status(401).send('Unauthorized');

  const studentId = req.query.studentId;
  const requestId = Date.now().toString();

  pendingRequests.push({ studentId, requestId });

  const interval = setInterval(() => {
    if (resultsCache[requestId]) {
      res.json(resultsCache[requestId]);
      delete resultsCache[requestId];
      clearInterval(interval);
    }
  }, 1000);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server started"));
