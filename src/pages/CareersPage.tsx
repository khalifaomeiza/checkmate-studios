import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { ArrowRight, MapPin, Clock, X } from 'lucide-react';
import { CareerApplicationForm } from '../forms/CareerApplicationForm';
import { BackButton } from '../components/ui/BackButton';
import { CAREERS_PAGE_FALLBACK, CAREER_JOBS_FALLBACK } from '../data/careers-fallback';
import { fetchCareersPageConfig, fetchPublishedCareerJobs, formatPostedAgo } from '../lib/careers-cms';
import type { CareerJob, CareersPageConfig } from '../types/cms';

export const CareersPage = () => {
  const [selectedJob, setSelectedJob] = useState<CareerJob | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [jobs, setJobs] = useState<CareerJob[]>(CAREER_JOBS_FALLBACK);
  const [pageConfig, setPageConfig] = useState<CareersPageConfig>(CAREERS_PAGE_FALLBACK);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setSyncing(true);
    void Promise.all([fetchPublishedCareerJobs(), fetchCareersPageConfig()])
      .then(([published, cfg]) => {
        if (cancelled) return;
        setJobs(published);
        setPageConfig(cfg);
      })
      .finally(() => {
        if (!cancelled) setSyncing(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleApplicationSuccess = () => {
    setIsApplying(false);
    setSelectedJob(null);
  };

  const benefits = pageConfig.benefits;

  if (selectedJob && !isApplying) {
    return (
      <div className="min-h-screen bg-white pt-24" data-testid="careers-job-detail">
        <div className="px-8 py-12 max-w-5xl mx-auto">
          <BackButton label="Back to Careers" onClick={() => setSelectedJob(null)} className="mb-12" />

          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-20">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs font-medium uppercase tracking-widest text-brand-orange bg-brand-orange/10 px-3 py-1 rounded">
                  {selectedJob.category}
                </span>
                <span className="text-xs text-gray-400 uppercase tracking-widest font-medium">
                  {selectedJob.employment_type}
                </span>
              </div>
              <h1 className="text-[clamp(2.5rem,7vw,4.5rem)] font-normal tracking-tighter mb-8">
                {selectedJob.title}
              </h1>
              <div className="flex flex-wrap gap-8 text-gray-500">
                <div className="flex items-center gap-2">
                  <MapPin size={18} />
                  {selectedJob.location}
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={18} />
                  {formatPostedAgo(selectedJob.posted_at)}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsApplying(true)}
              className="bg-brand-black text-white px-10 py-5 rounded-full font-medium hover:bg-brand-orange transition-all duration-300 shadow-xl hover:shadow-brand-orange/20"
              data-testid="careers-apply-open"
            >
              Apply for this position
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
            <div className="md:col-span-2 space-y-16">
              <section>
                <h2 className="text-2xl font-normal mb-6">About the Role</h2>
                <p className="text-xl text-gray-600 leading-relaxed">{selectedJob.description}</p>
              </section>

              <section>
                <h2 className="text-2xl font-normal mb-6">Responsibilities</h2>
                <ul className="space-y-4">
                  {selectedJob.responsibilities.map((item, i) => (
                    <li key={i} className="flex gap-4 text-gray-600 leading-relaxed">
                      <span className="text-brand-orange font-medium">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-normal mb-6">Requirements</h2>
                <ul className="space-y-4">
                  {selectedJob.requirements.map((item, i) => (
                    <li key={i} className="flex gap-4 text-gray-600 leading-relaxed">
                      <span className="text-brand-orange font-medium">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <div className="space-y-12">
              <div className="bg-gray-50 p-10 rounded-[40px]">
                <h3 className="text-xl font-normal mb-6">Why Checkmate?</h3>
                <ul className="space-y-6">
                  {benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24" data-testid="careers-page">
      {syncing ? (
        <div
          className="fixed top-24 right-6 z-50 rounded-full bg-brand-black/90 px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-white"
          aria-live="polite"
        >
          Syncing…
        </div>
      ) : null}
      <section className="pt-12 pb-20 px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
          <h1
            className="text-[clamp(3.25rem,11vw,8rem)] font-normal tracking-tighter mb-8"
            data-testid="careers-hero-title"
            // CMS-controlled headline (editors only)
            dangerouslySetInnerHTML={{ __html: pageConfig.heroTitleHtml }}
          />
          <p className="text-xl md:text-2xl text-gray-600 leading-relaxed" data-testid="careers-hero-subtitle">
            {pageConfig.heroSubtitle}
          </p>
        </motion.div>
      </section>

      <section className="px-8 pb-32">
        <div className="flex items-center gap-4 mb-12">
          <h2 className="text-sm font-medium uppercase tracking-wider">Open Positions</h2>
          <div className="h-px flex-1 bg-brand-black/10" />
        </div>

        <div className="space-y-4" data-testid="careers-job-list">
          {jobs.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelectedJob(job)}
              className="group cursor-pointer bg-gray-50 hover:bg-brand-black hover:text-white p-8 rounded-3xl transition-all duration-500 flex flex-col md:flex-row md:items-center justify-between gap-6"
              data-testid="careers-job-item"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-medium uppercase tracking-widest text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded">
                    {job.category}
                  </span>
                  <span className="text-xs opacity-40 uppercase tracking-widest font-medium">
                    {job.employment_type}
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-normal tracking-tight">{job.title}</h3>
              </div>

              <div className="flex items-center gap-8 text-sm opacity-60">
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  {job.location}
                </div>
                <div className="hidden md:flex items-center gap-2">
                  <Clock size={16} />
                  {formatPostedAgo(job.posted_at)}
                </div>
                <div className="w-12 h-12 rounded-full border border-current flex items-center justify-center group-hover:bg-brand-orange group-hover:border-brand-orange transition-colors">
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {selectedJob && isApplying && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsApplying(false)}
              className="absolute inset-0 bg-brand-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-3xl bg-white rounded-[40px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
              data-testid="careers-apply-modal"
            >
              <div className="p-8 md:p-12 border-b border-gray-100 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-medium uppercase tracking-widest text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded">
                      {selectedJob.category}
                    </span>
                    <span className="text-xs text-gray-400 uppercase tracking-widest font-medium">
                      {selectedJob.employment_type}
                    </span>
                  </div>
                  <h2 className="text-[clamp(1.75rem,4.2vw,3rem)] font-normal tracking-tighter mb-4">
                    Apply for {selectedJob.title}
                  </h2>
                  <p className="text-gray-500 max-w-xl">{selectedJob.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsApplying(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close application form"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 md:p-12">
                <CareerApplicationForm
                  job={{
                    id: selectedJob.id,
                    title: selectedJob.title,
                    description: selectedJob.description
                  }}
                  onSuccess={handleApplicationSuccess}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
