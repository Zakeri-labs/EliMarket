import { encode } from "blurhash";
import sharp from "sharp";

const BLUR_COMPONENTS_X = 4;
const BLUR_COMPONENTS_Y = 3;
const BLUR_MAX_SIZE = 32;

/** Generate a compact BlurHash string from raw image bytes (upload-time only). */
export async function generateBlurHashFromBuffer(buffer: Buffer): Promise<string> {
  const { data, info } = await sharp(buffer)
    .rotate()
    .raw()
    .ensureAlpha()
    .resize(BLUR_MAX_SIZE, BLUR_MAX_SIZE, { fit: "inside" })
    .toBuffer({ resolveWithObject: true });

  return encode(
    new Uint8ClampedArray(data),
    info.width,
    info.height,
    BLUR_COMPONENTS_X,
    BLUR_COMPONENTS_Y,
  );
}

export async function generateBlurHashFromFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return generateBlurHashFromBuffer(buffer);
}
