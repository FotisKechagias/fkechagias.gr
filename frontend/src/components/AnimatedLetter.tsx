import { motion, useTransform, type MotionValue } from 'framer-motion';

interface AnimatedLetterProps {
  char: string;
  progress: MotionValue<number>;
  index: number;
  total: number;
}

/**
 * Ένας χαρακτήρας του οποίου η αδιαφάνεια συνδέεται με το scroll progress
 * του γονικού container (0.2 -> 1), δημιουργώντας προοδευτική αποκάλυψη
 * κειμένου καθώς ο χρήστης κάνει scroll.
 */
export default function AnimatedLetter({ char, progress, index, total }: AnimatedLetterProps) {
  const charProgress = index / total;
  // Το άνω όριο μαζεύεται στο 1 ώστε οι τελευταίοι χαρακτήρες να προλαβαίνουν
  // να φτάσουν σε πλήρη αδιαφάνεια πριν εξαντληθεί το scrollYProgress (0-1).
  const rangeEnd = Math.min(charProgress + 0.05, 1);
  const opacity = useTransform(progress, [charProgress - 0.1, rangeEnd], [0.2, 1]);

  return (
    <motion.span style={{ opacity }} className="inline">
      {char === ' ' ? ' ' : char}
    </motion.span>
  );
}
