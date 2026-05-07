import {
  renderEmailShell,
  accentBlock,
  labelledRow,
  ctaButton,
  escapeHtml
} from './shell.ts';

interface CareerData {
  fullName: string;
  email: string;
  jobTitle: string;
  jobId: string | number;
  portfolioUrl?: string;
  resumeUrl?: string;
  resumeName?: string;
  coverLetter?: string;
}

export const careerApplicantEmail = (data: CareerData) => {
  const body = `
    <h1 style="font-weight:500;font-size:24px;margin:0 0 20px;line-height:32px;color:#191919;">Hi ${escapeHtml(
      data.fullName
    )} 👋</h1>
    <p style="line-height:25px;font-size:16px;margin:0 0 16px;color:#191919;">
      Thank you for applying for the <strong>${escapeHtml(
        data.jobTitle
      )}</strong> role at Checkmate Studios. We've received your application and our team will review it within 5–7 business days.
    </p>

    ${accentBlock(`
      <h3 style="font-size:18px;font-weight:500;color:#FF6321;margin:0 0 12px;">What happens next</h3>
      <ul style="margin:0;padding-left:20px;color:#191919;">
        <li style="margin-bottom:8px;">We review every application personally</li>
        <li style="margin-bottom:8px;">If your background fits, we'll invite you for an intro chat</li>
        <li style="margin-bottom:8px;">We aim to respond to every applicant — successful or not</li>
      </ul>
    `)}

    ${ctaButton('Explore Our Work', 'https://www.behance.net/checkmatestudios/')}

    <div style="margin:24px 0;line-height:21px;font-size:14px;color:#191919;">
      <div>Best regards,</div>
      <div>The Checkmate Studios Team</div>
    </div>
  `;

  return {
    subject: `We've received your application — ${data.jobTitle}`,
    html: renderEmailShell({
      title: 'Application received',
      preheader: `Thanks for applying to Checkmate Studios for the ${data.jobTitle} role.`,
      bodyHtml: body
    })
  };
};

export const careerAdminEmail = (data: CareerData) => {
  const portfolio = data.portfolioUrl
    ? `<a href="${escapeHtml(data.portfolioUrl)}" style="color:#FF6321;">${escapeHtml(
        data.portfolioUrl
      )}</a>`
    : '<em>Not provided</em>';

  const resume = data.resumeUrl
    ? `<a href="${escapeHtml(data.resumeUrl)}" style="color:#FF6321;">${escapeHtml(
        data.resumeName ?? 'Download resume'
      )}</a>`
    : '<em>Attached to this email</em>';

  const body = `
    <h1 style="font-weight:500;font-size:24px;margin:0 0 20px;line-height:32px;color:#191919;">New career application 🎯</h1>
    <p style="line-height:25px;font-size:16px;margin:0 0 16px;color:#191919;">
      A new applicant just submitted an application via the careers page.
    </p>

    ${accentBlock(`
      <h3 style="font-size:18px;font-weight:500;color:#FF6321;margin:0 0 16px;">Applicant Details</h3>
      ${labelledRow('Position', `${escapeHtml(data.jobTitle)} (#${escapeHtml(String(data.jobId))})`)}
      ${labelledRow('Full Name', escapeHtml(data.fullName))}
      ${labelledRow(
        'Email',
        `<a href="mailto:${escapeHtml(data.email)}" style="color:#FF6321;">${escapeHtml(data.email)}</a>`
      )}
      ${labelledRow('Portfolio', portfolio)}
      ${labelledRow('Resume', resume)}
      ${labelledRow(
        'Cover Letter',
        data.coverLetter
          ? `<div style="white-space:pre-line;">${escapeHtml(data.coverLetter)}</div>`
          : '<em>Not provided</em>'
      )}
      <div style="margin-top:20px;font-size:12px;color:#666;font-style:italic;text-align:right;">
        Submitted on: ${new Date().toLocaleString()}
      </div>
    `)}
  `;

  return {
    subject: `New application — ${data.jobTitle} from ${data.fullName}`,
    html: renderEmailShell({
      title: 'New career application',
      preheader: `${data.fullName} just applied for ${data.jobTitle}.`,
      bodyHtml: body
    })
  };
};
