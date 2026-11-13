import { FiX, FiCheck } from 'react-icons/fi';

const PROBLEMS = [
  'কার্টে Order Complete করে না',
  'Fake Order আসে',
  'একই Fraud Customer বারবার Order করে',
  'Excel Sheet দিয়ে Order Manage করতে হয়',
  'Stock হিসাব গোলমাল হয়ে যায়',
  'Facebook Inbox থেকে Order Track করা কঠিন',
];

const SOLUTIONS = [
  'Smart Dashboard — সব ডেটা এক জায়গায়',
  'Auto Order Processing with delivery process',
  'Customer Verification & Fraud Score',
  'Real-time Sales Analytics',
  'Automatic Inventory Tracking',
  'One Click Customer Block',
  'যেকোনো Third-party Delivery সিস্টেম — Merchant Account থাকলে API Key যোগ করলেই সহজ Integration',
  'User Friendly Design — যে কেউ সহজেই ব্যবহার করতে পারবে',
];

export default function ProblemSolution() {
  return (
    <section id="why" className="px-4 sm:px-8 lg:px-16 py-16 sm:py-20 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 sm:mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-red-500 mb-2">Why Choose Us</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900">
            কেন আমাদের সিস্টেম নিবেন?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* Problems */}
          <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5 sm:p-7">
            <h3 className="text-lg font-black text-zinc-800 mb-5">সমস্যা</h3>
            <ul className="space-y-3">
              {PROBLEMS.map((text, i) => (
                <li key={i} className="flex items-start gap-3 bg-white border border-zinc-100 rounded-2xl px-4 py-3">
                  <span className="mt-0.5 w-6 h-6 rounded-full bg-zinc-100 text-zinc-500 flex items-center justify-center shrink-0">
                    <FiX size={14} />
                  </span>
                  <span className="text-sm sm:text-base text-zinc-700 leading-snug">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions */}
          <div className="rounded-3xl border border-red-100 bg-gradient-to-br from-red-50 to-white p-5 sm:p-7 shadow-lg shadow-red-100/40">
            <h3 className="text-lg font-black text-red-600 mb-5">আমাদের সমাধান</h3>
            <ul className="space-y-3">
              {SOLUTIONS.map((text, i) => (
                <li key={i} className="flex items-start gap-3 bg-white border border-red-100 rounded-2xl px-4 py-3">
                  <span className="mt-0.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shrink-0">
                    <FiCheck size={14} />
                  </span>
                  <span className="text-sm sm:text-base text-zinc-800 font-medium leading-snug">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}