-- Store identity printed on the order receipt/invoice that the admin hands to
-- the delivery rider. Name, address and the thank-you footer are per-language
-- (fa / ar / en); the phone number is a single shared value.
ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS receipt_store_name_fa TEXT,
  ADD COLUMN IF NOT EXISTS receipt_store_name_ar TEXT,
  ADD COLUMN IF NOT EXISTS receipt_store_name_en TEXT,
  ADD COLUMN IF NOT EXISTS receipt_store_address_fa TEXT,
  ADD COLUMN IF NOT EXISTS receipt_store_address_ar TEXT,
  ADD COLUMN IF NOT EXISTS receipt_store_address_en TEXT,
  ADD COLUMN IF NOT EXISTS receipt_store_phone TEXT,
  ADD COLUMN IF NOT EXISTS receipt_footer_fa TEXT,
  ADD COLUMN IF NOT EXISTS receipt_footer_ar TEXT,
  ADD COLUMN IF NOT EXISTS receipt_footer_en TEXT;
