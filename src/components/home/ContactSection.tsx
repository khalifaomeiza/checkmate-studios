import { ContactForm as ContactFormFields } from '../../forms/ContactForm';

export const ContactSection = () => (
  <section id="contact" className="py-12 px-4 sm:px-6 md:px-8 w-full">
    <div className="bg-brand-black text-white rounded-3xl md:rounded-[40px] p-8 sm:p-12 md:p-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
      <div>
        {/* Continuous fluid ramp from ~36px (small phones) to ~100px (wide
            desktops). The old three-step ladder (text-5xl → 7xl → 100px) left
            tablets stuck at an awkward middle size. */}
        <h2 className="font-normal leading-[0.95] mb-10 sm:mb-12 text-[clamp(2.25rem,8vw,6.25rem)]">
          Feeling stuck on a project?
        </h2>
        <p className="text-white/60 text-[clamp(1rem,1.6vw,1.25rem)]">
          Let Checkmate Studio help you make the winning move.
        </p>
      </div>

      <ContactFormFields />
    </div>
  </section>
);
