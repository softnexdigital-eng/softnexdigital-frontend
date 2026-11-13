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
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="mb-4 flex items-center gap-2.5 text-base font-bold text-gray-900 sm:text-lg">
        <span className="inline-block h-5 w-1 rounded-full" style={{ background: primary }} />
        সাধারণ কিছু প্রশ্ন
      </h2>

      <div className="grid grid-cols-1 items-start gap-2.5 sm:grid-cols-2">
        {faqs.map((faq, i) => {
          const isOpen = openFaq === i;
          return (
            <div
              key={i}
              className="overflow-hidden rounded-xl border transition-colors duration-200"
              style={{
                borderColor: isOpen ? `${primary}50` : "#F3F4F6",
                background: isOpen ? `${primary}06` : "#fff",
              }}
            >
              <button
                onClick={() => setOpenFaq(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex min-h-[56px] w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
              >
                <span
                  className="text-sm font-semibold leading-snug"
                  style={{ color: isOpen ? primary : "#1F2937" }}
                >
                  {faq.q}
                </span>
                <span
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[10px]"
                  style={{
                    background: isOpen ? primary : "#F3F4F6",
                    color: isOpen ? "#fff" : "#6B7280",
                  }}
                >
                  {isOpen ? <FaMinus /> : <FaPlus />}
                </span>
              </button>
              {isOpen && (
                <div className="border-t border-gray-100 px-4 pb-4 pt-3 text-sm leading-relaxed text-gray-600">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
