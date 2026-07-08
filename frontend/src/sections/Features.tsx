import { useRef } from 'react';
import type { ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import WordsPullUpMultiStyle from '../components/WordsPullUpMultiStyle';

const FEATURES_VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_133058_0504132a-0cf3-4450-a370-8ea3b05c95d4.mp4';

const CARD_ICONS = {
  planning:
    'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171918_4a5edc79-d78f-4637-ac8b-53c43c220606.png&w=1280&q=85',
  optimization:
    'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171741_ed9845ab-f5b2-4018-8ce7-07cc01823522.png&w=1280&q=85',
  dedication:
    'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171809_f56666dc-c099-4778-ad82-9ad4f209567b.png&w=1280&q=85',
};

interface ChecklistCardData {
  number: string;
  icon: string;
  title: string;
  items: string[];
}

const CHECKLIST_CARDS: ChecklistCardData[] = [
  {
    number: '01',
    icon: CARD_ICONS.planning,
    title: 'Ανάλυση & Σχεδιασμός.',
    items: [
      'Ανάλυση αναγκών επιχείρησης',
      'Wireframes & αρχιτεκτονική',
      'Επιλογή τεχνολογικής στοίβας',
      'Ξεκάθαρο χρονοδιάγραμμα',
    ],
  },
  {
    number: '02',
    icon: CARD_ICONS.optimization,
    title: 'Έξυπνη Βελτιστοποίηση.',
    items: [
      'AI ανάλυση επιδόσεων',
      'SEO & Core Web Vitals insights',
      'Ενσωματώσεις τρίτων εργαλείων',
    ],
  },
  {
    number: '03',
    icon: CARD_ICONS.dedication,
    title: 'Πλήρης Αφοσίωση.',
    items: [
      'Άμεση επικοινωνία',
      'Τακτικές ενημερώσεις προόδου',
      'Συγχρονισμένο χρονοδιάγραμμα',
    ],
  },
];

function AnimatedCard({
  index,
  className,
  children,
}: {
  index: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.7, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function InfoFeatureCard({ index, data }: { index: number; data: ChecklistCardData }) {
  return (
    <AnimatedCard index={index} className="rounded-2xl bg-[#212121] p-5 md:p-6 flex flex-col h-full">
      <img src={data.icon} alt="" className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover mb-4" />
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-gray-500 text-xs">{data.number}</span>
        <h3 style={{ color: '#E1E0CC' }} className="text-base sm:text-lg font-medium">
          {data.title}
        </h3>
      </div>
      <ul className="flex flex-col gap-2 mb-6 flex-1">
        {data.items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span className="text-gray-400 text-xs sm:text-sm">{item}</span>
          </li>
        ))}
      </ul>
      <a
        href="mailto:fkechagias07@gmail.com"
        className="inline-flex items-center gap-1.5 text-primary text-xs sm:text-sm font-medium w-fit hover:opacity-70 transition-opacity"
      >
        <span>Μάθε περισσότερα</span>
        <ArrowRight className="w-3.5 h-3.5 -rotate-45" />
      </a>
    </AnimatedCard>
  );
}

export default function Features() {
  return (
    <section
      id="features"
      className="relative min-h-screen bg-black py-20 sm:py-28 px-4 sm:px-6 md:px-8"
    >
      <div className="bg-noise absolute inset-0 opacity-[0.15] pointer-events-none" />

      <div className="relative text-center max-w-4xl mx-auto mb-10 md:mb-14">
        <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal text-primary mb-2">
          <WordsPullUpMultiStyle
            segments={[{ text: 'Επαγγελματικές διαδικασίες για ξεχωριστά αποτελέσματα.' }]}
          />
        </div>
        <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal text-gray-500">
          <WordsPullUpMultiStyle segments={[{ text: 'Φτιαγμένο με όραμα. Κινείται από πάθος.' }]} />
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-2 md:gap-1 lg:h-[480px]">
        <AnimatedCard
          index={0}
          className="relative rounded-2xl overflow-hidden bg-[#212121] h-64 md:h-full"
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            src={FEATURES_VIDEO_URL}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
            <p style={{ color: '#E1E0CC' }} className="text-sm sm:text-base font-medium">
              Ο ψηφιακός σας καμβάς.
            </p>
          </div>
        </AnimatedCard>

        {CHECKLIST_CARDS.map((card, i) => (
          <InfoFeatureCard key={card.number} index={i + 1} data={card} />
        ))}
      </div>
    </section>
  );
}
