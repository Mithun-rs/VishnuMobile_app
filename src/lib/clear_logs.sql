-- ════════════════════════════════════════════════════════════════════
-- CLEAR ATTENDANCE LOGS
-- ════════════════════════════════════════════════════════════════════

-- This deletes ALL rows in the attendance_logs table
TRUNCATE TABLE public.attendance_logs;

-- (Or if you ONLY want to delete today's test logs, use this instead:)
-- DELETE FROM public.attendance_logs WHERE date(created_at) = current_date;
