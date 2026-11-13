"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Store } from "lucide-react";
import api from "@/lib/api";

interface PublicStore {
  slug: string;
  name: string;
  logo: string | null;
}

export default function Stores() {
  const [stores, setStores] = useState<PublicStore[]>([]);
  const [failedLogos, setFailedLogos] = useState<Set<string>>(() => new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    api.get<{ success: boolean; data: PublicStore[] }>("/public/stores")
      .then(({ data }) => {
        if (!data.success || !Array.isArray(data.data)) {
          throw new Error("Invalid public store list response");
        }
        if (active) setStores(data.data);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const storeCopies = stores.length
    ? Math.max(6, Math.ceil(12 / stores.length))
    : 0;
  const repeatedStores = Array.from({ length: storeCopies }, () => stores).flat();

  return (
    <section id="stores" className="overflow-hidden bg-zinc-50 py-12 sm:py-16">
      <div className="mx-auto mb-8 max-w-6xl px-4 text-center sm:px-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
          <Store size={14} />
          আমাদের স্টোর
        </span>
        <h2 className="mt-4 text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">
          লাইভ স্টোরগুলো ঘুরে দেখুন
        </h2>
        <p className="mt-3 text-zinc-600">
          আমাদের প্ল্যাটফর্মে চালু থাকা স্টোরগুলো থেকে সরাসরি কেনাকাটা করুন।
        </p>
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-hidden px-4">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="h-[72px] w-[260px] shrink-0 animate-pulse rounded-2xl border border-zinc-100 bg-white" />
          ))}
        </div>
      ) : error ? (
        <p role="alert" className="text-center text-sm text-zinc-500">
          স্টোরের তালিকা লোড করা যায়নি। অনুগ্রহ করে পরে আবার চেষ্টা করুন।
        </p>
      ) : stores.length === 0 ? (
        <p className="text-center text-sm text-zinc-500">
          এখনো কোনো লাইভ স্টোর নেই।
        </p>
      ) : (
        <div className="store-marquee">
          <div className="store-marquee-track">
            {[false, true].map((isDuplicate) => (
              <div
                key={String(isDuplicate)}
                className="store-marquee-group"
                aria-hidden={isDuplicate}
              >
                {repeatedStores.map((store, index) => (
                  <Link
                    key={`${isDuplicate ? "copy-" : ""}${index}-${store.slug}`}
                    href={`/${encodeURIComponent(store.slug)}`}
                    tabIndex={isDuplicate ? -1 : undefined}
                    className="group flex h-[72px] w-[260px] shrink-0 items-center gap-3 rounded-2xl border border-zinc-100 bg-white px-4 shadow-sm transition hover:border-red-100 hover:shadow-lg sm:w-[280px]"
                  >
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50">
                      {store.logo && !failedLogos.has(store.slug) ? (
                        <Image
                          src={store.logo}
                          alt={`${store.name} logo`}
                          fill
                          sizes="48px"
                          unoptimized
                          onError={() =>
                            setFailedLogos((previous) => new Set(previous).add(store.slug))
                          }
                          className="object-contain p-1"
                        />
                      ) : (
                        <Store className="text-zinc-400" size={22} aria-hidden="true" />
                      )}
                    </div>
                    <span className="min-w-0 flex-1 truncate font-bold text-zinc-800 group-hover:text-red-600">
                      {store.name}
                    </span>
                    <ArrowUpRight className="shrink-0 text-zinc-400 transition group-hover:text-red-600" size={18} aria-hidden="true" />
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
