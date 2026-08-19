import { extractActionErrorMessage } from "@/app/_actions/extract-action-error";
import { serverT } from "@/i18n/server";

export async function actionErrorMessage(
  messagePath: string,
  err: unknown,
): Promise<string> {
  const fallback = await serverT(messagePath);
  return extractActionErrorMessage(err, fallback);
}
