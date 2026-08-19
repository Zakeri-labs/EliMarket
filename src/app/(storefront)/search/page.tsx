import { Suspense } from "react";
import { SearchContent } from "./SearchContent";
import { serverT } from "@/i18n/server";

async function SearchLoading() {
  const label = await serverT("common.loading");
  return <main className="px-4 py-8 text-muted">{label}</main>;
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchContent />
    </Suspense>
  );
}
