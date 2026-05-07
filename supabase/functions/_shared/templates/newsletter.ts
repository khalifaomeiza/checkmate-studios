import { renderEmailShell, ctaButton, escapeHtml } from './shell.ts';

interface NewsletterWelcomeData {
  firstName?: string;
  email: string;
}

export const newsletterWelcomeEmail = (data: NewsletterWelcomeData) => {
  const greeting = data.firstName
    ? `Hi ${escapeHtml(data.firstName)}! 👋`
    : 'Hi there! 👋';

  const body = `
    <h1 style="font-weight:500;font-size:24px;margin:0 0 20px;line-height:32px;color:#191919;">${greeting}</h1>
    <p style="line-height:25px;font-size:16px;margin:0 0 16px;color:#191919;">
      Thank you for subscribing! We're thrilled to have you join the Checkmate Studios community.
    </p>
    <p style="line-height:25px;font-size:16px;margin:0 0 16px;color:#191919;">
      You'll be the first to know about our latest projects, creative insights, industry news, and exclusive resources.
    </p>

    <div style="background-color:#f6f6f6;padding:24px;border-radius:8px;margin:24px 0;border-left:4px solid #FF6321;">
      <h3 style="font-size:18px;font-weight:500;line-height:24px;color:#FF6321;margin:0 0 12px;">What to Expect</h3>
      <ul style="margin:0;padding:0;list-style:none;">
        <li style="margin-bottom:12px;line-height:24px;font-size:16px;color:#191919;">✓ Latest project showcases and case studies</li>
        <li style="margin-bottom:12px;line-height:24px;font-size:16px;color:#191919;">✓ Creative insights and design tips</li>
        <li style="margin-bottom:12px;line-height:24px;font-size:16px;color:#191919;">✓ Industry news and trends</li>
        <li style="margin-bottom:12px;line-height:24px;font-size:16px;color:#191919;">✓ Exclusive behind-the-scenes content</li>
        <li style="margin-bottom:12px;line-height:24px;font-size:16px;color:#191919;">✓ Early access to new resources and templates</li>
      </ul>
    </div>

    ${ctaButton('View Our Portfolio', 'https://www.behance.net/checkmatestudios/')}

    <div style="margin:24px 0;line-height:21px;font-size:14px;color:#191919;">
      <div>Best regards,</div>
      <div>The Checkmate Studios Team</div>
    </div>
  `;

  return {
    subject: 'Welcome to Checkmate Studios Newsletter! 🎨',
    html: renderEmailShell({
      title: 'Welcome to Checkmate Studios',
      preheader: 'You are now part of the Checkmate Studios community.',
      bodyHtml: body
    })
  };
};
