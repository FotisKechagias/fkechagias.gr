import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export interface TextSegment {
  text: string;
  className?: string;
}

interface WordsPullUpMultiStyleProps {
  segments: TextSegment[];
}

/**
 * Ίδιο pull-up εφέ με το WordsPullUp, αλλά δέχεται πολλαπλά segments με
 * διαφορετικό className το καθένα (π.χ. κανονικό βάρος + italic serif),
 * διατηρώντας το per-word στυλ ενώ κάνει ένα ενιαίο stagger σε όλες τις λέξεις.
 */
export default function WordsPullUpMultiStyle({ segments }: WordsPullUpMultiStyleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  const allWords: { word: string; className?: string }[] = [];
  segments.forEach((segment) => {
    segment.text.split(' ').forEach((word) => {
      allWords.push({ word, className: segment.className });
    });
  });

  return (
    <div ref={ref} className="inline-flex flex-wrap justify-center">
      {allWords.map((item, i) => (
        <span key={i} className="overflow-hidden inline-block pb-[0.1em] mr-[0.25em]">
          <motion.span
            className={`inline-block ${item.className ?? ''}`}
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            {item.word}
          </motion.span>
        </span>
      ))}
    </div>
  );
}
