const fs = require('fs');
const path = require('path');
let googleModule = null;

// Virtual sheets storage file for simulation fallback
const VIRTUAL_SHEET_FILE = path.join(__dirname, '..', 'data', 'virtual_sheets.json');

// Ensure data folder exists
const dataDir = path.dirname(VIRTUAL_SHEET_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Helper to get today's sheet title in DD-MM-YYYY format
const getTodaySheetTitle = () => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${day}-${month}-${year}`;
};

// Helper to get formatted time HH:mm
const getFormattedTime = (date = new Date()) => {
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Check if live Google Sheets credentials are configured
const isConfigured = () => {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const credsFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  return !!(sheetId && ((clientEmail && privateKey) || credsFile));
};

// Initialize Google Sheets API client
const getGoogleSheetsClient = () => {
  if (!isConfigured()) return null;

  if (!googleModule) {
    googleModule = require('googleapis').google;
  }
  const google = googleModule;

  let auth;
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
  } else {
    let privateKey = process.env.GOOGLE_PRIVATE_KEY || '';
    // Handle escaped newlines in env vars
    privateKey = privateKey.replace(/\\n/g, '\n');

    auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
  }

  return google.sheets({ version: 'v4', auth });
};

// Virtual sheets helper for simulation
const getVirtualSheets = () => {
  try {
    if (fs.existsSync(VIRTUAL_SHEET_FILE)) {
      return JSON.parse(fs.readFileSync(VIRTUAL_SHEET_FILE, 'utf-8'));
    }
  } catch (err) {
    console.warn('Error reading virtual sheets file:', err.message);
  }
  return {};
};

const saveVirtualSheets = (data) => {
  try {
    fs.writeFileSync(VIRTUAL_SHEET_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving virtual sheets file:', err.message);
  }
};

/**
 * Ensures today's worksheet exists (e.g. "06-10-2026").
 * Adds standard header row if sheet is newly created.
 */
const ensureTodayWorksheet = async () => {
  const todayTitle = getTodaySheetTitle();
  const headers = ['Order ID', 'Time', 'Customer', 'Phone', 'Product', 'Qty', 'Address', 'ZIP'];

  if (isConfigured()) {
    try {
      const sheets = getGoogleSheetsClient();
      const spreadsheetId = process.env.GOOGLE_SHEET_ID;

      // 1. Fetch spreadsheet metadata to check existing sheets
      const meta = await sheets.spreadsheets.get({ spreadsheetId });
      const sheetExists = meta.data.sheets.some(
        (s) => s.properties && s.properties.title === todayTitle
      );

      if (!sheetExists) {
        console.log(`Creating new daily worksheet '${todayTitle}' in Google Sheets...`);
        // Add sheet request
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [
              {
                addSheet: {
                  properties: {
                    title: todayTitle,
                    gridProperties: {
                      rowCount: 1000,
                      columnCount: 10,
                      frozenRowCount: 1
                    }
                  }
                }
              }
            ]
          }
        });

        // Append header row
        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: `'${todayTitle}'!A1:H1`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [headers]
          }
        });
        console.log(`✓ Worksheet '${todayTitle}' created with headers in Google Sheet.`);
      }

      return { success: true, sheetTitle: todayTitle, live: true };
    } catch (error) {
      console.error('Google Sheets live sheet creation error:', error.message);
      // Fall through to virtual recording as backup
    }
  }

  // Virtual sheet fallback
  const virtual = getVirtualSheets();
  if (!virtual[todayTitle]) {
    virtual[todayTitle] = {
      createdAt: new Date().toISOString(),
      headers,
      rows: []
    };
    saveVirtualSheets(virtual);
    console.log(`[Virtual Sheets] Worksheet '${todayTitle}' initialized.`);
  }

  return { success: true, sheetTitle: todayTitle, live: false };
};

/**
 * Appends an order to today's worksheet.
 * Each item in the order is appended as a row matching the spec:
 * Order ID | Time | Customer | Phone | Product | Qty | Address | ZIP
 */
const appendOrderToSheet = async (order) => {
  const todayTitle = getTodaySheetTitle();
  const timeStr = getFormattedTime(order.createdAt || new Date());
  const fullAddress = `${order.address}${order.city ? ', ' + order.city : ''}${order.state ? ', ' + order.state : ''}`;

  // Build rows for each product item in order
  const rows = order.items.map((item) => [
    order.orderId.toString(),
    timeStr,
    order.customerName,
    order.customerPhone,
    `${item.name}${item.unit ? ' ' + item.unit : ''}`,
    Number(item.quantity),
    fullAddress,
    order.zip.toString()
  ]);

  let liveSuccess = false;
  let liveError = null;

  if (isConfigured()) {
    try {
      await ensureTodayWorksheet();
      const sheets = getGoogleSheetsClient();
      const spreadsheetId = process.env.GOOGLE_SHEET_ID;

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `'${todayTitle}'!A:H`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: rows
        }
      });

      console.log(`✓ Order ${order.orderId} (${rows.length} rows) appended to Google Sheet '${todayTitle}'.`);
      liveSuccess = true;
    } catch (err) {
      console.error(`Failed to append order ${order.orderId} to live Google Sheet:`, err.message);
      liveError = err.message;
    }
  }

  // Also always write to virtual sheets so the Dealer UI has immediate offline/mock visibility
  const virtual = getVirtualSheets();
  if (!virtual[todayTitle]) {
    virtual[todayTitle] = {
      createdAt: new Date().toISOString(),
      headers: ['Order ID', 'Time', 'Customer', 'Phone', 'Product', 'Qty', 'Address', 'ZIP'],
      rows: []
    };
  }

  rows.forEach((row) => {
    virtual[todayTitle].rows.push(row);
  });
  saveVirtualSheets(virtual);

  return {
    success: liveSuccess || !isConfigured(),
    live: liveSuccess,
    sheetTitle: todayTitle,
    rowsAdded: rows.length,
    error: liveError
  };
};

/**
 * Get virtual sheets data or live sheet rows for dealer dashboard
 */
const getSheetsData = async () => {
  const todayTitle = getTodaySheetTitle();
  const isLive = isConfigured();
  const virtual = getVirtualSheets();

  let liveData = null;
  if (isLive) {
    try {
      const sheets = getGoogleSheetsClient();
      const spreadsheetId = process.env.GOOGLE_SHEET_ID;
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `'${todayTitle}'!A1:H100`
      });
      liveData = res.data.values || [];
    } catch (err) {
      // ignore
    }
  }

  return {
    isConfigured: isLive,
    spreadsheetId: process.env.GOOGLE_SHEET_ID || null,
    sheetUrl: process.env.GOOGLE_SHEET_ID
      ? `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEET_ID}`
      : null,
    todaySheetTitle: todayTitle,
    virtualSheets: virtual,
    liveRows: liveData
  };
};

module.exports = {
  isConfigured,
  ensureTodayWorksheet,
  appendOrderToSheet,
  getSheetsData,
  getTodaySheetTitle,
  getFormattedTime
};
