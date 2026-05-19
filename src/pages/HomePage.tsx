import { Hero } from '../components/home/Hero';
import { Offerings } from '../components/home/Offerings';
import { RecentWorks } from '../components/home/RecentWorks';
import { Partners } from '../components/home/Partners';
import { Testimonial } from '../components/home/Testimonial';
import { ResourcesSection } from '../components/home/ResourcesSection';
import { ContactSection } from '../components/home/ContactSection';

export const HomePage = () => (
  <>
    <Hero />
    <Offerings />
    <RecentWorks />
    <Partners />
    <Testimonial />
    <ResourcesSection />
    <ContactSection />
  </>
);
