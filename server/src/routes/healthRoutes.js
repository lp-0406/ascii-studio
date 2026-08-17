const express = require('express');
const { checkDatabaseConnection } = require('../config/db');

const router = express.Router();

router.get('/', async (req, res) => {
  const dbConnected = await checkDatabaseConnection();

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected',
  });
});

module.exports = router;
