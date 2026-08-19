import type { Metadata } from "next";
import { AdminDirRoot } from "@/app/(admin)/_components/AdminDirRoot";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AdminDirRoot>{children}</AdminDirRoot>;
}
