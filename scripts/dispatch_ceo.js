const webhookUrl = 'https://script.google.com/macros/s/AKfycbxcQXNnv9doCYG96BpFJb1LMcMvqz-rI7TEqWAEs4DKq75-F2ZVsJID-_1a7BrUqlDk/exec';

const cheekyHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Executive Memo: High-Priority Check-In</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F7F5F0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1A1615; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F7F5F0; padding: 36px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #FFFFFF; border: 1px solid #EAE6DE; border-radius: 6px; overflow: hidden; box-shadow: 0 4px 20px rgba(26, 22, 21, 0.04);">
          <!-- Minimalist Header -->
          <tr>
            <td style="background-color: #1A1615; padding: 26px 24px; text-align: center;">
              <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 20px; font-weight: 700; letter-spacing: 0.22em; color: #F7F5F0; text-transform: uppercase; display: block;">
                NOVEQ
              </span>
              <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.22em; color: #A89F91; margin-top: 4px; display: block;">
                Executive Office · Internal Dispatch
              </span>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px 28px;">
              <div style="display: inline-block; background-color: #F0EAE1; color: #7C3F1D; font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; padding: 4px 10px; border-radius: 4px; margin-bottom: 14px;">
                Internal Memo
              </div>

              <h2 style="font-size: 19px; font-weight: 600; color: #1A1615; margin: 0 0 16px 0; letter-spacing: -0.01em;">
                Operational Check-In for the CEO
              </h2>
              
              <p style="font-size: 14px; line-height: 1.6; color: #635B54; margin: 0 0 14px 0;">
                Good day Mr. CEO,
              </p>
              
              <p style="font-size: 14px; line-height: 1.6; color: #635B54; margin: 0 0 14px 0;">
                This is a quick operational check-in from the tech and logistics desk to make sure you are drinking enough cold water and not spending your entire day staring passionately at leather swatches.
              </p>

              <p style="font-size: 14px; line-height: 1.6; color: #635B54; margin: 0 0 12px 0;">
                Everything on our end is running smoothly:
              </p>

              <ul style="font-size: 13px; line-height: 1.6; color: #635B54; margin: 0 0 20px 18px; padding: 0;">
                <li style="margin-bottom: 6px;">Drop 001 orders are accounted for, verified, and logged.</li>
                <li style="margin-bottom: 6px;">The website is humming, the database is intact, and the Google Sheets are in real-time order.</li>
                <li style="margin-bottom: 6px;">The Lagos workshop is actively turning out clean pairs.</li>
              </ul>

              <div style="background-color: #FAF8F5; border-left: 3px solid #7C3F1D; padding: 16px 18px; margin: 20px 0; border-radius: 0 4px 4px 0;">
                <strong style="color: #1A1615; font-size: 13px; display: block; margin-bottom: 8px;">
                  Your Official CEO Responsibilities for Today:
                </strong>
                <ol style="margin: 0; padding-left: 18px; font-size: 13px; line-height: 1.6; color: #635B54;">
                  <li style="margin-bottom: 4px;">Step out in your freshest pair of NOVEQ slippers.</li>
                  <li style="margin-bottom: 4px;">When anyone asks about company strategy, pause thoughtfully, take a sip of water, and say: <em>"We let the footwear do the talking."</em></li>
                  <li>Smile and act like every single thing that worked was 100% according to your master plan.</li>
                </ol>
              </div>

              <p style="font-size: 13px; color: #8F877D; line-height: 1.5; margin: 24px 0 0 0;">
                Keep leading from the front, boss.<br /><br />
                <strong style="color: #1A1615;">NOVEQ Tech & Operations Desk</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F7F5F0; padding: 16px 24px; text-align: center; border-top: 1px solid #EAE6DE; font-size: 11px; color: #8F877D;">
              NOVEQ Headquarters · Lagos, Nigeria<br />
              <a href="https://www.noveq.com.ng" style="color: #635B54; text-decoration: underline;">noveq.com.ng</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

async function dispatchCeo() {
  const payload = {
    action: 'send_email',
    recipientEmail: 'isiboremmanuel06@gmail.com',
    to: 'isiboremmanuel06@gmail.com',
    customerName: 'Emmanuel Isibor',
    emailSubject: 'Executive Memo: High-Priority Check-In',
    subject: 'Executive Memo: High-Priority Check-In',
    customerHtml: cheekyHtml,
    htmlBody: cheekyHtml,
  };

  console.log('Dispatching clean, emoji-free CEO memo to: isiboremmanuel06@gmail.com');
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.text();
  console.log('Result:', data);
}

dispatchCeo();
