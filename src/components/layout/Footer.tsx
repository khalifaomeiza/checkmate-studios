import { NewsletterForm } from '../../forms/NewsletterForm';
import { FOOTER_SOCIALS } from '../../lib/socials';
import { SOCIAL_ICONS } from '../../lib/social-icons';

export const Footer = () => (
  <footer className="w-full overflow-hidden">
    <div className="w-full h-px bg-brand-black/10" />
    <div className="pt-12 pb-12 px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 md:mb-24">
      <div>
        <div className="flex justify-between items-center mb-6">
          <p className="text-xs uppercase tracking-widest text-gray-400">STAY UP TO DATE</p>
          <div className="flex gap-2 md:hidden">
            {FOOTER_SOCIALS.map((social) => {
              const Icon = SOCIAL_ICONS[social.name];
              return (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.ariaLabel}
                  className="p-2 bg-gray-100 rounded-full hover:bg-brand-orange hover:text-white transition-all"
                >
                  <Icon size={16} />
                </a>
              );
            })}
          </div>
        </div>
        <h2 className="text-[clamp(1.875rem,5.5vw,3.75rem)] font-medium mb-6">Get our newsletter</h2>
        <NewsletterForm variant="footer" source="footer" />
      </div>

      <div className="hidden md:flex flex-col items-end justify-end">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-12">SOCIAL MEDIA</p>
        <div className="flex gap-3">
          {FOOTER_SOCIALS.map((social) => {
            const Icon = SOCIAL_ICONS[social.name];
            return (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.ariaLabel}
                className="p-3 bg-gray-100 rounded-full hover:bg-brand-orange hover:text-white transition-all"
              >
                <Icon size={24} />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  </div>
  
  <div className="w-full">
      <img 
        src="https://res.cloudinary.com/dliesrplu/image/upload/v1776887718/Group_4_2_wnxerp.png" 
        alt="CHECKMATE" 
        className="w-full h-auto block"
        referrerPolicy="no-referrer"
      />
    </div>
  </footer>
);
