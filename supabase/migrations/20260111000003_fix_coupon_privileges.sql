-- Restrict coupon consumption to server-side only
-- Client should only call validate_coupon; coupon usage is marked after payment capture.

REVOKE ALL ON FUNCTION public.mark_coupon_as_used(TEXT) FROM anon;
REVOKE ALL ON FUNCTION public.mark_coupon_as_used(TEXT) FROM authenticated;

GRANT EXECUTE ON FUNCTION public.mark_coupon_as_used(TEXT) TO service_role;
