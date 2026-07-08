import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface WordsPullUpProps {
  text: string;
  showAsterisk?: boolean;
}

/**
 * Σπάει το text σε λέξεις· κάθε λέξη είναι ένα motion.span που γλιστράει
 * από y:20 -> 0 με staggered delay, ενεργοποιείται μία φορά μέσω useInView.
 */
export default function WordsPullUp({ text, showAsterisk = false }: WordsPullUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const words = text.split(' ');

  return (
    <span ref={ref} className="inline-flex flex-wrap">
      {words.map((word, i) => {
        const isLast = i === words.length - 1;
        return (
          <span
            key={i}
            className={`overflow-hidden inline-block pb-[0.1em] mr-[0.22em] last:mr-0 ${
              showAsterisk && isLast ? 'pr-[0.5em]' : ''
            }`}
          >
            <motion.span
              className="inline-block relative"
              initial={{ y: 20, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              {word}
              {showAsterisk && isLast && (
                <span className="absolute top-[0.65em] -right-[0.3em] text-[0.31em]" aria-hidden="true">
                  *
                </span>
              )}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
}
