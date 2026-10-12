/**
 * ==============================================================================
 * NOVEQ Brand Google Sheets Webhook (Apps Script)
 * Sheet: NOVEQ Official Ledger (Orders, P&L, Summary)
 * Spreadsheet ID: 1ZLbOPcCztTgtxmKmWLW_BB_utKxS7-DpePflxXerA1I
 *
 * HOW TO INSTALL / UPDATE IN GOOGLE SHEETS:
 * 1. Open your spreadsheet in Google Sheets.
 * 2. Click "Extensions" -> "Apps Script".
 * 3. Delete any code currently in "Code.gs" and paste this ENTIRE file.
 * 4. Click the Save icon (floppy disk).
 * 5. Click "Deploy" (top right) -> "Manage deployments".
 * 6. Click the pencil (Edit) icon next to the active deployment.
 * 7. Change Version to "New version".
 * 8. Ensure "Execute as": "Me" and "Who has access": "Anyone".
 * 9. Click "Deploy".
 * ==============================================================================
 */

/**
 * Handle GET requests (Health check / status inspection)
 */
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheets = ss.getSheets().map(function (sheet) {
      return {
        name: sheet.getName(),
        id: sheet.getSheetId(),
        rows: sheet.getLastRow(),
      };
    });

    return ContentService.createTextOutput(
      JSON.stringify({
        status: 'success',
        message: 'NOVEQ Google Apps Script Webhook is active and healthy.',
        spreadsheet: ss.getName(),
        sheets: sheets,
        timestamp: new Date().toISOString(),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({
        status: 'error',
        message: err.toString(),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle POST requests (Order sync & test pings)
 */
function doPost(e) {
  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    // Health check ping
    if (data.action === 'ping' || data.test === true) {
      return ContentService.createTextOutput(
        JSON.stringify({
          status: 'success',
          message: 'NOVEQ webhook ping verified successfully. Connection is live!',
          receivedAt: new Date().toISOString(),
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Find Orders tab (gid=87663893 or named "Orders")
    var ordersSheet = ss.getSheetByName('Orders');
    if (!ordersSheet) {
      var all = ss.getSheets();
      for (var k = 0; k < all.length; k++) {
        if (all[k].getSheetId() === 87663893 || all[k].getName().toLowerCase().indexOf('order') !== -1) {
          ordersSheet = all[k];
          break;
        }
      }
    }
    if (!ordersSheet) {
      ordersSheet = ss.getSheets()[0];
    }

    // Extract customer and order info
    var orderNo = data.orderNo || data.orderId || ('ORD-' + Utilities.formatDate(new Date(), 'Africa/Lagos', 'yyMMdd-HHmm'));
    var dateStr = data.dateReceived || Utilities.formatDate(new Date(), 'Africa/Lagos', 'dd-MMM-yyyy');
    
    var customerName = (data.customer && data.customer.fullName) || data.customerName || 'Customer';
    var rawPhone = (data.customer && data.customer.phone) || data.phone || '';
    var phone = cleanPhoneFormat(rawPhone);
    
    var addressParts = [];
    if (data.customer && data.customer.address) addressParts.push(data.customer.address);
    if (data.customer && data.customer.city) addressParts.push(data.customer.city);
    if (data.customer && data.customer.state) addressParts.push(data.customer.state);
    var address = addressParts.length > 0 ? addressParts.join(', ') : (data.address || 'Lagos, Nigeria');
    
    var status = data.orderStatus || data.status || 'New';
    var paymentStatus = data.paymentStatus || (data.payment && data.payment.status) || 'paid';
    var orderTotal = Number(data.total) || 0;

    // Items array (handle single or multi-item orders)
    var items = data.items || [];
    if (!Array.isArray(items) || items.length === 0) {
      items = [
        {
          name: data.productName || 'The Weave',
          selectedSize: data.size || '38',
          selectedColour: data.colour || 'Black',
          quantity: Number(data.quantity) || 1,
          price: orderTotal || 20000,
        },
      ];
    }

    // Find next empty row starting at row 6
    var lastRow = ordersSheet.getLastRow();
    var nextRow = Math.max(lastRow + 1, 6);

    var rowsAdded = 0;
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var productName = item.name || 'The Weave';
      var rawSize = item.selectedSize || item.size || '38';
      var size = rawSize.toString().replace(/^EU\s*/i, '').trim();
      var colour = item.selectedColour || item.colour || 'Black';
      var qty = Number(item.quantity) || 1;
      var unitPrice = Number(item.price) || (items.length > 0 ? Math.round(orderTotal / items.length) : 20000);
      var itemTotal = unitPrice * qty;
      
      var isPaid = (paymentStatus === 'success' || paymentStatus === 'paid');
      var amountPaid = isPaid ? itemTotal : 0;
      var formattedPaymentStatus = isPaid ? 'Paid' : 'Pending';

      // Columns matching row 4 headers:
      // A (1): Order No.
      // B (2): Date Received
      // C (3): Customer Name
      // D (4): Phone / Instagram
      // E (5): Delivery Address
      // F (6): Product
      // G (7): Size
      // H (8): Colour
      // I (9): Qty
      // J (10): Unit Price (₦)
      // K (11): Total (₦)
      // L (12): Order Status (optional/extra)
      // M (13): Amount Paid (optional/extra)
      // N (14): Payment Status (optional/extra)
      var rowValues = [
        orderNo,
        dateStr,
        customerName,
        phone,
        address,
        productName,
        size,
        colour,
        qty,
        unitPrice,
        itemTotal,
        status,
        amountPaid,
        formattedPaymentStatus,
      ];

      ordersSheet.getRange(nextRow, 1, 1, rowValues.length).setValues([rowValues]);
      nextRow++;
      rowsAdded++;
    }

    return ContentService.createTextOutput(
      JSON.stringify({
        status: 'success',
        message: 'Order ' + orderNo + ' logged successfully to Google Sheets.',
        orderNo: orderNo,
        rowsAdded: rowsAdded,
        targetRow: nextRow - rowsAdded,
      })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({
        status: 'error',
        message: err.toString(),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Format Nigerian phone numbers cleanly: (+234)XXXXXXXXXX
 */
function cleanPhoneFormat(phoneStr) {
  if (!phoneStr) return '';
  var digits = phoneStr.replace(/[^0-9]/g, '');
  if (digits.startsWith('0')) {
    digits = '234' + digits.substring(1);
  } else if (!digits.startsWith('234') && digits.length === 10) {
    digits = '234' + digits;
  }
  if (digits.startsWith('234') && digits.length >= 13) {
    return '(+234)' + digits.substring(3);
  }
  return phoneStr;
}
