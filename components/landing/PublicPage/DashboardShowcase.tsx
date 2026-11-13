import Image from 'next/image';

export default function DashboardShowcase() {
  return (
    <section id="demo" className="bg-red-50/60 px-4 py-10 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="landing-section-title mb-7 text-center font-black text-zinc-900 sm:mb-10">
          সুন্দর ও পাওয়ারফুল Admin Dashboard
        </h2>

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl">
          <div className="flex items-center gap-1.5 bg-zinc-900 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </div>
          {/* মোবাইলে সাইড-স্ক্রল, যাতে ছবি পড়া যায় */}
          <div className="overflow-x-auto">
            <Image
              src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhZJcLZKLnAHJR8AZECQ80ocE5oo1SflVdYiTiT2DqHRwHPYs0w4VSgLa3_Q5CPXSrD6he9jeL6WeR0XwEPLfqrJFwktfVXLq20HJ4w_QJuD7AQG8Rswlp2Q-4UXIUU1Iw7ZbYGTqUC9SuRdf8bq1xX6kQa-HHFr7PlQHKKdJbTt7DxyIzkbg5__JQs98_U/w899-h417-rw/Screenshot%202026-11-06%20171723.png"
              alt="Admin Dashboard"
              width={1905}
              height={889}
              className="h-auto w-full min-w-[640px] sm:min-w-0"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
