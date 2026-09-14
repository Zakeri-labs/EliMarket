/**
 * iSmart SMS (Infocomm Group LLC, Oman) — HTTP POST Method API.
 * Doc: "iSmart SMS Push-Multi Header International- HTTP POST METHOD v1.0"
 *
 * Requires SMS_USERNAME, SMS_PASSWORD and SMS_HEADER (an 11-character
 * sender ID pre-registered with Infocomm) in the environment.
 */

const DEFAULT_API_URL =
  "https://www.ismartsms.net/iBulkSMS/HttpWS/SMSDynamicRefIntlAPI.aspx";

const RETURN_CODE_MESSAGES: Record<string, string> = {
  "1": "Message pushed successfully.",
  "2": "Company not found — check the iSmart SMS account.",
  "3": "User or password is wrong.",
  "4": "Credit is low.",
  "5": "Message is blank.",
  "6": "Message length exceeded.",
  "7": "Account is inactive.",
  "8": "Mobile number is empty.",
  "9": "Invalid mobile number.",
  "10": "Invalid language.",
  "11": "Unknown error.",
  "12": "Account is blocked by administrator (concurrent login failure).",
  "13": "Account expired.",
  "14": "Credit expired.",
  "15": "Invalid HTTP request or parameter fields are wrong.",
  "16": "Invalid date/time parameter.",
  "17": "Web service user ID is not registered.",
  "18": "User not registered to use this API.",
  "19": "Header (sender ID) not registered with Infocomm.",
  "20": "Client IP address has been blocked — ask Infocomm to whitelist the server's IP.",
};

export class SmsSendError extends Error {
  constructor(public readonly code: string) {
    super(RETURN_CODE_MESSAGES[code] ?? `iSmart SMS returned an unrecognized code: ${code}`);
    this.name = "SmsSendError";
  }
}

/**
 * 0 = GSM7 (Latin script). 64 = Unicode — the doc calls it "Arabic" but it's
 * really "use UCS2 encoding", so Persian text also needs 64, not 0.
 */
export type SmsEncoding = "latin" | "unicode";

export async function sendSms(
  phone: string,
  message: string,
  encoding: SmsEncoding = "latin",
) {
  const userId = process.env.SMS_USERNAME;
  const password = process.env.SMS_PASSWORD;
  const header = process.env.SMS_HEADER;
  if (!userId || !password || !header) {
    throw new Error(
      "SMS_USERNAME, SMS_PASSWORD and SMS_HEADER must be set to send SMS via iSmart SMS.",
    );
  }

  const apiUrl = process.env.SMS_API_URL?.trim() || DEFAULT_API_URL;
  // Doc shows the number without a leading "+" (e.g. 97199XXXXXX).
  const mobileNo = phone.replace(/[^0-9]/g, "");

  const body = new URLSearchParams({
    UserId: userId,
    Password: password,
    MobileNo: mobileNo,
    Message: message,
    Lang: encoding === "unicode" ? "64" : "0",
    Header: header,
  });

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error(`iSmart SMS request failed with HTTP ${response.status}`);
  }

  const raw = (await response.text()).trim();
  const code = raw.match(/\d+/)?.[0] ?? raw;
  if (code !== "1") {
    throw new SmsSendError(code);
  }
}
