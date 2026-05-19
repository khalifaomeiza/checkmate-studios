import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

export const Testimonial = () => {
  const testimonials = [
    {
      quote: "The high level of professionalism and quality of work was impressive. We couldn't have been able to achieve this much without you.",
      author: "Damian, Product Lead",
      company: "Cloudify"
    },
    {
      quote: "Checkmate Studios transformed our vision into a stunning reality. Their attention to detail and creative flair are unmatched.",
      author: "Sarah Chen, CEO",
      company: "TechFlow"
    },
    {
      quote: "Working with this team was a game-changer for our brand. They delivered beyond our expectations and on a very tight schedule.",
      author: "Marcus Thorne, Founder",
      company: "Vanguard"
    },
    {
      quote: "The strategic thinking behind every design choice was evident. They don't just make things look good; they make them work.",
      author: "Elena Rodriguez, CMO",
      company: "Lumina"
    },
    {
      quote: "A truly collaborative partner. They listened, understood our needs, and provided solutions that were both innovative and practical.",
      author: "David Park, Head of Design",
      company: "Nexus"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <section className="py-12 px-8 w-full text-center overflow-hidden">
      <div className="relative h-[300px] md:h-[250px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            <p className="text-[clamp(1.5rem,3vw,2.25rem)] font-medium leading-tight mb-12">
              "{testimonials[currentIndex].quote}"
            </p>
            <div className="space-y-1">
              <p className="font-bold">{testimonials[currentIndex].author}</p>
              <a href="#" className="text-gray-500 underline underline-offset-4 hover:text-brand-orange transition-colors">
                {testimonials[currentIndex].company}
              </a>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      <div className="flex justify-center gap-2 mt-8">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              i === currentIndex ? "bg-brand-orange w-6" : "bg-gray-300"
            )}
          />
        ))}
      </div>
    </section>
  );
};
