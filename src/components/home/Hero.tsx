import { motion } from 'motion/react';
import { useEffect, useRef } from 'react';

const HERO_VIDEO_SRC =
  'https://res.cloudinary.com/dliesrplu/video/upload/v1777382524/Checkmate_Hero_d0axoc.mp4';
const HERO_VIDEO_POSTER =
  'https://res.cloudinary.com/dliesrplu/video/upload/so_0/v1777382524/Checkmate_Hero_d0axoc.jpg';

export const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // iOS Safari (and some Android browsers) block <video autoPlay> unless
  // `muted` is set on the DOM property AND .play() is invoked programmatically.
  // The declarative React `muted` prop sometimes doesn't propagate, so we
  // force it via the ref, fall back to first-touch playback if blocked,
  // and re-resume on any subsequent pause (battery saver, tab restore, etc.).
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');

    const tryPlay = () => video.play().catch(() => undefined);

    void tryPlay();

    // Any unexpected pause → resume immediately, keeps it on infinite play.
    const onPause = () => {
      if (!video.ended) void tryPlay();
    };
    video.addEventListener('pause', onPause);

    // First-interaction fallback if the initial autoplay was rejected.
    const resume = () => {
      void tryPlay();
      window.removeEventListener('touchstart', resume);
      window.removeEventListener('click', resume);
      window.removeEventListener('scroll', resume);
    };
    window.addEventListener('touchstart', resume, { once: true, passive: true });
    window.addEventListener('click', resume, { once: true });
    window.addEventListener('scroll', resume, { once: true, passive: true });

    return () => {
      video.removeEventListener('pause', onPause);
      window.removeEventListener('touchstart', resume);
      window.removeEventListener('click', resume);
      window.removeEventListener('scroll', resume);
    };
  }, []);

  return (
    <section className="pb-12 w-full text-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        /* `100dvh` follows the dynamic viewport (excludes the iOS toolbar at rest,
            includes it on retract) — feels like a full screen on mobile without
            the jumpy resize you get from `100vh`. */
        className="relative w-full h-[100dvh] md:h-screen overflow-hidden flex items-center justify-center mb-20"
      >
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={HERO_VIDEO_POSTER}
            disableRemotePlayback
            disablePictureInPicture
            controls={false}
            controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
            tabIndex={-1}
            aria-hidden="true"
            className="w-full h-full object-cover pointer-events-none"
          >
            <source src={HERO_VIDEO_SRC} type="video/mp4" />
          </video>
        </div>
        <div className="absolute inset-0 bg-black/5" />
      </motion.div>

      <div className="px-6 sm:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
          /* Fluid display: ramps smoothly from ~40px on small phones to ~96px
             on wide screens — no jarring step at the md breakpoint. */
          className="font-normal tracking-tight leading-[1.05] text-[clamp(2.5rem,7.2vw,6rem)]"
        >
          You are here by design.
        </motion.h1>
      </div>
    </section>
  );
};
