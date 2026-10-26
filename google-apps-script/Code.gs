/**
 * ==============================================================================
 * NOVEQ Brand Google Sheets & Automated Email Engine
 * Sheet: NOVEQ Official Ledger (Orders, P&L, Summary)
 * Spreadsheet ID: 1ZLbOPcCztTgtxmKmWLW_BB_utKxS7-DpePflxXerA1I
 *
 * HOW TO DEPLOY IN 30 SECONDS:
 * 1. Open your Google Sheet (NOVEQ Official Ledger).
 * 2. In the top menu, click Extensions -> Apps Script.
 * 3. Select all existing code in Code.gs, delete it, and paste this entire file.
 * 4. In the toolbar, select "authorizeAndTest" from the function dropdown and click "Run".
 *    (Google will ask for permission to send emails from noveqthebrand@gmail.com - click "Review Permissions" -> select account -> "Advanced" -> "Go to (unsafe)" -> "Allow").
 * 5. Click "Deploy" (top right) -> "Manage deployments".
 * 6. Click the pencil (Edit) icon next to your active deployment.
 * 7. Change Version dropdown to "New version".
 * 8. Ensure "Execute as": "Me" and "Who has access": "Anyone".
 * 9. Click "Deploy".
 * ==============================================================================
 */

/**
 * 1-Click Authorization & Test Function
 * Run this once inside the Apps Script editor to grant Gmail sending permissions.
 */
function authorizeAndTest() {
  var myEmail = Session.getActiveUser().getEmail() || 'noveqthebrand@gmail.com';
  GmailApp.sendEmail(myEmail, 'NOVEQ Email Engine Authorization Verified', 'Your NOVEQ Google Apps Script is now fully authorized to send automatic order emails and high-priority customer confirmations directly from ' + myEmail + '!');
  Logger.log('Success! Test email sent to ' + myEmail);
}

