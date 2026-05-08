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
  <meta name="x-apple-disable-message-reformatting" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f0f0;font-family:Arial,Helvetica,sans-serif;color:#191919;width:100%;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}</div>` : ''}

  <!-- Outer wrapper: full-width centering table.
       This is the bulletproof pattern that works across Apple Mail,
       Gmail, Outlook, and iOS Mail without box-sizing surprises. -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#f0f0f0" style="background-color:#f0f0f0;width:100%;border-collapse:collapse;">
    <tr>
      <td align="center" valign="top" style="padding:32px 16px;">

        <!-- Inner content card, capped at 600px and centred via align="center" + margin:auto. -->
        <table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:8px;border:1px solid #ededed;border-collapse:separate;">
          <tr>
            <td>
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#ffffff;">
          <tr>
            <td align="left" valign="middle" style="padding:24px;">
              <img
                src="https://res.cloudinary.com/dkomq1g9z/image/upload/v1757974053/checkmate_newLogo_t8uyte.png"
                alt="Checkmate Studios"
                width="160"
                height="22"
                style="display:block;width:160px;height:22px;border:0;outline:none;text-decoration:none;"
              />
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
            <td align="center" valign="middle" style="padding:28px 24px 32px 24px;">
              <!-- Footer wordmark — stacked Checkmate logo (291x144 native, 2:1 aspect). -->
              <img
                src="https://res.cloudinary.com/dkomq1g9z/image/upload/v1756677524/checkmate_black_2_zbwvoa.png"
                alt="Checkmate Studios"
                width="70"
                height="35"
                style="display:block;width:70px;height:35px;border:0;outline:none;text-decoration:none;margin:0 auto 18px auto;"
              />

              <!-- Social icons row (nested centred table for cross-client reliability) -->
              <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
                <tr>
                  <td align="center" valign="middle" style="padding:0 6px;">
                    <a href="https://www.facebook.com/studios.checkmate" target="_blank" style="text-decoration:none;display:inline-block;">
                      <img
                        src="https://res.cloudinary.com/dkomq1g9z/image/upload/v1757974021/facebook_icon_fo8a64.png"
                        alt="Facebook"
                        width="24"
                        height="24"
                        style="display:block;width:24px;height:24px;border:0;outline:none;"
                      />
                    </a>
                  </td>
                  <td align="center" valign="middle" style="padding:0 6px;">
                    <a href="https://www.behance.net/checkmatestudios/" target="_blank" style="text-decoration:none;display:inline-block;">
                      <img
                        src="https://res.cloudinary.com/dkomq1g9z/image/upload/v1757974021/behance_logo_icon_i9br0d.png"
                        alt="Behance"
                        width="24"
                        height="24"
                        style="display:block;width:24px;height:24px;border:0;outline:none;"
                      />
                    </a>
                  </td>
                  <td align="center" valign="middle" style="padding:0 6px;">
                    <a href="https://www.instagram.com/studio_checkmate/" target="_blank" style="text-decoration:none;display:inline-block;">
                      <img
                        src="https://res.cloudinary.com/dkomq1g9z/image/upload/v1757974021/instagram_icon_vjwzpc.png"
                        alt="Instagram"
                        width="24"
                        height="24"
                        style="display:block;width:24px;height:24px;border:0;outline:none;"
                      />
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
          </td>
        </tr>
        </table>
        <!-- /Inner content card -->

      </td>
    </tr>
  </table>
  <!-- /Outer wrapper (white card only) -->

  <!-- Sub-footer — sibling of the wrapper, sits directly on the gray canvas.
       Uses its own full-width centering table so it stays aligned with the
       card above without inheriting any of its layout context. -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#f0f0f0" style="background-color:#f0f0f0;width:100%;border-collapse:collapse;">
    <tr>
      <td align="center" valign="top" style="padding:0 16px 32px 16px;">
        <table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;margin:0 auto;">
          <tr>
            <td align="center" valign="top" style="padding:24px 16px 0 16px;text-align:center;font-size:12px;color:#200e32;line-height:18px;">
              Contact Us:
              <a href="mailto:hello@studiocheckmate.com" style="color:#FF6321;text-decoration:underline;">hello@studiocheckmate.com</a>
            </td>
          </tr>
          <tr>
            <td align="center" valign="top" style="padding:14px 16px 0 16px;text-align:center;font-size:12px;color:#121212;line-height:20px;">
              © ${new Date().getFullYear()} Checkmate Studios. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  <!-- /Sub-footer -->
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
