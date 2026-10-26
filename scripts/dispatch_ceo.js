const webhookUrl = 'https://script.google.com/macros/s/AKfycbxcQXNnv9doCYG96BpFJb1LMcMvqz-rI7TEqWAEs4DKq75-F2ZVsJID-_1a7BrUqlDk/exec';

const cheekyHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Executive Memo: High-Priority Check-In</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF8F4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2A1B15; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF8F4; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #FFFFFF; border: 1px solid #E8E3D8; border-radius: 6px; overflow: hidden; box-shadow: 0 4px 20px rgba(42, 27, 21, 0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color: #2A1B15; padding: 24px; text-align: center;">
              <span style="font-family: Georgia, serif; font-size: 22px; font-weight: bold; letter-spacing: 0.15em; color: #FAF8F4; text-transform: uppercase; display: block;">
                NOVEQ
              </span>
              <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #BAAA9E; margin-top: 4px; display: block;">
                Executive Office · Internal Dispatch
              </span>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 28px 24px;">
              <span style="font-size: 32px; display: block; margin-bottom: 10px;">🌚</span>
              <h2 style="font-size: 20px; font-weight: 700; color: #2A1B15; margin: 0 0 14px 0;">
                Executive Memo: High-Priority Check-In for the CEO
              </h2>
              
              <p style="font-size: 14px; line-height: 1.6; color: #5B4033; margin: 0 0 14px 0;">
                Good day Mr. CEO,
              </p>
              
              <p style="font-size: 14px; line-height: 1.6; color: #5B4033; margin: 0 0 14px 0;">
                This is a quick operational check-in from the tech and logistics desk to make sure you are drinking enough cold water and not spending your entire day staring passionately at leather swatches.
              </p>

              <p style="font-size: 14px; line-height: 1.6; color: #5B4033; margin: 0 0 14px 0;">
                Everything on our end is running smoothly:
              </p>

              <ul style="font-size: 13px; line-height: 1.6; color: #5B4033; margin: 0 0 18px 20px; padding: 0;">
                <li style="margin-bottom: 6px;">Drop 001 orders are accounted for, verified, and logged.</li>
                <li style="margin-bottom: 6px;">The website is humming, the database is intact, and the Google Sheets are in live sync.</li>
                <li style="margin-bottom: 6px;">The Lagos workshop is actively turning out clean pairs.</li>
              </ul>

              <div style="background-color: #FAF8F4; border-left: 3px solid #7C3F1D; padding: 14px 16px; margin: 18px 0; border-radius: 0 4px 4px 0;">
                <strong style="color: #2A1B15; font-size: 13px; display: block; margin-bottom: 6px;">
                  Your Official CEO Responsibilities for Today:
                </strong>
                <ol style="margin: 0; padding-left: 18px; font-size: 13px; line-height: 1.6; color: #5B4033;">
                  <li>Step out in your freshest pair of NOVEQ slippers.</li>
                  <li>When anyone asks about the company strategy, pause thoughtfully, take a sip of water, and say: <em>"We let the footwear do the talking."</em></li>
                  <li>Smile and act like every single thing that worked was 100% according to your master plan.</li>
                </ol>
              </div>

              <p style="font-size: 13px; color: #7A7265; line-height: 1.5; margin: 20px 0 0 0;">
                Keep leading from the front, boss.<br /><br />
                <strong>NOVEQ Tech, Design & Operations Squad</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F5F1E9; padding: 16px 24px; text-align: center; border-top: 1px solid #E8E3D8; font-size: 11px; color: #8F8475;">
              NOVEQ Headquarters · Lagos, Nigeria<br />
              <a href="https://www.noveq.com.ng" style="color: #5B4033; text-decoration: underline;">noveq.com.ng</a>
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
    emailSubject: 'Memo to the CEO: High-Priority Check-In 🌚',
    subject: 'Memo to the CEO: High-Priority Check-In 🌚',
    customerHtml: cheekyHtml,
    htmlBody: cheekyHtml,
  };

  console.log('Dispatching cheeky CEO memo to: isiboremmanuel06@gmail.com');
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.text();
  console.log('Result:', data);
}

dispatchCeo();
