

/** Proposal template cloud; override via env for your own Cloudinary folder */
const DEFAULT_LOGO =
  'https://res.cloudinary.com/dliesrplu/image/upload/v1777156476/Checkmate_logo_icon_is85cs.png';
const DEFAULT_FOOTER_STRIP =
  'https://res.cloudinary.com/dliesrplu/image/upload/v1776887718/Group_4_2_wnxerp.png';

const logoUrl = (): string => Deno.env.get('EMAIL_LOGO_URL') ?? DEFAULT_LOGO;
const footerStripUrl = (): string =>
  Deno.env.get('EMAIL_FOOTER_STRIP_URL') ?? DEFAULT_FOOTER_STRIP;

const FONT_SERIF = "Georgia,'Times New Roman',Times,serif";
const FONT_MONO = "Menlo,Consolas,'Courier New',monospace";

export const escapeHtml = (input: string): string =>
  input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
export interface EmailDocHeader {
  eyebrow: string;
  title: string;
  /** Renders "For **name**" on the right */
  forName?: string;
  /** ISO or display string; if omitted, uses locale date */
  date?: string;
}

export interface ShellOptions {
  /** <title> + accessible document title */
  title: string;
  bodyHtml: string;
  preheader?: string;
  docHeader?: EmailDocHeader;
  /**
   * Grey signature block above the link footer (Georgia 13px).
   * Default: Checkmate Studios sign-off.
   */
  signOffHtml?: string;
}

const formatDocDate = (): string =>
  new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

const docHeaderRow = (doc: EmailDocHeader): string => {
  const date = doc.date ?? formatDocDate();
  const forBlock = doc.forName
    ? `<div>For <strong style="color:#26251e;">${escapeHtml(doc.forName)}</strong></div>
          <div style="margin-top:4px;font-family:${FONT_MONO};color:#26251e80;">${escapeHtml(date)}</div>`
    : `<div style="font-family:${FONT_MONO};color:#26251e80;">${escapeHtml(date)}</div>`;

  return `<tr><td style="padding:28px 40px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td>
          <div style="font-family:${FONT_MONO};font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#26251e80;">${escapeHtml(doc.eyebrow)}</div>
          <div style="font-family:${FONT_SERIF};font-size:24px;color:#26251e;margin-top:6px;letter-spacing:-0.4px;">${escapeHtml(doc.title)}</div>
        </td>
        <td style="text-align:right;font-size:12px;color:#26251eaa;vertical-align:top;">
          ${forBlock}
        </td>
      </tr></table>
    </td></tr>`;
};

const defaultSignOff = `The Checkmate Studios Team<br/><em>Checkmate</em>`;

export const renderEmailShell = ({
  title,
  bodyHtml,
  preheader = '',
  docHeader,
  signOffHtml = defaultSignOff
}: ShellOptions): string => `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:24px;background:#f3efe8;font-family:${FONT_SERIF};color:#26251e;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}</div>` : ''}
  <table align="center" width="600" cellpadding="0" cellspacing="0" border="0" style="background:#fffdf8;border-radius:8px;overflow:hidden;max-width:600px;width:100%;border:1px solid #26251e1a;border-collapse:separate;">
    <tr><td style="padding:32px 40px 24px;border-bottom:1px solid #26251e26;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="vertical-align:middle;">
          <table cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="padding-right:12px;"><img src="${logoUrl()}" alt="Checkmate" width="40" height="40" style="display:block;border:0;outline:none;" /></td>
            <td style="vertical-align:middle;">
              <div style="font-family:${FONT_SERIF};font-size:22px;color:#26251e;letter-spacing:-0.3px;">Checkmate</div>
              <div style="font-family:${FONT_MONO};font-size:11px;color:#26251e99;margin-top:2px;">studiocheckmate.com · hello@studiocheckmate.com</div>
            </td>
          </tr></table>
        </td>
      </tr></table>
    </td></tr>
    ${docHeader ? docHeaderRow(docHeader) : ''}
    <tr><td style="padding:24px 40px 8px;">
      ${bodyHtml}
    </td></tr>
    <tr><td style="padding:8px 40px 24px;font-family:${FONT_SERIF};font-size:13px;color:#26251eaa;">
      ${signOffHtml}
    </td></tr>
    <tr><td style="padding:24px 40px;border-top:1px solid #26251e26;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font-family:${FONT_MONO};font-size:11px;color:#26251e99;line-height:1.7;">
          <a href="https://studiocheckmate.com/" style="color:#26251e99;text-decoration:none;">studiocheckmate.com</a> ·
          <a href="mailto:hello@studiocheckmate.com" style="color:#26251e99;text-decoration:none;">hello@studiocheckmate.com</a> ·
          <a href="tel:+2348076845495" style="color:#26251e99;text-decoration:none;">+2348076845495</a><br/>
          Instagram <a href="https://instagram.com/studio_checkmate" style="color:#26251e99;text-decoration:none;">@studio_checkmate</a> ·
          <a href="https://www.behance.net/checkmatestudios" style="color:#26251e99;text-decoration:none;">Behance /checkmatestudios</a>
        </td></tr>
      </table>
    </td></tr>
    <tr><td style="padding:0;line-height:0;font-size:0;">
      <img src="${footerStripUrl()}" alt="Checkmate" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;" />
    </td></tr>
  </table>
</body></html>`;

const FONT_STACK = FONT_SERIF;

export const accentBlock = (innerHtml: string): string => `
  <div style="background:#f3efe8;padding:20px 20px;border-radius:8px;margin:20px 0;border:1px solid #26251e26;">
    ${innerHtml}
  </div>
`;

export const labelledRow = (label: string, value: string): string => `
  <div style="margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid #26251e26;">
    <div style="font-family:${FONT_MONO};font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#26251e99;margin-bottom:6px;">${label}</div>
    <div style="font-size:15px;color:#26251e;line-height:1.65;font-family:${FONT_STACK};">${value}</div>
  </div>
`;

export const ctaButton = (label: string, href: string): string => `
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:28px 0;">
    <tr>
      <td align="left">
        <a href="${href}" target="_blank" style="display:inline-block;background:#26251e;border-radius:6px;padding:14px 28px;text-decoration:none;color:#fffdf8;font-size:15px;font-family:${FONT_STACK};letter-spacing:-0.2px;">${label}</a>
      </td>
    </tr>
  </table>
`;

/** H1 inside body — matches proposal */
export const emailH1 = (text: string): string =>
  `<h1 style="font-family:${FONT_SERIF};font-size:28px;font-weight:normal;color:#26251e;margin:8px 0 12px;letter-spacing:-0.5px;line-height:1.2;">${text}</h1>`;

export const emailH2 = (text: string): string =>
  `<h2 style="font-family:${FONT_SERIF};font-size:20px;font-weight:normal;color:#26251e;margin:22px 0 10px;line-height:1.25;">${text}</h2>`;

export const emailP = (text: string): string =>
  `<p style="margin:0 0 14px;color:#26251e;font-size:15px;line-height:1.65;font-family:${FONT_SERIF};">${text}</p>`;
