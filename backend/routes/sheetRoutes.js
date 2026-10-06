const express = require('express');
const router = express.Router();
const { getSheetsData, ensureTodayWorksheet, isConfigured } = require('../config/googleSheets');
const { protect, dealerOnly } = require('../middleware/authMiddleware');

// @desc    Get Google Sheets status, link, and today's worksheet data
// @route   GET /api/sheets/info
// @access  Public / Dealer
router.get('/info', async (req, res) => {
  try {
    const data = await getSheetsData();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Test Google Sheets connection and create today's worksheet if needed
// @route   POST /api/sheets/test
// @access  Private/Dealer
router.post('/test', protect, dealerOnly, async (req, res) => {
  try {
    const configured = isConfigured();
    const result = await ensureTodayWorksheet();

    res.status(200).json({
      success: true,
      configured,
      message: configured
        ? `Successfully connected to Google Sheets! Sheet "${result.sheetTitle}" is verified/created.`
        : `Operating in Simulation Mode. Local worksheet "${result.sheetTitle}" initialized. Add GOOGLE_SHEET_ID and service credentials in .env to connect live sheet.`,
      result
    });
  } catch (error) {
    console.error('Google Sheets test error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
