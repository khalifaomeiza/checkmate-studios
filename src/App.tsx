import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { usePageSeo } from './lib/seo';
import { PAGE_SEO } from './lib/page-seo';
import { BottomNav } from './components/BottomNav';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { PageFade } from './components/layout/PageFade';
import { HomePage } from './pages/HomePage';
import { ResourcesPage } from './pages/ResourcesPage';
import { PlaygroundPage } from './pages/PlaygroundPage';
import { WorksPage } from './pages/WorksPage';
import { CareersPage } from './pages/CareersPage';

export default function App() {
  const location = useLocation();
  const [showNavbar, setShowNavbar] = useState(false);

  usePageSeo(PAGE_SEO[location.pathname] ?? PAGE_SEO['/']);

  useEffect(() => {
    const timer = setTimeout(() => setShowNavbar(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <motion.div className="min-h-screen selection:bg-brand-orange selection:text-white font-sans">
      <AnimatePresence>
        {showNavbar && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <Navbar />
          </motion.div>
        )}
      </AnimatePresence>
      {showNavbar && <BottomNav />}
      <main>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageFade><HomePage /></PageFade>} />
            <Route path="/resources" element={<PageFade><ResourcesPage /></PageFade>} />
            <Route path="/playground" element={<PageFade><PlaygroundPage /></PageFade>} />
            <Route path="/works" element={<WorksPage />} />
            <Route path="/careers" element={<PageFade><CareersPage /></PageFade>} />
            <Route path="*" element={<PageFade><HomePage /></PageFade>} />
          </Routes>
        </AnimatePresence>
      </main>
      <div className="pb-24 md:pb-0">
        <Footer />
      </div>
    </motion.div>
  );
}
