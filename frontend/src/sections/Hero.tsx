import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import WordsPullUp from '../components/WordsPullUp';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const HERO_VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4';

export default function Hero() {
  return (
    <section id="hero" className="h-screen p-4 md:p-6">
      <div className="relative w-full h-full rounded-2xl md:rounded-[2rem] overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src={HERO_VIDEO_URL}
        />
        <div className="noise-overlay absolute inset-0 opacity-[0.7] mix-blend-overlay pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

        <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 sm:px-8 sm:pb-10 md:px-10 md:pb-14 lg:px-14 lg:pb-16">
          <div className="grid grid-cols-12 gap-6 md:gap-10 items-end">
            <div className="col-span-12 md:col-span-8">
              <h1
                style={{ color: '#E1E0CC' }}
                className="relative text-[26vw] sm:text-[24vw] md:text-[22vw] lg:text-[20vw] xl:text-[19vw] 2xl:text-[20vw] font-medium leading-[0.85] tracking-[-0.07em]"
              >
                <WordsPullUp text="FKECHAGIAS" showAsterisk />
              </h1>
            </div>

            <div className="col-span-12 md:col-span-4 flex flex-col gap-6 md:gap-8 pb-2 md:pb-4">
              <motion.p
                className="text-primary/70 text-xs sm:text-sm md:text-base"
                style={{ lineHeight: 1.2 }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
              >
                Είμαι ο Φώτης Κεχαγιάς — freelance web designer &amp; developer. Φτιάχνω
                ψηφιακές εμπειρίες από το μηδέν, χωρίς templates και χωρίς συμβιβασμούς,
                με έμφαση στην ταχύτητα, το σχεδιασμό και το αποτέλεσμα.
              </motion.p>

              <motion.a
                href="/projects/"
                className="group inline-flex items-center gap-2 bg-primary rounded-full pl-6 pr-2 py-2 w-fit transition-all duration-300 hover:gap-3"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.7, ease: EASE }}
              >
                <span className="text-black font-medium text-sm sm:text-base">
                  Δες τη δουλειά μου
                </span>
                <span className="flex items-center justify-center bg-black rounded-full w-9 h-9 sm:w-10 sm:h-10 transition-transform duration-300 group-hover:scale-110">
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#E1E0CC]" />
                </span>
              </motion.a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
