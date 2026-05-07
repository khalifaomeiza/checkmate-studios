import {
  renderEmailShell,
  ctaButton,
  accentBlock,
  labelledRow,
  escapeHtml
} from './shell.ts';

interface ContactData {
  name: string;
  email: string;
  service?: string;
  budget?: string;
  projectDetails?: string;
}

export const contactUserEmail = (data: ContactData) => {
  const summary = data.projectDetails
    ? `<div style="background-color:#ffffff;padding:16px;border-radius:6px;border:1px solid #e7e7e7;white-space:pre-line;line-height:24px;font-style:italic;color:#666;">${escapeHtml(
        data.projectDetails
      )}</div>`
    : '<p style="color:#888;font-style:italic;margin:0;">We will reach out to gather your project details.</p>';

  const body = `
    <h1 style="font-weight:500;font-size:24px;margin:0 0 20px;line-height:32px;color:#191919;">Thank you, ${escapeHtml(
      data.name
    )}! 🎉</h1>
    <p style="line-height:25px;font-size:16px;margin:0 0 16px;color:#191919;">
      We've received your message and are excited to learn more about your project. Our team will review your inquiry and respond within 24 hours.
    </p>

    ${accentBlock(`
      <h3 style="font-size:18px;font-weight:500;line-height:24px;color:#FF6321;margin:0 0 12px;">Your Message Summary</h3>
      ${summary}
    `)}

    <p style="line-height:25px;font-size:16px;margin:0 0 16px;color:#191919;">
      While you wait, feel free to explore our portfolio. We're passionate about bringing innovative ideas to life.
    </p>

    ${ctaButton('View Our Portfolio', 'https://www.behance.net/checkmatestudios/')}

    <div style="margin:24px 0;line-height:21px;font-size:14px;color:#191919;">
      <div>Best regards,</div>
      <div>The Checkmate Studios Team</div>
    </div>
  `;

  return {
    subject: "Thank you for contacting Checkmate Studios — we'll be in touch soon ✨",
    html: renderEmailShell({
      title: 'Thank you for contacting Checkmate Studios',
      preheader: "We've received your message and will reply within 24 hours.",
      bodyHtml: body
    })
  };
};

export const contactAdminEmail = (data: ContactData) => {
  const body = `
    <h1 style="font-weight:500;font-size:24px;margin:0 0 20px;line-height:32px;color:#191919;">New Contact Form Submission 👋</h1>
    <p style="line-height:25px;font-size:16px;margin:0 0 16px;color:#191919;">
      A new project inquiry just came through the Checkmate Studios website.
    </p>

    ${accentBlock(`
      <h3 style="font-size:18px;font-weight:500;line-height:24px;color:#FF6321;margin:0 0 16px;">Contact Details</h3>
      ${labelledRow('Full Name', escapeHtml(data.name))}
      ${labelledRow(
        'Email',
        `<a href="mailto:${escapeHtml(data.email)}" style="color:#FF6321;text-decoration:none;">${escapeHtml(
          data.email
        )}</a>`
      )}
      ${data.service ? labelledRow('Service', escapeHtml(data.service)) : ''}
      ${data.budget ? labelledRow('Budget', escapeHtml(data.budget)) : ''}
      ${labelledRow(
        'Project Details',
        data.projectDetails
          ? `<div style="white-space:pre-line;">${escapeHtml(data.projectDetails)}</div>`
          : '<em>Not provided</em>'
      )}
      <div style="margin-top:20px;font-size:12px;color:#666;font-style:italic;text-align:right;">
        Submitted on: ${new Date().toLocaleString()}
      </div>
    `)}

    <p style="line-height:25px;font-size:16px;margin:16px 0;color:#191919;">
      Please reply to this lead within 24 hours to maintain our service standards.
    </p>
  `;

  return {
    subject: `New Contact Form Submission from ${data.name}`,
    html: renderEmailShell({
      title: 'New contact form submission',
      preheader: `${data.name} just sent a message via the website.`,
      bodyHtml: body
    })
  };
};
