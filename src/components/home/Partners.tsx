import { PARTNER_LOGOS } from '../../data/partners';

export const Partners = () => (
  <section className="px-8 py-12 w-full">
    <div className="bg-brand-black text-white rounded-3xl md:rounded-[40px] p-12 md:p-20">
      <div className="flex items-center gap-4 mb-12">
        <h2 className="text-2xl font-medium flex items-center gap-2">
          Partners <span className="w-2 h-2 bg-white rounded-full inline-block" />
        </h2>
        <div className="h-px flex-1 bg-white/20" />
      </div>
      <p className="text-xl text-white/60 mb-12">
        Here is a little hall of fame for every game that ended in checkmate!
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 items-center">
        {PARTNER_LOGOS.map((partner) => (
          <div
            key={partner.src}
            className="flex h-16 md:h-20 items-center justify-center rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10 transition hover:bg-white/10"
          >
            <img
              src={partner.src}
              alt={partner.alt}
              className="max-h-10 md:max-h-14 w-auto max-w-full object-contain opacity-90 transition-opacity hover:opacity-100"
            />
          </div>
        ))}
      </div>
    </div>
  </section>
);
