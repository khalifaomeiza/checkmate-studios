import {
  renderEmailShell,
  ctaButton,
  escapeHtml,
  emailH1,
  emailH2,
  emailP
} from './shell.ts';

interface NewsletterWelcomeData {
  firstName?: string;
  email: string;
}

export const newsletterWelcomeEmail = (data: NewsletterWelcomeData) => {
  const greeting = data.firstName
    ? `Hi ${escapeHtml(data.firstName)}`
    : 'Hi there';

  const recipientLabel = data.firstName ?? 'Subscriber';

  const body = `
    ${emailH1(greeting)}
    ${emailP(
      'Thank you for subscribing. We are glad to have you in the Checkmate Studios community.'
    )}
    ${emailP(
      "You'll be among the first to hear about new work, creative notes, and resources."
    )}

    <div style="background:#f3efe8;padding:20px 20px;border-radius:8px;margin:20px 0;border:1px solid #26251e26;">
      ${emailH2('What to expect')}
      <ul style="margin:0 0 0 20px;padding:0;color:#26251e;font-size:15px;line-height:1.6;font-family:Georgia,serif;">
        <li style="margin:0 0 6px;">Project showcases and case studies</li>
        <li style="margin:0 0 6px;">Design and brand thinking</li>
        <li style="margin:0 0 6px;">Occasional studio news</li>
        <li style="margin:0 0 6px;">Early access to new resources when we release them</li>
      </ul>
    </div>

    ${ctaButton('View our portfolio', 'https://www.behance.net/checkmatestudios/')}
  `;

  return {
    subject: 'Welcome to the Checkmate Studios newsletter',
    html: renderEmailShell({
      title: 'Welcome to Checkmate Studios',
      preheader: 'You are now on the list for Checkmate Studios updates.',
      docHeader: {
        eyebrow: 'Newsletter',
        title: 'You are subscribed',
        forName: recipientLabel
      },
      bodyHtml: body
    })
  };
};
