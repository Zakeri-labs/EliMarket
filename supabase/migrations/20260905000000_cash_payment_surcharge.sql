-- Configurable surcharge added to the invoice total when the customer
-- picks "cash on delivery" at checkout. 0 = no extra fee (default).
ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS cash_surcharge NUMERIC(12, 3) NOT NULL DEFAULT 0
    CHECK (cash_surcharge >= 0);

-- Snapshot of the surcharge actually charged on each order, for the record.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS cash_fee NUMERIC(12, 3) NOT NULL DEFAULT 0;
