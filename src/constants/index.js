/**
 * src/constants/index.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Central constants for Vishnu Mobile Shop app.
 * All hardcoded business rules and config live here — change once, works everywhere.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── App Info ─────────────────────────────────────────────────────────────────
export const APP_NAME        = 'Vishnu Mobile Shop';
export const APP_SUBTITLE    = 'Inventory Management System';
export const APP_VERSION     = '1.0.0';
export const COPYRIGHT_YEAR  = new Date().getFullYear();

// ── Roles ────────────────────────────────────────────────────────────────────
export const ROLES = {
  ADMIN:            'admin',
  ATTENDANCE_ADMIN: 'attendance_admin',
  STAFF:            'staff',
  MANAGER:          'manager',
};

// All roles that count as admin-level (always approved, full access)
export const ADMIN_ROLES = [ROLES.ADMIN, ROLES.ATTENDANCE_ADMIN];

// Roles selectable when adding a staff member
export const ASSIGNABLE_ROLES = [ROLES.STAFF, ROLES.MANAGER, ROLES.ADMIN];

// ── Salary & Attendance Rules ────────────────────────────────────────────────
export const WORKING_DAYS_PER_MONTH = 30;        // Standard working days assumed per month
// Work day assumed for payroll calculation (used for per-minute late deduction)
export const WORKDAY_START_HOUR      = 9;        // 09:00 AM
export const WORKDAY_END_HOUR        = 20;       // 08:00 PM (default checkout cap)
export const WORKING_HOURS_PER_DAY   = WORKDAY_END_HOUR - WORKDAY_START_HOUR; // 11 hours

// Late rule: salary reduces based on how many minutes late (after 09:00 AM)
export const LATE_CHECKIN_HOUR      = WORKDAY_START_HOUR;
export const LATE_CHECKIN_MINUTE    = 0;

// Legacy/compat (used by some older UI breakdowns)
export const LATE_DEDUCTION_HOURS   = 1;

// ── Stock Thresholds ─────────────────────────────────────────────────────────
export const LOW_STOCK_ALERT_THRESHOLD = 5;      // Units below this triggers low-stock alert
export const DASHBOARD_LOW_STOCK_LIMIT = 5;      // Max low-stock items shown on home dashboard
export const RECENT_ORDERS_LIMIT       = 3;      // Max recent orders shown on home dashboard

// ── Password Policy ──────────────────────────────────────────────────────────
export const DEFAULT_PASSWORD_SUFFIX = '@123';   // Auto-generated staff password: username@123

// ── Analytics ────────────────────────────────────────────────────────────────
export const ESTIMATED_PROFIT_MARGIN = 0.15;     // 15% estimated profit margin for charts

// ── QR / Timer ───────────────────────────────────────────────────────────────
export const QR_EXPIRY_WARNING_SECONDS  = 60;    // Timer turns orange below this
export const QR_EXPIRY_CRITICAL_SECONDS = 30;    // Timer turns red below this

// ── Theme Colors (core palette — use in StyleSheet for consistency) ───────────
export const COLORS = {
  primary:   '#2D2F8E',
  success:   '#22c55e',
  warning:   '#f59e0b',
  danger:    '#ef4444',
  text:      '#1E293B',
  muted:     '#64748B',
  bg:        '#F5F6FA',
  card:      '#FFFFFF',
  border:    '#E2E8F0',
};