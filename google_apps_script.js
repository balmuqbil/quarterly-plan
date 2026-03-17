/**
 * Google Apps Script for Quarterly Plan
 *
 * HOW TO DEPLOY:
 * 1. Go to https://script.google.com
 * 2. Open the existing project linked to your Sheet
 *    (or create new: Extensions > Apps Script from your Google Sheet)
 * 3. Replace ALL the code with this file's contents
 * 4. Click Deploy > Manage Deployments > Edit (pencil icon)
 * 5. Set version to "New version" and click Deploy
 * 6. Copy the Web App URL and use it in admin.html settings
 *
 * IMPORTANT: The sheet name must match SHEET_NAME below.
 * Column order must match COLUMNS below.
 */

var SHEET_NAME = 'Sheet1'; // Change this to match your sheet tab name
var COLUMNS = ['name', 'month', 'quarter', 'year', 'platform', 'taskType', 'occupancy', 'description', 'service', 'timestamp'];

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET_NAME);
}

// ============ GET: Return all data ============
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'getData';
  var callback = (e && e.parameter && e.parameter.callback) || '';

  if (action === 'getData') {
    var sheet = getSheet();
    var data = [];

    if (sheet && sheet.getLastRow() > 1) {
      var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();

      rows.forEach(function(row) {
        var obj = {};
        headers.forEach(function(h, i) {
          obj[h] = row[i] !== undefined && row[i] !== null ? String(row[i]) : '';
        });
        // Skip empty rows
        if (obj.name && obj.name.trim()) {
          data.push(obj);
        }
      });
    }

    var result = JSON.stringify({ status: 'success', data: data, count: data.length });

    if (callback) {
      return ContentService.createTextOutput(callback + '(' + result + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService.createTextOutput(result)
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Unknown action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============ POST: Add, Update, Delete ============
function doPost(e) {
  try {
    // Support both raw JSON body and form-encoded 'payload' parameter
    var body;
    if (e.parameter && e.parameter.payload) {
      body = e.parameter.payload;
    } else if (e.postData && e.postData.contents) {
      body = e.postData.contents;
    } else {
      return jsonResponse({ status: 'error', message: 'No data received' });
    }
    var payload = JSON.parse(body);
    var action = payload.action;

    if (action === 'add') {
      return handleAdd(payload);
    } else if (action === 'update') {
      return handleUpdate(payload);
    } else if (action === 'delete') {
      return handleDelete(payload);
    } else if (action === 'deleteAll') {
      return handleDeleteAll();
    } else {
      return jsonResponse({ status: 'error', message: 'Unknown action: ' + action });
    }
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

// ---- ADD rows ----
function handleAdd(payload) {
  var sheet = getSheet();
  var rows = payload.rows || [];
  if (!rows.length) return jsonResponse({ status: 'error', message: 'No rows to add' });

  // Ensure headers exist
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS);
  }

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var added = 0;

  rows.forEach(function(task) {
    var row = headers.map(function(h) {
      return task[h] !== undefined ? String(task[h]) : '';
    });
    sheet.appendRow(row);
    added++;
  });

  return jsonResponse({ status: 'success', message: 'Added ' + added + ' rows', added: added });
}

// ---- UPDATE a row ----
function handleUpdate(payload) {
  var match = payload.match;
  var updated = payload.updated;
  if (!match || !updated) return jsonResponse({ status: 'error', message: 'Missing match or updated data' });

  var sheet = getSheet();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();

  var rowIndex = findMatchingRow(headers, data, match);
  if (rowIndex === -1) return jsonResponse({ status: 'error', message: 'No matching row found' });

  // Update the row (rowIndex is 0-based in data, +2 for sheet: 1-based + header)
  var sheetRow = rowIndex + 2;
  headers.forEach(function(h, col) {
    if (updated[h] !== undefined) {
      sheet.getRange(sheetRow, col + 1).setValue(String(updated[h]));
    }
  });

  return jsonResponse({ status: 'success', message: 'Row updated', row: sheetRow });
}

// ---- DELETE a row ----
function handleDelete(payload) {
  var match = payload.match;
  if (!match) return jsonResponse({ status: 'error', message: 'Missing match criteria' });

  var sheet = getSheet();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();

  var rowIndex = findMatchingRow(headers, data, match);
  if (rowIndex === -1) return jsonResponse({ status: 'error', message: 'No matching row found' });

  // Delete the row (rowIndex is 0-based in data, +2 for sheet)
  var sheetRow = rowIndex + 2;
  sheet.deleteRow(sheetRow);

  return jsonResponse({ status: 'success', message: 'Row deleted', row: sheetRow });
}

// ---- DELETE ALL rows (keep header) ----
function handleDeleteAll() {
  var sheet = getSheet();
  var lastRow = sheet.getLastRow();

  if (lastRow <= 1) return jsonResponse({ status: 'success', message: 'Sheet already empty', deleted: 0 });

  var count = lastRow - 1;
  sheet.deleteRows(2, count);

  return jsonResponse({ status: 'success', message: 'Deleted all ' + count + ' rows', deleted: count });
}

// ---- Helper: find a row matching criteria ----
function findMatchingRow(headers, data, match) {
  var matchKeys = Object.keys(match);

  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var isMatch = true;

    for (var k = 0; k < matchKeys.length; k++) {
      var key = matchKeys[k];
      var colIndex = headers.indexOf(key);
      if (colIndex === -1) continue; // Skip unknown columns

      var cellVal = String(row[colIndex] || '').trim();
      var matchVal = String(match[key] || '').trim();

      if (cellVal !== matchVal) {
        isMatch = false;
        break;
      }
    }

    if (isMatch) return i;
  }

  return -1;
}

// ---- Helper: JSON response ----
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
