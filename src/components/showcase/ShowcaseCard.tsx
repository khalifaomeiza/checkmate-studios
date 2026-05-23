import { motion } from 'motion/react';
import type { ShowcaseItem } from '../../data/showcase';
import { OptimisedPicture } from '../media/OptimisedPicture';

export interface ShowcaseCardProps {
  item: ShowcaseItem;
  index: number;
}

export const ShowcaseCard = ({ item, index }: ShowcaseCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.55, delay: Math.min(index, 5) * 0.05, ease: [0.22, 1, 0.36, 1] }}
    className="relative aspect-video overflow-hidden rounded-2xl bg-[#ececec] cursor-default"
  >
    <div className="absolute inset-0">
      {item.kind === 'image' ? (
        <OptimisedPicture
          src={item.src}
          sources={item.sources}
          width={item.width}
          height={item.height}
          alt={item.alt}
          loading="lazy"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <video
          src={item.src}
          poster={item.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          disablePictureInPicture
          aria-label={item.alt}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
      )}
    </div>
  </motion.div>
);
