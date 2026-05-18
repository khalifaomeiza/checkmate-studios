import {
  renderEmailShell,
  ctaButton,
  accentBlock,
  labelledRow,
  escapeHtml,
  emailH1,
  emailH2,
  emailP
} from './shell.ts';

interface ContactData {
  name: string;
  email: string;
  service?: string;
  budget?: string;
  projectDetails?: string;
}

const linkStyle = 'color:#26251e;text-decoration:underline;';

export const contactUserEmail = (data: ContactData) => {
  const summary = data.projectDetails
    ? `<div style="padding:14px;border:1px solid #26251e26;border-radius:6px;white-space:pre-line;line-height:1.65;font-family:Georgia,serif;font-size:15px;color:#26251e;">${escapeHtml(
        data.projectDetails
      )}</div>`
    : '<p style="color:#26251e99;font-style:italic;margin:0;font-size:15px;font-family:Georgia,serif;">We will reach out to gather your project details.</p>';

  const body = `
    ${emailH1(`Thank you, ${escapeHtml(data.name)}`)}
    ${emailP(
      "We've received your message and are excited to learn more about your project. Our team will review your inquiry and respond within 24 hours."
    )}

    ${accentBlock(`
      ${emailH2('Your message summary')}
      ${summary}
    `)}

    ${emailP(
      'While you wait, feel free to explore our portfolio. We are passionate about bringing ambitious ideas to life.'
    )}

    ${ctaButton('View our portfolio', 'https://www.behance.net/checkmatestudios/')}
  `;

  return {
    subject: "Thank you for contacting Checkmate Studios — we'll be in touch soon",
    html: renderEmailShell({
      title: 'Thank you for contacting Checkmate Studios',
      preheader: "We've received your message and will reply within 24 hours.",
      docHeader: {
        eyebrow: 'Contact',
        title: 'Message received',
        forName: data.name
      },
      bodyHtml: body
    })
  };
};

export const contactAdminEmail = (data: ContactData) => {
  const body = `
    ${emailH1('New contact form submission')}
    ${emailP('A new project inquiry came through the Checkmate Studios website.')}

    ${accentBlock(`
      ${emailH2('Contact details')}
      ${labelledRow('Full name', escapeHtml(data.name))}
      ${labelledRow(
        'Email',
        `<a href="mailto:${escapeHtml(data.email)}" style="${linkStyle}">${escapeHtml(
          data.email
        )}</a>`
      )}
      ${data.service ? labelledRow('Service', escapeHtml(data.service)) : ''}
      ${data.budget ? labelledRow('Budget', escapeHtml(data.budget)) : ''}
      ${labelledRow(
        'Project details',
        data.projectDetails
          ? `<div style="white-space:pre-line;">${escapeHtml(data.projectDetails)}</div>`
          : '<em>Not provided</em>'
      )}
      <div style="margin-top:16px;font-family:Menlo,monospace;font-size:11px;color:#26251e99;">
        Submitted: ${escapeHtml(new Date().toLocaleString())}
      </div>
    `)}

    ${emailP('Please reply to this lead within 24 hours to maintain our service standards.')}
  `;

  return {
    subject: `New contact form submission from ${data.name}`,
    html: renderEmailShell({
      title: 'New contact form submission',
      preheader: `${data.name} just sent a message via the website.`,
      docHeader: {
        eyebrow: 'Internal',
        title: 'Website inquiry',
        forName: data.name
      },
      bodyHtml: body
    })
  };
};
