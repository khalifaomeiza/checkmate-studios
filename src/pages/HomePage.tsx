import { Hero } from '../components/home/Hero';
import { Showcase } from '../components/home/Showcase';
import { RecentWorks } from '../components/home/RecentWorks';
import { Partners } from '../components/home/Partners';
import { Testimonial } from '../components/home/Testimonial';
import { ResourcesSection } from '../components/home/ResourcesSection';
import { ContactSection } from '../components/home/ContactSection';

export const HomePage = () => (
  <>
    <Hero />
    <Showcase />
    <RecentWorks />
    <Partners />
    <Testimonial />
    <ResourcesSection />
    <ContactSection />
  </>
);
