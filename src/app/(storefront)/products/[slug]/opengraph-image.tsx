import { ImageResponse } from "next/og";
import { getProductBySlugAction } from "@/app/_actions/product-actions";
import { productCover } from "@/lib/products/gallery";
import { BRAND_NAME, DEFAULT_CURRENCY, formatPrice } from "@/config/brand";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ slug: string }> };

export default async function ProductOgImage({ params }: Props) {
  const { slug } = await params;
  const result = await getProductBySlugAction(slug);

  const name = result.success ? result.data.name : "Product";
  const price = result.success ? result.data.price : 0;
  const currency = result.success ? result.data.currency : DEFAULT_CURRENCY;
  const imageUrl = result.success ? productCover(result.data)?.image_url ?? null : null;

  const priceLabel = formatPrice(Number(price), currency, "en");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#0f0f0f",
          padding: 60,
          gap: 48,
        }}
      >
        <div
          style={{
            width: 480,
            height: 510,
            borderRadius: 24,
            background: "#1a1a1a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            border: "2px solid #2e2e2e",
          }}
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt=""
              width={480}
              height={510}
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div style={{ fontSize: 48, color: "#2dd4bf" }}>🛒</div>
          )}
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 24,
          }}
        >
          <div style={{ fontSize: 28, color: "#2dd4bf", fontWeight: 600 }}>
            {BRAND_NAME}
          </div>
          <div
            style={{
              fontSize: 52,
              fontWeight: 700,
              color: "#f4f4f5",
              lineHeight: 1.2,
              maxWidth: 560,
            }}
          >
            {name}
          </div>
          <div style={{ fontSize: 40, color: "#2dd4bf", fontWeight: 700 }}>
            {priceLabel}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
