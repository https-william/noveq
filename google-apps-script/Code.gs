/**
 * NOVEQ Order & Commerce Synchronization Engine
 * Deployed as Google Apps Script Web App
 * Handles:
 * 1. Automatic row insertion into the Orders Ledger (gid: 87663893)
 * 2. Instant branded customer confirmation email delivery via MailApp
 * 3. Instant founder notification email to noveqthebrand@gmail.com
 */

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return respondJson({ status: 'error', message: 'No payload received' });
    }

    var data = JSON.parse(e.postData.contents);

    // Ping / Healthcheck Action
    if (data.action === 'ping') {
      return respondJson({ status: 'ok', message: 'NOVEQ Google Apps Script Webhook is active and responsive.' });
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Orders') || ss.getActiveSheet();

    // Format items summary
    var itemsStr = '';
    if (data.items && Array.isArray(data.items)) {
      itemsStr = data.items
        .map(function(item) {
          return item.name + ' (' + (item.selectedSize || item.size) + ', ' + (item.selectedColour || item.colour) + ') x' + item.quantity;
        })
        .join('; ');
    }

    // Append order to spreadsheet row
    // Columns: [Order ID, Date, Customer Name, Phone, Email, Address, Items, Total Amount, Status, Payment Reference]
    sheet.appendRow([
      data.orderNo || data.orderId || '',
      data.dateReceived || Utilities.formatDate(new Date(), 'Africa/Lagos', 'dd MMM yyyy HH:mm'),
      data.customerName || (data.customer && data.customer.fullName) || '',
      data.phone || (data.customer && data.customer.phone) || '',
      (data.customer && data.customer.email) || data.recipientEmail || '',
      data.address || (data.customer && data.customer.address) || '',
      itemsStr,
      data.total || '',
      data.orderStatus || data.status || 'Paid',
      (data.payment && data.payment.reference) || ''
    ]);

    // Send Branded Confirmation Email to Customer
    var customerEmail = (data.customer && data.customer.email) || data.recipientEmail;
    if (customerEmail && data.customerHtml) {
      try {
        MailApp.sendEmail({
          to: customerEmail,
          subject: data.emailSubject || ('Order Confirmed: ' + (data.orderNo || data.orderId) + ' | NOVEQ Drop 001'),
          htmlBody: data.customerHtml,
          name: 'NOVEQ'
        });
      } catch (custMailErr) {
        Logger.log('Customer mail error: ' + custMailErr.toString());
      }
    }

    // Send Alert Email to Founders
    if (data.adminHtml) {
      try {
        MailApp.sendEmail({
          to: 'noveqthebrand@gmail.com',
          subject: '🚨 [New Order] ' + (data.orderNo || data.orderId) + ' - ' + (data.customerName || 'Customer') + ' (₦' + Number(data.total).toLocaleString() + ')',
          htmlBody: data.adminHtml,
          name: 'NOVEQ System'
        });
      } catch (adminMailErr) {
        Logger.log('Admin mail error: ' + adminMailErr.toString());
      }
    }

    return respondJson({
      status: 'ok',
      message: 'Order recorded and notification emails dispatched successfully.',
      orderNo: data.orderNo || data.orderId
    });

  } catch (err) {
    return respondJson({ status: 'error', message: err.toString() });
  }
}

function doGet(e) {
  return respondJson({
    status: 'ok',
    message: 'NOVEQ Google Apps Script Webhook is active and healthy.'
  });
}

function respondJson(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
