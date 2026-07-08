import { useRef } from 'react';
import { useScroll } from 'framer-motion';
import WordsPullUpMultiStyle from '../components/WordsPullUpMultiStyle';
import AnimatedLetter from '../components/AnimatedLetter';

const BODY_TEXT =
  'Τα τελευταία δύο χρόνια, έχω συνεργαστεί με επιχειρήσεις και ιδιώτες σε όλη την Ελλάδα, σχεδιάζοντας και αναπτύσσοντας ιστοσελίδες που ξεχωρίζουν. Κάθε project είναι μια ευκαιρία να ενώσω αισθητική με απόδοση, χτίζοντας εμπειρίες που μετατρέπουν επισκέπτες σε πελάτες.';

export default function About() {
  const containerRef = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.8', 'end 0.2'],
  });

  const chars = BODY_TEXT.split('');

  return (
    <section id="about" className="bg-black py-20 sm:py-28 md:py-36 px-4">
      <div className="bg-[#101010] rounded-2xl md:rounded-[2rem] max-w-6xl mx-auto px-6 py-16 sm:px-10 sm:py-20 md:px-16 md:py-28 text-center">
        <span className="inline-block text-primary text-[10px] sm:text-xs tracking-[0.2em] uppercase mb-6">
          Web Design &amp; Development
        </span>

        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl max-w-3xl mx-auto leading-[0.95] sm:leading-[0.9] text-primary">
          <WordsPullUpMultiStyle
            segments={[
              { text: 'Είμαι ο Φώτης Κεχαγιάς,' },
              { text: 'ένας self-taught developer.', className: 'italic font-serif' },
              {
                text: 'Φτιάχνω ιστοσελίδες με έμφαση στο σχεδιασμό, την ταχύτητα και το αποτέλεσμα.',
              },
            ]}
          />
        </h2>

        <p
          ref={containerRef}
          className="text-[#DEDBC8] text-xs sm:text-sm md:text-base mt-10 max-w-2xl mx-auto leading-relaxed"
        >
          {chars.map((char, i) => (
            <AnimatedLetter key={i} char={char} progress={scrollYProgress} index={i} total={chars.length} />
          ))}
        </p>
      </div>
    </section>
  );
}
