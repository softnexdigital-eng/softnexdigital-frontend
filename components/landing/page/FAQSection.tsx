"use client";

import { FaPlus, FaMinus } from "react-icons/fa";

interface FAQ {
  q: string;
  a: string;
}

interface FAQSectionProps {
  faqs: FAQ[];
  openFaq: number | null;
  setOpenFaq: (i: number | null) => void;
  primary: string;
}

export default function FAQSection({ faqs, openFaq, setOpenFaq, primary }: FAQSectionProps) {
  return (
    <div className="bg-white border border-gray-200 p-5 rounded-sm">
      <h2 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2"><span className="w-3 h-3 inline-block rounded-sm" style={{ background: primary }} />সাধারণ কিছু প্রশ্ন</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {faqs.map((faq, i) => (
          <div key={i} className="border border-gray-100 overflow-hidden transition-all duration-200 rounded-sm" style={{ borderColor: openFaq === i ? `${primary}40` : "#f3f4f6", background: openFaq === i ? "#fffdf5" : "white" }}>
            <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left">
              <span className="text-sm font-bold text-gray-800 pr-3" style={{ color: openFaq === i ? primary : undefined }}>{faq.q}</span>
              <span className="w-6 h-6 flex items-center justify-center flex-shrink-0 text-white text-[10px] rounded-sm" style={{ background: openFaq === i ? primary : "#e5e7eb", color: openFaq === i ? "white" : "#6b7280" }}>{openFaq === i ? <FaMinus /> : <FaPlus />}</span>
            </button>
            {openFaq === i && <div className="px-4 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">{faq.a}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}