import Link from 'next/link';
import { FiPhone } from 'react-icons/fi';
import { FaWhatsapp, FaFacebookMessenger, FaFacebook } from 'react-icons/fa';
import { PHONE_DISPLAY, WHATSAPP_NUMBER } from './constants';

const PARTICLES = [
  { top: '10%', left: '8%', size: 3, delay: '0s' },
  { top: '22%', left: '85%', size: 2, delay: '0.6s' },
  { top: '38%', left: '15%', size: 2.5, delay: '1.1s' },
  { top: '55%', left: '92%', size: 2, delay: '1.6s' },
  { top: '70%', left: '5%', size: 3, delay: '0.3s' },
  { top: '80%', left: '78%', size: 2, delay: '1.9s' },
  { top: '15%', left: '50%', size: 2, delay: '0.9s' },
  { top: '64%', left: '45%', size: 2.5, delay: '1.4s' },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden" style={{ background: '#050505' }}>
      {/* Glows */}
      <div className="absolute top-0 -left-32 w-[28rem] h-[28rem] bg-red-600/25 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 -right-32 w-[28rem] h-[28rem] bg-red-600/25 rounded-full blur-[100px] pointer-events-none" />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none motion-reduce:hidden">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-red-400/60 animate-pulse"
            style={{ top: p.top, left: p.left, width: p.size, height: p.size, animationDelay: p.delay, animationDuration: '3s' }}
          />
        ))}
      </div>

      {/* Top CTA bar */}
      <div className="relative border-b border-white/10">
        <div className="max-w-8xl mx-auto px-4 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-5">
          <h3 className="text-xl sm:text-2xl font-black text-white text-center sm:text-left">
            Ready To Scale Your Store?
          </h3>
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-600/30 shrink-0"
          >
            Start Selling
          </Link>
        </div>
      </div>

      {/* Gradient divider */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />

      {/* Footer grid */}
      <div className="relative max-w-8xl mx-auto px-4 sm:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-red-900/40">S</div>
              <div className="leading-tight">
                <p className="font-black text-white text-lg tracking-tight">SOFTNEX</p>
                <p className="font-bold text-red-400 text-[10px] tracking-[0.25em] -mt-0.5">COMMERCE OS</p>
              </div>
            </div>
            <p className="text-sm text-zinc-400 mb-5 leading-relaxed">Smart E-commerce Sales System — মাত্র 250 টাকা থেকে।</p>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-red-600 transition-colors flex items-center justify-center text-zinc-400 hover:text-white">
                <FaFacebook size={14} />
              </a>
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-red-600 transition-colors flex items-center justify-center text-zinc-400 hover:text-white">
                <FaWhatsapp size={14} />
              </a>
              <a href="https://m.me/softnexdigital" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-blue-600 transition-colors flex items-center justify-center text-zinc-400 hover:text-white">
                <FaFacebookMessenger size={14} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 text-sm">Company</h4>
            <ul className="space-y-2.5 text-sm text-zinc-400">
              {['About', 'Features', 'Pricing', 'Contact'].map((l) => (
                <li key={l}><Link href="#" className="hover:text-red-400 transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 text-sm">Product</h4>
            <ul className="space-y-2.5 text-sm text-zinc-400">
              {['Landing Builder', 'Fraud Shield', 'Analytics', 'Inventory'].map((l) => (
                <li key={l}><Link href="#" className="hover:text-red-400 transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 text-sm">Resources</h4>
            <ul className="space-y-2.5 text-sm text-zinc-400 mb-5">
              {['Documentation', 'Blog', 'Help Center'].map((l) => (
                <li key={l}><Link href="#" className="hover:text-red-400 transition-colors">{l}</Link></li>
              ))}
            </ul>
            <h4 className="font-bold text-white mb-3 text-sm">Contact</h4>
            <ul className="space-y-2.5 text-sm text-zinc-400">
              <li className="flex items-center gap-2"><FiPhone className="text-red-500 shrink-0" size={13} /> {PHONE_DISPLAY}</li>
              <li className="flex items-center gap-2"><FaWhatsapp className="text-red-500 shrink-0" size={13} /> WhatsApp</li>
              <li className="flex items-center gap-2"><FaFacebookMessenger className="text-blue-400 shrink-0" size={13} /> Messenger</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-3">
          <span>© 2026 SoftNex Commerce OS। সর্বস্বত্ব সংরক্ষিত।</span>
          <div className="flex gap-5">
            <Link href="#" className="hover:text-red-400 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-red-400 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}