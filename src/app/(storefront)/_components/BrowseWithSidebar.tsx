import { cn } from "@/app/utils/cn";

type Props = {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

/** Sidebar sits on the inline-start side: left in English, right in Persian/Arabic. */
export function BrowseWithSidebar({ sidebar, children, className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-start md:gap-6 lg:gap-8",
        className,
      )}
    >
      <aside className="w-full shrink-0 md:sticky md:top-32 md:w-56 lg:w-64">
        {sidebar}
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
