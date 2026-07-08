const NAV_ITEMS: { label: string; href: string }[] = [
  { label: 'Αρχική', href: '#hero' },
  { label: 'Ιστορία', href: '#about' },
  { label: 'Υπηρεσίες', href: '#features' },
  { label: 'Έργα', href: '/projects/' },
  { label: 'Επικοινωνία', href: 'mailto:fkechagias07@gmail.com' },
];

export default function Navbar() {
  return (
    <nav className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
      <div className="bg-black rounded-b-2xl md:rounded-b-3xl px-4 py-2 md:px-8">
        <ul className="flex items-center gap-3 sm:gap-6 md:gap-12 lg:gap-14">
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className="whitespace-nowrap text-[10px] sm:text-xs md:text-sm text-[rgba(225,224,204,0.8)] hover:text-[#E1E0CC] transition-colors duration-200"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
