import Navbar from './components/Navbar';
import Hero from './sections/Hero';
import About from './sections/About';
import Features from './sections/Features';

export default function App() {
  return (
    <div className="bg-black min-h-screen">
      <Navbar />
      <Hero />
      <About />
      <Features />
    </div>
  );
}
