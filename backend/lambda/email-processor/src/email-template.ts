import { DisasterEmailMessage } from "./types/DisasterNotification";

export function buildEmailHtml(message: DisasterEmailMessage): string {
  const declarationDate = typeof message.declarationDate === 'string' 
    ? new Date(message.declarationDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : message.declarationDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

  const locationText = message.city 
    ? `Location: ${message.city}` 
    : 'Location: Not specified';

  const companyText = message.companyName 
    ? `Company: ${message.companyName}` 
    : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FEMA Disaster Alert</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #d32f2f; padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px;">FEMA Disaster Alert</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #333333;">
                Hello ${message.firstName},
              </p>
              
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #333333; line-height: 1.6;">
                A <strong>${message.declarationType}</strong> disaster has been declared in your area.
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; border-radius: 4px; padding: 20px; margin: 20px 0;">
                <tr>
                  <td style="font-size: 14px; color: #666666; line-height: 1.8;">
                    <strong style="color: #333333;">Declaration Date:</strong> ${declarationDate}<br>
                    <strong style="color: #333333;">Declaration Type:</strong> ${message.declarationType}<br>
                    ${message.city ? `<strong style="color: #333333;">${locationText}</strong><br>` : ''}
                    ${message.companyName ? `<strong style="color: #333333;">${companyText}</strong><br>` : ''}
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0; font-size: 16px; color: #333333; line-height: 1.6;">
                Please review this alert and take necessary precautions. For more information about this disaster and available assistance, visit <a href="https://www.fema.gov" style="color: #d32f2f;">FEMA.gov</a>.
              </p>
              
              <p style="margin: 20px 0 0 0; font-size: 14px; color: #666666;">
                Stay safe,<br>
                <strong>Prisere Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0; font-size: 12px; color: #999999;">
                Notification ID: ${message.notificationId}<br>
                Disaster ID: ${message.disasterId}
              </p>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #999999;">
                You received this email because you have registered for disaster alerts in your area.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function buildEmailText(message: DisasterEmailMessage): string {
  const declarationDate = typeof message.declarationDate === 'string' 
    ? new Date(message.declarationDate).toLocaleDateString('en-US')
    : message.declarationDate.toLocaleDateString('en-US');

  return `
FEMA Disaster Alert

Hello ${message.firstName},

A ${message.declarationType} disaster has been declared in your area.

Declaration Date: ${declarationDate}
Declaration Type: ${message.declarationType}
${message.city ? `Location: ${message.city}` : ''}
${message.companyName ? `Company: ${message.companyName}` : ''}

Please review this alert and take necessary precautions. For more information about this disaster and available assistance, visit FEMA.gov.

Stay safe,
Prisere Team

---
Notification ID: ${message.notificationId}
Disaster ID: ${message.disasterId}

You received this email because you have registered for disaster alerts in your area.
  `.trim();
}