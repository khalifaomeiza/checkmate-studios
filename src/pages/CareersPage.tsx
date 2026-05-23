import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { ArrowRight, ChevronLeft, MapPin, Clock, X } from 'lucide-react';
import { CareerApplicationForm } from '../forms/CareerApplicationForm';

export const CareersPage = () => {
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isApplying, setIsApplying] = useState(false);

  const jobs = [
    {
      id: 1,
      title: "Senior Visual Designer",
      category: "Design",
      location: "Remote / Lagos",
      type: "Full-time",
      description: "We're looking for a visionary designer to lead our branding projects and push the boundaries of visual storytelling.",
      responsibilities: [
        "Lead the visual direction for high-impact branding projects.",
        "Collaborate with cross-functional teams to deliver cohesive design systems.",
        "Mentor junior designers and provide constructive feedback.",
        "Stay ahead of design trends and implement innovative visual solutions."
      ],
      requirements: [
        "5+ years of experience in visual or brand design.",
        "Expertise in Adobe Creative Suite and Figma.",
        "Strong portfolio demonstrating high-end visual storytelling.",
        "Excellent communication and leadership skills."
      ]
    },
    {
      id: 2,
      title: "Product Designer (UI/UX)",
      category: "Design",
      location: "Remote",
      type: "Full-time",
      description: "Join our product team to build seamless digital experiences for our global clients.",
      responsibilities: [
        "Design intuitive user interfaces and user experiences.",
        "Conduct user research and translate findings into design solutions.",
        "Create wireframes, prototypes, and high-fidelity mockups.",
        "Work closely with developers to ensure design feasibility."
      ],
      requirements: [
        "3+ years of experience in UI/UX design.",
        "Proficiency in Figma and prototyping tools.",
        "Deep understanding of user-centered design principles.",
        "Experience working in an agile environment."
      ]
    },
    {
      id: 3,
      title: "Creative Technologist",
      category: "Engineering",
      location: "Hybrid / Lagos",
      type: "Full-time",
      description: "Bridge the gap between design and code. We need someone who can bring complex interactions to life.",
      responsibilities: [
        "Develop high-performance, interactive web experiences.",
        "Prototype experimental design concepts using code.",
        "Collaborate with designers to implement complex animations.",
        "Optimize web applications for maximum speed and scalability."
      ],
      requirements: [
        "Strong proficiency in React, TypeScript, and Framer Motion.",
        "Experience with WebGL or Three.js is a plus.",
        "A keen eye for design and attention to detail.",
        "Problem-solving mindset and passion for creative coding."
      ]
    },
    {
      id: 4,
      title: "Motion Graphics Artist",
      category: "Design",
      location: "Remote",
      type: "Contract",
      description: "Help us add life to our projects through high-end motion design and animation.",
      responsibilities: [
        "Create compelling motion graphics for digital and social media.",
        "Animate brand identities and UI interactions.",
        "Collaborate with the creative team on video production.",
        "Manage multiple projects from concept to final delivery."
      ],
      requirements: [
        "Expertise in After Effects, Cinema 4D, or similar tools.",
        "Strong sense of timing, rhythm, and motion principles.",
        "Ability to work independently and meet tight deadlines.",
        "Portfolio showcasing diverse motion design work."
      ]
    },
    {
      id: 5,
      title: "Studio Manager",
      category: "Operations",
      location: "Lagos",
      type: "Full-time",
      description: "Keep the studio running smoothly. You'll be the backbone of our creative operations.",
      responsibilities: [
        "Oversee day-to-day studio operations and logistics.",
        "Manage project timelines and resource allocation.",
        "Coordinate with clients and external partners.",
        "Foster a positive and productive studio culture."
      ],
      requirements: [
        "Experience in operations or project management within a creative agency.",
        "Exceptional organizational and multitasking abilities.",
        "Strong interpersonal and communication skills.",
        "Proficiency in project management tools."
      ]
    }
  ];

  const handleApplicationSuccess = () => {
    setIsApplying(false);
    setSelectedJob(null);
  };

  if (selectedJob && !isApplying) {
    return (
      <div className="min-h-screen bg-white pt-24">
        <div className="px-8 py-12 max-w-5xl mx-auto">
          <button 
            onClick={() => setSelectedJob(null)}
            className="flex items-center gap-2 text-gray-400 hover:text-brand-black mb-12 transition-colors group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium uppercase tracking-widest">Back to Careers</span>
          </button>

          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-20">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs font-medium uppercase tracking-widest text-brand-orange bg-brand-orange/10 px-3 py-1 rounded">
                  {selectedJob.category}
                </span>
                <span className="text-xs text-gray-400 uppercase tracking-widest font-medium">
                  {selectedJob.type}
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
                  Posted 2d ago
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsApplying(true)}
              className="bg-brand-black text-white px-10 py-5 rounded-full font-medium hover:bg-brand-orange transition-all duration-300 shadow-xl hover:shadow-brand-orange/20"
            >
              Apply for this position
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
            <div className="md:col-span-2 space-y-16">
              <section>
                <h2 className="text-2xl font-normal mb-6">About the Role</h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  {selectedJob.description}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-normal mb-6">Responsibilities</h2>
                <ul className="space-y-4">
                  {selectedJob.responsibilities.map((item: string, i: number) => (
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
                  {selectedJob.requirements.map((item: string, i: number) => (
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
                  {[
                    "Remote-first culture",
                    "Health & Wellness stipend",
                    "Annual studio retreats",
                    "Learning & Development budget",
                    "Cutting-edge equipment"
                  ].map((benefit, i) => (
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
    <div className="min-h-screen bg-white pt-24">
      {/* Hero */}
      <section className="pt-12 pb-20 px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl"
        >
          <h1 className="text-[clamp(3.25rem,11vw,8rem)] font-normal tracking-tighter mb-8">
            Join the <span className="text-brand-orange">Studio.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
            We're always looking for brilliant minds who believe that design can change the world. At Checkmate, we don't just fill roles; we build teams of visionaries.
          </p>
        </motion.div>
      </section>

      {/* Job List */}
      <section className="px-8 pb-32">
        <div className="flex items-center gap-4 mb-12">
          <h2 className="text-sm font-medium uppercase tracking-wider">Open Positions</h2>
          <div className="h-px flex-1 bg-brand-black/10" />
        </div>

        <div className="space-y-4">
          {jobs.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelectedJob(job)}
              className="group cursor-pointer bg-gray-50 hover:bg-brand-black hover:text-white p-8 rounded-3xl transition-all duration-500 flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-medium uppercase tracking-widest text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded">
                    {job.category}
                  </span>
                  <span className="text-xs opacity-40 uppercase tracking-widest font-medium">
                    {job.type}
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-normal tracking-tight">
                  {job.title}
                </h3>
              </div>
              
              <div className="flex items-center gap-8 text-sm opacity-60">
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  {job.location}
                </div>
                <div className="hidden md:flex items-center gap-2">
                  <Clock size={16} />
                  Posted 2d ago
                </div>
                <div className="w-12 h-12 rounded-full border border-current flex items-center justify-center group-hover:bg-brand-orange group-hover:border-brand-orange transition-colors">
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Application Modal */}
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
            >
              {/* Modal Header */}
              <div className="p-8 md:p-12 border-b border-gray-100 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-medium uppercase tracking-widest text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded">
                      {selectedJob.category}
                    </span>
                    <span className="text-xs text-gray-400 uppercase tracking-widest font-medium">
                      {selectedJob.type}
                    </span>
                  </div>
                  <h2 className="text-[clamp(1.75rem,4.2vw,3rem)] font-normal tracking-tighter mb-4">
                    Apply for {selectedJob.title}
                  </h2>
                  <p className="text-gray-500 max-w-xl">
                    {selectedJob.description}
                  </p>
                </div>
                <button 
                  onClick={() => setIsApplying(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Content / Form */}
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
