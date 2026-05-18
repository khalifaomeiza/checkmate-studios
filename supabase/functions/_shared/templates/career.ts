import {
  renderEmailShell,
  accentBlock,
  labelledRow,
  ctaButton,
  escapeHtml,
  emailH1,
  emailH2,
  emailP
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

const linkStyle = 'color:#26251e;text-decoration:underline;';

export const careerApplicantEmail = (data: CareerData) => {
  const body = `
    ${emailH1(`Hi ${escapeHtml(data.fullName)}`)}
    ${emailP(
      `Thank you for applying for the <strong>${escapeHtml(
        data.jobTitle
      )}</strong> role at Checkmate Studios. We've received your application and our team will review it within 5–7 business days.`
    )}

    ${accentBlock(`
      ${emailH2('What happens next')}
      <ul style="margin:0 0 0 20px;padding:0;color:#26251e;font-size:15px;line-height:1.6;font-family:Georgia,serif;">
        <li style="margin:0 0 6px;">We review every application personally.</li>
        <li style="margin:0 0 6px;">If your background fits, we'll invite you for an intro chat.</li>
        <li style="margin:0 0 6px;">We aim to respond to every applicant.</li>
      </ul>
    `)}

    ${ctaButton('Explore our work', 'https://www.behance.net/checkmatestudios/')}
  `;

  return {
    subject: `We've received your application — ${data.jobTitle}`,
    html: renderEmailShell({
      title: 'Application received',
      preheader: `Thanks for applying to Checkmate Studios for the ${data.jobTitle} role.`,
      docHeader: {
        eyebrow: 'Careers',
        title: 'Application received',
        forName: data.fullName
      },
      bodyHtml: body
    })
  };
};

export const careerAdminEmail = (data: CareerData) => {
  const portfolio = data.portfolioUrl
    ? `<a href="${escapeHtml(data.portfolioUrl)}" style="${linkStyle}">${escapeHtml(
        data.portfolioUrl
      )}</a>`
    : '<em>Not provided</em>';

  const resume = data.resumeUrl
    ? `<a href="${escapeHtml(data.resumeUrl)}" style="${linkStyle}">${escapeHtml(
        data.resumeName ?? 'Download resume'
      )}</a>`
    : '<em>Attached to this email</em>';

  const body = `
    ${emailH1('New career application')}
    ${emailP('A new applicant submitted an application via the careers page.')}

    ${accentBlock(`
      ${emailH2('Applicant details')}
      ${labelledRow('Position', `${escapeHtml(data.jobTitle)} (#${escapeHtml(String(data.jobId))})`)}
      ${labelledRow('Full name', escapeHtml(data.fullName))}
      ${labelledRow(
        'Email',
        `<a href="mailto:${escapeHtml(data.email)}" style="${linkStyle}">${escapeHtml(data.email)}</a>`
      )}
      ${labelledRow('Portfolio', portfolio)}
      ${labelledRow('Resume', resume)}
      ${labelledRow(
        'Cover letter',
        data.coverLetter
          ? `<div style="white-space:pre-line;">${escapeHtml(data.coverLetter)}</div>`
          : '<em>Not provided</em>'
      )}
      <div style="margin-top:16px;font-family:Menlo,monospace;font-size:11px;color:#26251e99;">
        Submitted: ${escapeHtml(new Date().toLocaleString())}
      </div>
    `)}
  `;

  return {
    subject: `New application — ${data.jobTitle} from ${data.fullName}`,
    html: renderEmailShell({
      title: 'New career application',
      preheader: `${data.fullName} just applied for ${data.jobTitle}.`,
      docHeader: {
        eyebrow: 'Internal',
        title: 'Careers application',
        forName: data.fullName
      },
      bodyHtml: body
    })
  };
};
