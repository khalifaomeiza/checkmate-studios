import type { ComponentType, SVGProps } from 'react';
import { Instagram, Facebook, Twitter } from 'lucide-react';
import { BehanceIcon } from '../components/icons/BehanceIcon';
import { DribbbleIcon } from '../components/icons/DribbbleIcon';

export type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

export const SOCIAL_ICONS: Record<string, IconComponent> = {
  Instagram,
  Facebook,
  Twitter,
  Behance: BehanceIcon,
  Dribbble: DribbbleIcon
};