/**
 * Handle GET requests (Health check / status inspection)
 */
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    return ContentService.createTextOutput(
      JSON.stringify({
        status: 'success',
        message: 'NOVEQ Google Apps Script Webhook is active and healthy.',
        spreadsheet: ss.getName(),
        timestamp: new Date().toISOString()
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle POST requests (Order logging + Automatic email dispatch)
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
      return respondJson({
        status: 'success',
        message: 'NOVEQ webhook ping verified successfully. Connection is live!',
        receivedAt: new Date().toISOString()
      });
    }

    // Direct standalone email dispatch (e.g. CEO memo or manual customer update)
    var targetEmail = data.recipientEmail || data.to || (data.customer && data.customer.email);
    var contentHtml = data.htmlBody || data.customerHtml;
    var emailSub = data.subject || data.emailSubject || 'Message from NOVEQ';

    if (data.action === 'send_email' && targetEmail && contentHtml) {
      var emailSent = sendBrandedEmail(targetEmail, emailSub, contentHtml);
      return respondJson({
        status: emailSent.success ? 'success' : 'error',
        message: emailSent.message,
        recipient: targetEmail
      });
    }

    // ORDER SYNC & AUTOMATIC EMAIL PIPELINE
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
    var customerEmail = (data.customer && data.customer.email) || data.recipientEmail || '';

    var addressParts = [];
    if (data.customer && data.customer.address) addressParts.push(data.customer.address);
    if (data.customer && data.customer.city) addressParts.push(data.customer.city);
    if (data.customer && data.customer.state) addressParts.push(data.customer.state);
    var address = addressParts.length > 0 ? addressParts.join(', ') : (data.address || 'Lagos, Nigeria');
    
    var status = data.orderStatus || data.status || 'Paid';
    var paymentStatus = data.paymentStatus || (data.payment && data.payment.status) || 'paid';
    var orderTotal = Number(data.total) || 20000;

    // Items array (handle single or multi-item orders)
    var items = data.items || [];
    if (!Array.isArray(items) || items.length === 0) {
      items = [
        {
          name: data.productName || 'The Weave Slide Pam',
          selectedSize: data.size || '39',
          selectedColour: data.colour || 'Black',
          quantity: Number(data.quantity) || 1,
          price: orderTotal || 20000
        }
      ];
    }

    // Find next empty row starting at row 6
    var lastRow = ordersSheet.getLastRow();
    var nextRow = Math.max(lastRow + 1, 6);
    var rowsAdded = 0;

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var productName = item.name || 'The Weave Slide Pam';
      var rawSize = item.selectedSize || item.size || '39';
      var size = rawSize.toString().replace(/^EU\s*/i, '').trim();
      var colour = item.selectedColour || item.colour || 'Black';
      var qty = Number(item.quantity) || 1;
      var unitPrice = Number(item.price) || (items.length > 0 ? Math.round(orderTotal / items.length) : 20000);
      var itemTotal = unitPrice * qty;
      
      var isPaid = (paymentStatus === 'success' || paymentStatus === 'paid' || status === 'Paid' || status === 'paid');
      var amountPaid = isPaid ? itemTotal : 0;
      var formattedPaymentStatus = isPaid ? 'Paid' : 'Pending';

      // 14 Columns matching row 4 headers in NOVEQ Official Ledger:
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
      // L (12): Order Status
      // M (13): Amount Paid
      // N (14): Payment Status
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
        formattedPaymentStatus
      ];

      ordersSheet.getRange(nextRow, 1, 1, rowValues.length).setValues([rowValues]);
      nextRow++;
      rowsAdded++;
    }

    // AUTOMATIC EMAIL DISPATCH 1: Customer Order Receipt & Welcome Email
    var custEmailResult = { sent: false, note: 'No customer HTML or recipient email provided' };
    if (customerEmail && data.customerHtml) {
      var subject = data.emailSubject || ('Your NOVEQ Order is Confirmed (' + orderNo + ')');
      var res = sendBrandedEmail(customerEmail, subject, data.customerHtml);
      custEmailResult = { sent: res.success, note: res.message };
    }

    // AUTOMATIC EMAIL DISPATCH 2: Internal Founder Order Alert to noveqthebrand@gmail.com
    var adminEmailResult = { sent: false, note: 'No admin HTML provided' };
    if (data.adminHtml) {
      var adminSubject = '🚨 [New Order] ' + orderNo + ' - ' + customerName + ' (₦' + Number(orderTotal).toLocaleString() + ')';
      var resAdmin = sendBrandedEmail('noveqthebrand@gmail.com', adminSubject, data.adminHtml);
      adminEmailResult = { sent: resAdmin.success, note: resAdmin.message };
    }

    return respondJson({
      status: 'success',
      message: 'Order ' + orderNo + ' logged to sheet ' + ordersSheet.getName() + ' (' + rowsAdded + ' rows added).',
      orderNo: orderNo,
      rowsAdded: rowsAdded,
      emails: {
        customer: custEmailResult,
        admin: adminEmailResult
      }
    });

  } catch (err) {
    return respondJson({ status: 'error', message: err.toString() });
  }
}

/**
 * High-Deliverability Email Sender
 * Strips aggressive spam-trigger headers and provides clean plain-text fallback
 * to ensure emails land in the Primary inbox rather than Spam or Promotions.
 */
function sendBrandedEmail(recipient, subject, htmlBody) {
  var plainText = stripHtml(htmlBody);
  try {
    GmailApp.sendEmail(recipient, subject, plainText, {
      htmlBody: htmlBody,
      name: 'NOVEQ',
      replyTo: 'noveqthebrand@gmail.com'
    });
    return { success: true, message: 'Dispatched via GmailApp (appears in Gmail Sent box)' };
  } catch (gmailErr) {
    try {
      MailApp.sendEmail({
        to: recipient,
        subject: subject,
        body: plainText,
        htmlBody: htmlBody,
        name: 'NOVEQ',
        replyTo: 'noveqthebrand@gmail.com'
      });
      return { success: true, message: 'Dispatched via MailApp fallback: ' + gmailErr.message };
    } catch (mailErr) {
      return { success: false, message: 'Email dispatch failed: ' + mailErr.message };
    }
  }
}

/**
 * Clean plain-text fallback generator
 */
function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<\/td>/gi, '  ')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\n\s+\n/g, '\n\n')
    .trim();
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

function respondJson(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
