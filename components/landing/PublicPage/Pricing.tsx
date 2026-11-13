
import Link from 'next/link';
import { PRICING_PLANS } from './constants';
import Reveal from './Reveal';

export default function Pricing() {
  const customPlan = {
    name: 'Custom Website',
    price: 15000,
    popular: false,
    features: [
      '100% Custom Website Development',
      'Full MERN Stack Development',
      'Powerful Backend & Frontend System',
      'Custom Admin Dashboard',
      'Custom API & Database',
      'Advanced Authentication & Security',
      'Client Requirement Based Features',
      'Mobile & Desktop Responsive Design',
      'Domain & Hosting সহ অথবা ছাড়া',
     
    ],
  };

  const plans = [...PRICING_PLANS, customPlan];

  return (
    <section id="pricing" className="bg-white px-4 py-10 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center sm:mb-12">
          <h2 className="landing-section-title font-black text-zinc-900">
            সহজ ও স্বচ্ছ মূল্য
          </h2>

          <p className="mt-2 text-base text-zinc-600">
            সাশ্রয়ী মাসিক প্যাকেজ এবং আপনার প্রয়োজন অনুযায়ী কাস্টম ওয়েবসাইট।
          </p>
        </div>

        <div className="grid gap-5 pt-3 md:grid-cols-3">
          {plans.map((plan, index) => {
            const isCustom = plan.name === 'Custom Website';

            return (
              <Reveal
                key={plan.name}
                delay={plan.popular ? 180 : index * 90}
                scale={plan.popular}
                className={plan.popular ? 'order-first md:order-none' : ''}
              >
                <div
                  className={`relative flex h-full flex-col rounded-3xl bg-white p-5 sm:p-7 ${
                    plan.popular
                      ? 'border-2 border-red-500 shadow-2xl shadow-red-500/15'
                      : 'border border-zinc-200'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-6 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
                      সবচেয়ে জনপ্রিয়
                    </span>
                  )}

                  <h3 className="text-lg font-bold text-zinc-900">
                    {plan.name}
                  </h3>

                  <p className="mt-3 flex items-baseline gap-1.5">
                    <span className="text-4xl font-black text-zinc-900">
                      ৳{plan.price.toLocaleString('en-US')}
                    </span>

                    <span className="text-sm text-zinc-500">
                      {isCustom ? 'এককালীন' : 'মাসিক'}
                    </span>
                  </p>

                  <ul className="mt-6 flex-1 space-y-3 border-t border-zinc-100 pt-6">
                    {plan.features.map((f: string) => (
                      <li
                        key={f}
                        className="flex gap-2.5 text-[15px] leading-snug text-zinc-700"
                      >
                        <span className="font-bold text-emerald-500">
                          ✓
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={isCustom ? '/contact' : '/auth/login'}
                    className={`mt-7 flex h-12 items-center justify-center rounded-xl text-base font-bold transition ${
                      plan.popular
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'border border-red-300 text-red-600 hover:bg-red-600 hover:text-white'
                    }`}
                  >
                    {isCustom ? 'কাস্টম ওয়েবসাইট নিন' : 'এখনই শুরু করুন'}
                  </Link>
                </div>
              </Reveal>
            );
          })}
        </div>

        <p className="mt-6 text-center text-xs text-zinc-500">
          * Custom Website-এর ক্ষেত্রে Domain ও Hosting সহ অথবা ছাড়া
          কাজ করার সুযোগ রয়েছে। অতিরিক্ত জটিল ফিচারের জন্য আলাদা
          মূল্য নির্ধারণ করা হতে পারে।
        </p>
      </div>
    </section>
  );
}
