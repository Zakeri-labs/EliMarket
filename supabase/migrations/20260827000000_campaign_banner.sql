-- Optional homepage hero image for a live campaign.
-- Hidden automatically when the campaign is inactive or outside its time window.

ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS banner_image_url TEXT,
  ADD COLUMN IF NOT EXISTS banner_blur_hash TEXT;

NOTIFY pgrst, 'reload schema';
