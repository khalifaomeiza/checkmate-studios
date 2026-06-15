import { motion } from 'motion/react';
import type { CaseStudy } from '../../types/case-study';
import { BackButton } from '../ui/BackButton';
import { CaseStudyBlockView } from './CaseStudyBlockView';
import { CaseStudyMediaImage } from './CaseStudyMediaImage';
import { CASE_STUDY_BLOCK, CASE_STUDY_SECTIONS, CASE_STUDY_SHELL } from './caseStudyLayout';

export const CaseStudyView = ({ study }: { study: CaseStudy }) => (
  <article className="min-h-screen bg-white pt-24 pb-24">
    <div className={CASE_STUDY_SHELL}>
      <BackButton to="/works" label="Back to Works" className="mb-10" />

      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mb-10 md:mb-12"
      >
        <div className="flex flex-wrap items-center gap-3 mb-6 text-sm text-gray-400">
          {study.category ? (
            <span className="bg-brand-orange/10 text-brand-orange px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider">
              {study.category}
            </span>
          ) : null}
          {study.year ? <span>{study.year}</span> : null}
          {study.client ? (
            <>
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <span>{study.client}</span>
            </>
          ) : null}
        </div>
        <h1 className="text-[clamp(2.5rem,8vw,5rem)] font-normal tracking-tighter leading-[0.95] mb-5">
          {study.title}
        </h1>
        {study.subtitle ? (
          <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">{study.subtitle}</p>
        ) : null}
      </motion.header>

      {study.cover_url ? (
        <div className="mb-8 md:mb-10 overflow-hidden rounded-xl bg-[#ececec]">
          <CaseStudyMediaImage
            src={study.cover_url}
            alt=""
            width={study.cover_width ?? undefined}
            height={study.cover_height ?? undefined}
            priority
            className="w-full"
          />
        </div>
      ) : null}

      <div className={CASE_STUDY_SECTIONS}>
        {(study.blocks ?? []).map((block, index) => (
          <section key={block.id} className={CASE_STUDY_BLOCK}>
            <CaseStudyBlockView block={block} priority={index === 0 && !study.cover_url} />
          </section>
        ))}
      </div>
    </div>
  </article>
);
