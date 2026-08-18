import { ProductGrid } from "@/app/(storefront)/_components/ProductGrid";

export default function StorefrontHomePage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <section className="mb-10 rounded-2xl bg-gradient-to-l from-emerald-600 to-emerald-500 p-8 text-white">
        <h1 className="text-3xl font-bold">خرید آنلاین از سوپرمارکت</h1>
        <p className="mt-2 max-w-xl text-emerald-50">
          تازه‌ترین محصولات با ارسال سریع — امروز سفارش بده، فردا تحویل بگیر.
        </p>
      </section>
      <ProductGrid />
    </main>
  );
}
