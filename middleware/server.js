const express = require('express');
const cors = require('cors');

const collectRouter = require('./routes/collect');
const eventsRouter = require('./routes/events');
const healthRouter = require('./routes/health');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: /^http:\/\/localhost:\d+$/ }));
app.use(express.json({ limit: '1mb' }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use('/collect', collectRouter);
app.use('/events', eventsRouter);
app.use('/health', healthRouter);

app.listen(PORT, () => {
  console.log(`Capture middleware listening on port ${PORT}`);
});
