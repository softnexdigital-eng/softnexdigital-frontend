interface AnnouncementBarProps {
  text?: string | null;
  primary: string;
  placeholder?: boolean;
}

export default function AnnouncementBar({ text, primary, placeholder = false }: AnnouncementBarProps) {
  const content = text?.trim() || (placeholder ? "" : "");
  if (!content) return null;

  return (
    <div
      className="flex min-h-[38px] items-center justify-center px-4 py-2 text-center text-sm font-medium text-white"
      style={{ background: primary }}
    >
      {content}
    </div>
  );
}