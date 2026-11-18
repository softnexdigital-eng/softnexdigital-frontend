"use client";

interface StoreFooterProps {
  companyName: string;
  intro: string;
  phone: string;
  email: string;
  address: string;
}

export default function StoreFooter({ companyName, intro, phone, email, address }: StoreFooterProps) {
  const title = "mb-1.5 block text-sm font-bold text-white";
  return (
    <footer className="mt-12 bg-[#14161b] py-8 text-[13px] text-[#c9ccd4]">
      <div className="mx-auto max-w-[1280px] px-5">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
          <div>
            <b className={title}>{companyName}</b>
            <p className="leading-relaxed">{intro}</p>
          </div>
          <div>
            <b className={title}>যোগাযোগ</b>
            <ul className="space-y-1.5">
              {phone && <li>ফোন: {phone}</li>}
              {email && <li>ইমেইল: {email}</li>}
              {/* {address && <li>ঠিকানা: {address}</li>} */}
            </ul>
          </div>
          <div>
            <b className={title}>সহায়তা</b>
            <ul className="space-y-1.5">
              <li>ডেলিভারি নীতি</li>
              <li>রিটার্ন ও রিফান্ড</li>
              <li>সহায়তা কেন্দ্র</li>
              <li>গোপনীয়তা নীতি</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-[#3d3d4a] pt-6 text-center text-[11px] text-[#8a8a93]">
          © {new Date().getFullYear()} {companyName}. সর্বস্বত্ব সংরক্ষিত।
        </div>
      </div>
    </footer>
  );
}
