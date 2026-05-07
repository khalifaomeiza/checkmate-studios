/**
 * Reusable HTML shell for transactional emails.
 * Modelled after the checkmate-website templates so all emails
 * share a consistent header / footer / typography.
 */

interface ShellOptions {
  title: string;
  bodyHtml: string;
  preheader?: string;
}

export const renderEmailShell = ({
  title,
  bodyHtml,
  preheader = ''
}: ShellOptions): string => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:32px 24px;background-color:#f0f0f0;font-family:Arial,Helvetica,sans-serif;color:#191919;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>` : ''}
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;margin:28px auto;background-color:#ffffff;border-radius:8px;border:1px solid #ededed;">
    <tr>
      <td>
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#ffffff;">
          <tr>
            <td style="padding:24px;" align="left" valign="middle">
              <img src="https://res.cloudinary.com/dkomq1g9z/image/upload/v1757974053/checkmate_newLogo_t8uyte.png" alt="Checkmate Studios" style="height:25px;width:180px;display:block;" />
            </td>
          </tr>
        </table>
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="padding:0 24px;">
              <hr style="border:none;border-top:1px solid #e7e7e7;width:100%;height:1px;margin:0;" />
            </td>
          </tr>
        </table>

        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#ffffff;">
          <tr>
            <td style="padding:40px 24px 24px 24px;">
              ${bodyHtml}
            </td>
          </tr>
        </table>

        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="padding:20px 24px 0;">
              <hr style="border:none;border-top:1px solid #e7e7e7;width:100%;height:1px;margin:0;" />
            </td>
          </tr>
        </table>

        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#ffffff;">
          <tr>
            <td style="padding:24px;">
              <img src="https://res.cloudinary.com/dkomq1g9z/image/upload/v1756677524/checkmate_black_2_zbwvoa.png" alt="Checkmate Studios" style="height:35px;" />
            </td>
            <td align="right" valign="middle" style="padding:24px;">
              <a href="https://www.facebook.com/studios.checkmate" target="_blank" style="display:inline-block;margin:0 4px;text-decoration:none;">
                <img src="https://res.cloudinary.com/dkomq1g9z/image/upload/v1757974021/facebook_icon_fo8a64.png" alt="Facebook" style="height:25px;vertical-align:middle;" />
              </a>
              <a href="https://www.behance.net/checkmatestudios/" target="_blank" style="display:inline-block;margin:0 4px;text-decoration:none;">
                <img src="https://res.cloudinary.com/dkomq1g9z/image/upload/v1757974021/behance_logo_icon_i9br0d.png" alt="Behance" style="height:25px;vertical-align:middle;" />
              </a>
              <a href="https://www.instagram.com/studio_checkmate/" target="_blank" style="display:inline-block;margin:0 4px;text-decoration:none;">
                <img src="https://res.cloudinary.com/dkomq1g9z/image/upload/v1757974021/instagram_icon_vjwzpc.png" alt="Instagram" style="height:25px;vertical-align:middle;" />
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <div style="max-width:600px;margin:32px auto 0;text-align:center;">
    <div style="margin-top:12px;font-size:12px;color:#200e32;margin-bottom:12px;">
      Contact Us:
      <a href="mailto:hello@studiocheckmate.com" style="color:#FF6321;text-decoration:underline;">hello@studiocheckmate.com</a>
    </div>
    <div style="padding:18px 20px;font-size:12px;color:#121212;line-height:20px;">© ${new Date().getFullYear()} Checkmate Studios. All rights reserved.</div>
  </div>
</body>
</html>`;

export const accentBlock = (innerHtml: string): string => `
  <div style="background-color:#f6f6f6;padding:24px;border-radius:8px;margin:24px 0;border-left:4px solid #FF6321;">
    ${innerHtml}
  </div>
`;

export const labelledRow = (label: string, value: string): string => `
  <div style="margin-bottom:16px;padding:12px;background-color:#ffffff;border-radius:6px;border:1px solid #e7e7e7;">
    <div style="font-weight:500;font-size:14px;color:#666;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px;">${label}</div>
    <div style="font-size:16px;color:#191919;line-height:24px;">${value}</div>
  </div>
`;

export const ctaButton = (label: string, href: string): string => `
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:32px 0;">
    <tr>
      <td align="center">
        <a href="${href}" target="_blank" style="display:inline-block;background-color:#FF6321;border-radius:8px;padding:16px 32px;text-decoration:none;color:#ffffff;font-size:16px;font-weight:500;line-height:20px;">${label}</a>
      </td>
    </tr>
  </table>
`;

export const escapeHtml = (input: string): string =>
  input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
