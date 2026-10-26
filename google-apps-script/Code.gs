/**
 * NOVEQ Order & Email Synchronization Engine
 * Deployed as Google Apps Script Web App
 * 
 * Capabilities:
 * 1. Automatic row insertion into the Orders tab (gid: 87663893)
 * 2. Instant branded customer confirmation email tagged as HIGH IMPORTANCE
 * 3. Direct email dispatch for customer appreciation & founder updates
 * 4. Instant founder alert to noveqthebrand@gmail.com
 */

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return respondJson({ status: 'error', message: 'No payload received' });
    }

    var data = JSON.parse(e.postData.contents);

    // Action 1: Ping / Healthcheck
    if (data.action === 'ping') {
      return respondJson({ status: 'ok', message: 'NOVEQ Google Apps Script Webhook is active and responsive.' });
    }

    // Action 2: Direct Email Dispatch (For customer updates, announcements, or founder notes)
    var targetEmail = data.recipientEmail || data.to || (data.customer && data.customer.email);
    var contentHtml = data.htmlBody || data.customerHtml;
    var emailSub = data.subject || data.emailSubject || 'Message from NOVEQ';

    if (data.action === 'send_email' && targetEmail && contentHtml) {
      try {
        GmailApp.sendEmail(targetEmail, emailSub, '', {
          htmlBody: contentHtml,
          name: 'NOVEQ',
          replyTo: 'noveqthebrand@gmail.com',
          headers: {
            'Importance': 'High',
            'X-Priority': '1',
            'X-MSMail-Priority': 'High',
            'Priority': 'Urgent'
          }
        });
        return respondJson({ status: 'ok', message: 'Email sent successfully to ' + targetEmail });
      } catch (mailErr) {
        // Fallback to MailApp
        MailApp.sendEmail({
          to: targetEmail,
          subject: emailSub,
          htmlBody: contentHtml,
          name: 'NOVEQ'
        });
        return respondJson({ status: 'ok', message: 'Email sent via MailApp fallback to ' + targetEmail });
      }
    }

    // Action 3: Order Logging to Sheet + Automatic Email Dispatch
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Find sheet tab by gid (87663893) or name containing 'order'
    var sheet = null;
    var allSheets = ss.getSheets();
    for (var i = 0; i < allSheets.length; i++) {
      if (allSheets[i].getSheetId() == 87663893 || allSheets[i].getName().toLowerCase().indexOf('order') !== -1) {
        sheet = allSheets[i];
        break;
      }
    }
    if (!sheet) {
      sheet = ss.getActiveSheet();
    }

    // Format items summary in plain English
    var itemsStr = '';
    if (data.items && Array.isArray(data.items)) {
      itemsStr = data.items
        .map(function(item) {
          return item.name + ' (' + (item.selectedSize || item.size) + ', ' + (item.selectedColour || item.colour) + ') x' + item.quantity;
        })
        .join('; ');
    }

    // Append order to spreadsheet row
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

    // Send Branded Confirmation Email to Customer (Marked as High Priority / Important)
    var customerEmail = (data.customer && data.customer.email) || data.recipientEmail;
    if (customerEmail && data.customerHtml) {
      try {
        GmailApp.sendEmail(customerEmail, data.emailSubject || ('Your NOVEQ Order is Confirmed (' + (data.orderNo || data.orderId) + ')'), '', {
          htmlBody: data.customerHtml,
          name: 'NOVEQ',
          replyTo: 'noveqthebrand@gmail.com',
          headers: {
            'Importance': 'High',
            'X-Priority': '1',
            'X-MSMail-Priority': 'High',
            'Priority': 'Urgent'
          }
        });
      } catch (custMailErr) {
        MailApp.sendEmail({
          to: customerEmail,
          subject: data.emailSubject || ('Your NOVEQ Order is Confirmed (' + (data.orderNo || data.orderId) + ')'),
          htmlBody: data.customerHtml,
          name: 'NOVEQ'
        });
      }
    }

    // Send Alert Email to Founders
    if (data.adminHtml) {
      try {
        GmailApp.sendEmail('noveqthebrand@gmail.com', '🚨 [New Order] ' + (data.orderNo || data.orderId) + ' - ' + (data.customerName || 'Customer') + ' (₦' + Number(data.total).toLocaleString() + ')', '', {
          htmlBody: data.adminHtml,
          name: 'NOVEQ System',
          headers: {
            'Importance': 'High',
            'X-Priority': '1'
          }
        });
      } catch (adminMailErr) {
        MailApp.sendEmail({
          to: 'noveqthebrand@gmail.com',
          subject: '🚨 [New Order] ' + (data.orderNo || data.orderId) + ' - ' + (data.customerName || 'Customer') + ' (₦' + Number(data.total).toLocaleString() + ')',
          htmlBody: data.adminHtml,
          name: 'NOVEQ System'
        });
      }
    }

    return respondJson({
      status: 'ok',
      message: 'Order recorded to sheet ' + sheet.getName() + ' and notification emails dispatched successfully.',
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
