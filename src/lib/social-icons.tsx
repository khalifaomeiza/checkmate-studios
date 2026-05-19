import type { ComponentType, SVGProps } from 'react';
import { Instagram, Facebook, Twitter, Linkedin } from 'lucide-react';
import { BehanceIcon } from '../components/icons/BehanceIcon';

export type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

export const SOCIAL_ICONS: Record<string, IconComponent> = {
  Instagram,
  Facebook,
  Twitter,
  LinkedIn: Linkedin,
  Behance: BehanceIcon
};
