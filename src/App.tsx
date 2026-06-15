import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { usePageSeo } from './lib/seo';
import { PAGE_SEO } from './lib/page-seo';
import { BottomNav } from './components/BottomNav';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { PageFade } from './components/layout/PageFade';
import { ProtectedRoute } from './components/admin/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { ResourcesPage } from './pages/ResourcesPage';
import { PlaygroundPage } from './pages/PlaygroundPage';
import { WorksPage } from './pages/WorksPage';
import { CaseStudyPage } from './pages/CaseStudyPage';
import { CareersPage } from './pages/CareersPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminSignupPage } from './pages/admin/AdminSignupPage';
import { AdminWorksListPage } from './pages/admin/AdminWorksListPage';
import { CaseStudyEditorPage } from './pages/admin/CaseStudyEditorPage';

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isCaseStudy =
    location.pathname.startsWith('/works/') && location.pathname !== '/works';
  const [showNavbar, setShowNavbar] = useState(isAdmin);

  usePageSeo(PAGE_SEO[location.pathname] ?? PAGE_SEO['/']);

  useEffect(() => {
    if (isAdmin) {
      setShowNavbar(true);
      return;
    }
    const timer = setTimeout(() => setShowNavbar(true), 5000);
    return () => clearTimeout(timer);
  }, [isAdmin]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const showSiteChrome = !isAdmin;

  return (
    <motion.div className="min-h-screen selection:bg-brand-orange selection:text-white font-sans">
      <AnimatePresence>
        {showNavbar && showSiteChrome && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <Navbar />
          </motion.div>
        )}
      </AnimatePresence>
      {showNavbar && showSiteChrome && <BottomNav />}
      <main>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageFade><HomePage /></PageFade>} />
            <Route path="/resources" element={<PageFade><ResourcesPage /></PageFade>} />
            <Route path="/playground" element={<PageFade><PlaygroundPage /></PageFade>} />
            <Route path="/works" element={<WorksPage />} />
            <Route path="/works/:slug" element={<CaseStudyPage />} />
            <Route path="/careers" element={<PageFade><CareersPage /></PageFade>} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/signup" element={<AdminSignupPage />} />
            <Route
              path="/admin/works"
              element={
                <ProtectedRoute>
                  <AdminWorksListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/works/new"
              element={
                <ProtectedRoute>
                  <CaseStudyEditorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/works/edit/:id"
              element={
                <ProtectedRoute>
                  <CaseStudyEditorPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<PageFade><HomePage /></PageFade>} />
          </Routes>
        </AnimatePresence>
      </main>
      {showSiteChrome ? (
        <div className={isCaseStudy ? 'pb-12 md:pb-0' : 'pb-24 md:pb-0'}>
          <Footer />
        </div>
      ) : null}
    </motion.div>
  );
}
