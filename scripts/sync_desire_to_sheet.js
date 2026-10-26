const fs = require('fs');

const webhookUrl = 'https://script.google.com/macros/s/AKfycbxcQXNnv9doCYG96BpFJb1LMcMvqz-rI7TEqWAEs4DKq75-F2ZVsJID-_1a7BrUqlDk/exec';
const orders = JSON.parse(fs.readFileSync('data/orders.json', 'utf8'));
const desireOrder = orders.find(o => o.id === 'NVQ-2026-18217');

if (!desireOrder) {
  console.error('Order NVQ-2026-18217 not found in data/orders.json');
  process.exit(1);
}

const payload = {
  orderNo: desireOrder.id,
  orderId: desireOrder.id,
  dateReceived: '24-Oct-2026',
  customerName: desireOrder.customer.fullName,
  phone: desireOrder.customer.phone,
  customer: {
    fullName: desireOrder.customer.fullName,
    phone: desireOrder.customer.phone,
    email: desireOrder.customer.email,
    address: desireOrder.customer.address,
    city: desireOrder.customer.city,
    state: desireOrder.customer.state,
    deliveryNotes: desireOrder.customer.deliveryNotes
  },
  address: `${desireOrder.customer.address}, ${desireOrder.customer.city}`,
  items: [
    {
      name: 'The Weave Slide Pam',
      selectedSize: '39',
      size: '39',
      selectedColour: 'Black',
      colour: 'Black',
      quantity: 1,
      price: 20000
    }
  ],
  total: 20000,
  orderStatus: 'Paid',
  status: 'Paid',
  paymentStatus: 'paid',
  payment: {
    provider: 'paystack',
    status: 'success',
    reference: desireOrder.payment.reference
  }
};

async function syncToSheet() {
  console.log('Syncing Desire Aigbe order to Google Sheets:', payload.orderNo);
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const text = await res.text();
    console.log('Response status:', res.status);
    console.log('Response body:', text);
  } catch (err) {
    console.error('Failed to sync to sheet:', err);
  }
}

syncToSheet();
