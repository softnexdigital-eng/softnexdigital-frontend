import Image from 'next/image';

export default function DashboardShowcase() {
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-8 bg-red-50/40 border-y border-red-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-3">Dashboard</p>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900">
            সুন্দর ও পাওয়ারফুল <span className="text-red-600">Admin Dashboard</span>
          </h2>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-zinc-900 px-4 py-2.5 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <Image
            src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhZJcLZKLnAHJR8AZECQ80ocE5oo1SflVdYiTiT2DqHRwHPYs0w4VSgLa3_Q5CPXSrD6he9jeL6WeR0XwEPLfqrJFwktfVXLq20HJ4w_QJuD7AQG8Rswlp2Q-4UXIUU1Iw7ZbYGTqUC9SuRdf8bq1xX6kQa-HHFr7PlQHKKdJbTt7DxyIzkbg5__JQs98_U/w899-h417-rw/Screenshot%202026-11-06%20171723.png"
            alt="Admin Dashboard"
            width={1905}
            height={889}
            className="w-full h-auto"
            priority
          />
        </div>
      </div>
    </section>
  );
}