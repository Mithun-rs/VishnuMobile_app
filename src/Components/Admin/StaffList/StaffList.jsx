import React, { useState, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  WORKING_DAYS_PER_MONTH,
  DEFAULT_PASSWORD_SUFFIX,
  ASSIGNABLE_ROLES,
  ROLES,
  WORKDAY_START_HOUR,
  WORKDAY_END_HOUR,
} from '../../../constants';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Svg2, { Path, Circle, Polyline, Line } from 'react-native-svg';
import EditIcon   from '../../../assets/edit.svg';
import DeleteIcon from '../../../assets/delete.svg';
import CalendarIcon2 from '../../../assets/CalenderIcon2.svg';
import { supabase } from '../../../lib/supabase';

// ── Icons ────────────────────────────────────────────────────────────────────
const ProfileIcon = ({ size = 18, color = '#fff' }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" />
  </Svg2>
);

const SettingsIcon = ({ size = 18, color = '#2D2F8E' }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
    <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg2>
);

const LogoutIcon = ({ size = 18, color = '#ef4444' }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="16 17 21 12 16 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="21" y1="12" x2="9" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg2>
);

const CalendarIcon = ({ size = 16, color = '#2D2F8E' }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg2>
);

const TrashIcon = ({ size = 15, color = '#EF5350' }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline points="3 6 5 6 21 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg2>
);

const SearchIcon = ({ size = 16, color = '#94A3B8' }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2" />
    <Line x1="21" y1="21" x2="16.65" y2="16.65" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg2>
);

const BellIcon = ({ size = 16, color = '#F59E0B' }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg2>
);

const UsersIcon = ({ size = 32, color = '#CBD5E1' }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth="1.5" />
    <Path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 3.13a4 4 0 0 1 0 7.75" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg2>
);

const CheckCircleIcon = ({ size = 16, color = '#22C55E' }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="22 4 12 14.01 9 11.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg2>
);

const HolidayIcon = ({ size = 16, color = '#8B5CF6' }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path d="M12 6v6l4 2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg2>
);

const CheckIcon = ({ size = 13, color = '#fff' }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline points="20 6 9 17 4 12" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg2>
);

const CloseIcon = ({ size = 13, color = '#fff' }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="18" y1="6" x2="6" y2="18" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <Line x1="6" y1="6" x2="18" y2="18" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </Svg2>
);

// ─── Avatar Placeholder ───────────────────────────────────────────────────────
const AVATAR_COLORS = ['#FFF8E1','#FFF3E0','#E8EAF6','#E3F2FD','#FCE4EC','#E8F5E9'];

const AvatarPlaceholder = ({ name = '?', bgColor, size = 56 }) => {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <View style={{
      width: size, height: size, borderRadius: 14,
      backgroundColor: bgColor || '#EEF0FF',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <Text style={{ fontSize: size * 0.34, fontWeight: '800', color: '#2D2F8E' }}>
        {initials}
      </Text>
    </View>
  );
};

// ─── Custom Alert Modal ──────────────────────────────────────────────────────
const CustomAlertModal = ({ visible, title, message, buttons, onClose }) => {
  if (!visible) return null;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlayCentered}>
        <View style={[styles.modalCard, { width: '85%', maxWidth: 320, paddingBottom: 20 }]}>
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: '#1A1A2E', textAlign: 'center', marginBottom: 8 }}>
              {title}
            </Text>
            {!!message && (
              <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 18 }}>
                {message}
              </Text>
            )}
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12, justifyContent: 'center' }}>
            {buttons && buttons.length > 0 ? (
              buttons.map((btn, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    btn.style === 'destructive' ? styles.actionBtnDelete : styles.cancelBtn,
                    { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' }
                  ]}
                  onPress={() => {
                    onClose();
                    btn.onPress?.();
                  }}
                >
                  <Text style={[
                    btn.style === 'destructive' ? { color: '#EF5350', fontWeight: '800' } : { color: '#64748B', fontWeight: '800' },
                    { fontSize: 12, letterSpacing: 0.5 }
                  ]}>
                    {btn.text.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <TouchableOpacity
                style={[styles.saveBtn, { flex: 1, paddingVertical: 12, borderRadius: 10 }]}
                onPress={onClose}
              >
                <Text style={[styles.saveBtnText, { fontSize: 12, letterSpacing: 0.5 }]}>OK</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ─── Role badge styles ────────────────────────────────────────────────────────
const ROLE_STYLES = {
  'staff':   { bg: '#E3F2FD', color: '#1565C0', label: 'STAFF' },
  'admin':   { bg: '#FCE4EC', color: '#B71C1C', label: 'ADMIN' },
  'manager': { bg: '#E8F5E9', color: '#2E7D32', label: 'MANAGER' },
};

const getRoleStyle = (role) =>
  ROLE_STYLES[role?.toLowerCase()] ?? { bg: '#F5F6FA', color: '#555', label: (role || 'STAFF').toUpperCase() };

// ─── Staff Card ───────────────────────────────────────────────────────────────
const StaffCard = ({ member, onEdit, onDelete, onPress }) => {
  const rs = getRoleStyle(member.role);
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(member)}
      activeOpacity={0.85}>
      <View style={styles.cardTop}>
        <AvatarPlaceholder name={member.full_name || member.username} bgColor={member.avatarBg} size={56} />
        <View style={styles.cardNameBlock}>
          <Text style={styles.cardName}>{member.full_name || member.username}</Text>
          <View style={[styles.roleBadge, { backgroundColor: rs.bg }]}>
            <Text style={[styles.roleBadgeText, { color: rs.color }]}>{rs.label}</Text>
          </View>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            onPress={() => onEdit(member)}
            style={styles.actionBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <EditIcon width={17} height={17} stroke="#607D8B" />
          </TouchableOpacity>
          <TouchableOpacity
  onPress={() => onDelete(member)}
  style={[styles.actionBtn, styles.actionBtnDelete]}  // ← add actionBtnDelete
  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <DeleteIcon width={17} height={17} fill="#EF5350" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.cardDivider} />
      <View style={styles.cardMeta}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>USERNAME</Text>
          <Text style={styles.metaValue}>{member.username || '—'}</Text>
        </View>
        <View style={styles.metaSeparator} />
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>PHONE NUMBER</Text>
          <Text style={styles.metaValue}>{member.phone || '—'}</Text>
        </View>
        <View style={styles.metaSeparator} />
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>SHOP</Text>
          <Text style={styles.metaValue}>{member.assigned_shop === 'shop2' ? 'Shop 2' : 'Shop 1'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── Salary Calculator Helpers ────────────────────────────────────────────────
// WORKING_DAYS_PER_MONTH and WORKING_HOURS_PER_DAY come from src/constants/index.js

function enumerateDatesInclusive(fromDateStr, toDateStr) {
  const out = [];
  const start = new Date(fromDateStr);
  const end = new Date(toDateStr);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  for (let d = new Date(start); d.getTime() <= end.getTime(); d.setDate(d.getDate() + 1)) {
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }
  return out;
}

// Salary Model:
// - perDay  = baseSalary / WORKING_DAYS_PER_MONTH
// - perHour = perDay / WORKING_HOURS_PER_DAY  (hours between WORKDAY_START_HOUR and WORKDAY_END_HOUR)
// - Earned  = actual hours worked × perHour
// - Default checkout = WORKDAY_END_HOUR (8:00 PM) if no checkout recorded
// - Checkout capped at WORKDAY_END_HOUR even if staff checks out later
// - Leave days  → ₹0 (skipped entirely)
// - Holiday days → ₹0 (skipped entirely)
const computeSalary = (baseSalary, attendanceLogs, approvedLeaves, holidays) => {
  const base    = parseFloat(baseSalary) || 0;
  const workingHoursPerDay = WORKDAY_END_HOUR - WORKDAY_START_HOUR; // e.g. 20 - 9 = 11
  const perDay  = base / WORKING_DAYS_PER_MONTH;
  const perHour = perDay / workingHoursPerDay;

  // Build leave and holiday date sets
  const leaveDayKeys   = new Set();
  const holidayDayKeys = new Set((holidays || []).map(h => h.date));
  (approvedLeaves || []).forEach(lv => {
    enumerateDatesInclusive(lv.from_date, lv.to_date).forEach(d => leaveDayKeys.add(d));
  });

  // Group logs by date — earliest check-in, latest check-out
  const byDate = new Map();
  (attendanceLogs || []).forEach(log => {
    const d   = new Date(log.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    if (!byDate.has(key)) byDate.set(key, { checkIn: null, checkOut: null });
    const entry = byDate.get(key);
    if (log.check_type === 'CHECK_IN') {
      if (!entry.checkIn || new Date(log.created_at) < new Date(entry.checkIn.created_at))
        entry.checkIn = log;
    } else if (log.check_type === 'CHECK_OUT') {
      if (!entry.checkOut || new Date(log.created_at) > new Date(entry.checkOut.created_at))
        entry.checkOut = log;
    }
  });

  let totalHoursWorked = 0;
  let totalDaysWorked  = 0;

  for (const [key, { checkIn, checkOut }] of byDate.entries()) {
    if (!checkIn) continue;              // No check-in → skip day
    if (leaveDayKeys.has(key))   continue; // Approved leave → ₹0
    if (holidayDayKeys.has(key)) continue; // Holiday → ₹0

    const checkInTime = new Date(checkIn.created_at);

    // Default checkout = WORKDAY_END_HOUR (8:00 PM) of that day
    const eod = new Date(checkInTime);
    eod.setHours(WORKDAY_END_HOUR, 0, 0, 0);

    let checkOutTime;
    if (checkOut) {
      checkOutTime = new Date(checkOut.created_at);
      if (checkOutTime > eod) checkOutTime = eod; // Cap checkout at 8 PM
    } else {
      checkOutTime = eod; // No checkout recorded → assume full shift till 8 PM
    }

    const hoursWorked = Math.max(0, (checkOutTime - checkInTime) / (1000 * 60 * 60));
    totalHoursWorked += hoursWorked;
    totalDaysWorked  += 1;
  }

  const netSalary = Math.max(0, totalHoursWorked * perHour);

  return {
    base,
    workingHoursPerDay,
    perDay,
    perHour,
    totalDaysWorked,
    totalHoursWorked,
    netSalary,
  };
};

// ─── Staff Detail Modal ───────────────────────────────────────────────────────
const StaffDetailModal = ({ visible, member, onClose, onEdit }) => {
  const [attendance,      setAttendance]      = useState([]);
  const [loadingAtt,      setLoadingAtt]      = useState(false);
  const [approvedLeaves,  setApprovedLeaves]  = useState([]);
  const [holidays,        setHolidays]        = useState([]);

  const [deduction,       setDeduction]       = useState(null);  // { id, amount, reason } | null
  const [editingDed,      setEditingDed]      = useState(false);
  const [dedAmount,       setDedAmount]       = useState('');
  const [dedReason,       setDedReason]       = useState('');
  const [savingDed,       setSavingDed]       = useState(false);

  const currentMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM'

  React.useEffect(() => {
    if (!visible || !member) return;
   const fetchData = async () => {
  setLoadingAtt(true);
  setEditingDed(false);
  try {
    const now   = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

    // ✅ All 4 queries fire at the same time
    const [attRes, leaveRes, holidayRes, dedRes] = await Promise.all([
      supabase
        .from('attendance_logs')
        .select('id, status, check_type, created_at')
        .eq('staff_id', member.id)
        .gte('created_at', start)
        .lte('created_at', end),
      supabase
        .from('leave_requests')
        .select('id, from_date, to_date, status')
        .eq('staff_id', member.id)
        .eq('status', 'approved'),
      supabase
        .from('holidays')
        .select('date'),
      supabase
        .from('salary_deductions')
        .select('id, amount, reason')
        .eq('staff_id', member.id)
        .eq('month', currentMonth)
        .maybeSingle(),
    ]);

    setAttendance(attRes.data || []);
    setApprovedLeaves(leaveRes.data || []);
    setHolidays(holidayRes.data || []);

    const dedData = dedRes.data || null;
    setDeduction(dedData);
    setDedAmount(dedData ? String(dedData.amount) : '');
    setDedReason(dedData ? (dedData.reason || '') : '');

  } catch (e) {
    console.warn('StaffDetailModal fetch error:', e.message);
  } finally {
    setLoadingAtt(false);
  }
};
    fetchData();
  }, [visible, member]);

  const handleSaveDeduction = async () => {
    const amt = parseFloat(dedAmount.trim());
    if (isNaN(amt) || amt < 0) {
      Alert.alert('Invalid', 'Enter a valid deduction amount (0 or more).');
      return;
    }
    if (!dedReason.trim()) {
      Alert.alert('Missing', 'Please enter a reason for the deduction.');
      return;
    }
    setSavingDed(true);
    try {
      if (deduction) {
        // Update existing
        const { error } = await supabase
          .from('salary_deductions')
          .update({ amount: amt, reason: dedReason.trim() })
          .eq('id', deduction.id);
        if (error) throw error;
        setDeduction({ ...deduction, amount: amt, reason: dedReason.trim() });
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('salary_deductions')
          .insert({ staff_id: member.id, month: currentMonth, amount: amt, reason: dedReason.trim() })
          .select('id, amount, reason')
          .single();
        if (error) throw error;
        setDeduction(data);
      }
      setEditingDed(false);
      Alert.alert('✅ Saved', 'Deduction updated successfully.');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSavingDed(false);
    }
  };

  const handleRemoveDeduction = () => {
    Alert.alert('Remove Deduction', 'Remove this deduction for the month?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          try {
            await supabase.from('salary_deductions').delete().eq('id', deduction.id);
            setDeduction(null);
            setDedAmount('');
            setDedReason('');
            setEditingDed(false);
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        }
      }
    ]);
  };

  if (!member) return null;

  const rs  = getRoleStyle(member.role);
  const sal = computeSalary(member.salary, attendance, approvedLeaves, holidays);
  const fmt = (n) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  const dedAmt     = deduction ? parseFloat(deduction.amount) : 0;
  const finalPay   = Math.max(0, sal.netSalary - dedAmt);
  const monthName  = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' });

  const DetailRow = ({ label, value }) => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || '—'}</Text>
    </View>
  );

  return (
    <Modal visible={visible} transparent onRequestClose={onClose}>
      <View style={styles.detailOverlay}>
        <View style={styles.detailSheet}>
          <View style={styles.detailHandle} />

          <View style={styles.detailHeader}>
            <AvatarPlaceholder name={member.full_name || member.username} bgColor={member.avatarBg} size={68} />
            <View style={styles.detailHeaderText}>
              <Text style={styles.detailName}>{member.full_name || member.username}</Text>
              <View style={[styles.roleBadge, { backgroundColor: rs.bg, marginTop: 6 }]}>
                <Text style={[styles.roleBadgeText, { color: rs.color }]}>{rs.label}</Text>
              </View>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <DetailRow label="USERNAME"    value={member.username} />
            <DetailRow label="PHONE"       value={member.phone} />
            <DetailRow label="EMAIL"       value={member.email} />
            <DetailRow label="BASE SALARY" value={member.salary ? fmt(member.salary) : '—'} />
            <DetailRow label="ASSIGNED SHOP" value={member.assigned_shop === 'shop2' ? 'Shop 2' : 'Shop 1'} />
{/* ── TODAY'S STATUS ── */}
{(() => {
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayLogs = attendance.filter(log => {
    const d = new Date(log.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    return key === todayKey;
  });

  const checkIn  = todayLogs.filter(l => l.check_type === 'CHECK_IN')
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))[0] || null;
  const checkOut = todayLogs.filter(l => l.check_type === 'CHECK_OUT')
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0] || null;

  const fmtTime = (log) => log
    ? new Date(log.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    : null;

  let hoursWorked = null;
  if (checkIn) {
    const inTime  = new Date(checkIn.created_at);
    const eod     = new Date(inTime);
    eod.setHours(WORKDAY_END_HOUR, 0, 0, 0);
    const outTime = checkOut
      ? Math.min(new Date(checkOut.created_at), eod)
      : new Date();
    hoursWorked = Math.max(0, (outTime - inTime) / (1000 * 60 * 60));
  }

  const isPresent = !!checkIn;
  const isCheckedOut = !!checkOut;

  return (
    <View style={todayStyles.card}>
      <View style={todayStyles.header}>
        <View style={todayStyles.headerLeft}>
          <View style={[todayStyles.statusDot, { backgroundColor: isPresent ? '#22C55E' : '#EF5350' }]} />
          <Text style={todayStyles.title}>TODAY'S STATUS</Text>
        </View>
        <View style={[todayStyles.badge, { backgroundColor: isPresent ? '#F0FFF4' : '#FFF5F5', borderColor: isPresent ? '#BBF7D0' : '#FFD5D5' }]}>
          <Text style={[todayStyles.badgeText, { color: isPresent ? '#15803D' : '#EF5350' }]}>
            {isPresent ? (isCheckedOut ? 'COMPLETED' : 'ON DUTY') : 'ABSENT'}
          </Text>
        </View>
      </View>

      <View style={todayStyles.row}>
        {/* Check In */}
        <View style={todayStyles.box}>
          <Text style={todayStyles.boxLabel}>CHECK IN</Text>
          {checkIn ? (
            <>
              <Text style={[todayStyles.boxTime, { color: '#22C55E' }]}>{fmtTime(checkIn)}</Text>
              <Text style={todayStyles.boxSub}>
                {new Date(checkIn.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
              </Text>
            </>
          ) : (
            <Text style={todayStyles.boxEmpty}>Not checked in</Text>
          )}
        </View>

        <View style={todayStyles.separator} />

        {/* Check Out */}
        <View style={todayStyles.box}>
          <Text style={todayStyles.boxLabel}>CHECK OUT</Text>
          {checkOut ? (
            <>
              <Text style={[todayStyles.boxTime, { color: '#EF5350' }]}>{fmtTime(checkOut)}</Text>
              <Text style={todayStyles.boxSub}>
                {new Date(checkOut.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
              </Text>
            </>
          ) : (
            <Text style={todayStyles.boxEmpty}>{isPresent ? 'Still on duty' : '—'}</Text>
          )}
        </View>

        <View style={todayStyles.separator} />

        {/* Hours */}
        <View style={todayStyles.box}>
          <Text style={todayStyles.boxLabel}>HOURS</Text>
          {hoursWorked !== null ? (
            <>
              <Text style={[todayStyles.boxTime, { color: '#2D2F8E' }]}>{hoursWorked.toFixed(1)}h</Text>
              <Text style={todayStyles.boxSub}>{isCheckedOut ? 'total' : 'so far'}</Text>
            </>
          ) : (
            <Text style={todayStyles.boxEmpty}>—</Text>
          )}
        </View>
      </View>
    </View>
  );
})()}
            <View style={styles.salaryCard}>
              <View style={styles.salaryCardHeader}>
                <Text style={styles.salaryCardTitle}>Salary — {monthName}</Text>
                {loadingAtt && <ActivityIndicator size="small" color="#3D5AFE" />}
              </View>

              {sal.base === 0 ? (
                <Text style={styles.salaryNoData}>No base salary set. Edit staff to add salary.</Text>
              ) : (
                <>
                  <Text style={styles.salarySubHead}>RATE BREAKDOWN</Text>

                  <View style={styles.salaryRow}>
                    <Text style={styles.salaryRowLabel}>Base Salary</Text>
                    <Text style={styles.salaryRowValue}>{fmt(sal.base)}</Text>
                  </View>
                  <View style={styles.salaryRow}>
                    <View>
                      <Text style={styles.salaryRowLabel}>Per Day Rate</Text>
                      <Text style={styles.salaryHelperText}>{fmt(sal.base)} ÷ {WORKING_DAYS_PER_MONTH} days</Text>
                    </View>
                    <Text style={styles.salaryRowValue}>{fmt(sal.perDay)}</Text>
                  </View>
                  <View style={styles.salaryRow}>
                    <View>
                      <Text style={styles.salaryRowLabel}>Per Hour Rate</Text>
                      <Text style={styles.salaryHelperText}>{fmt(sal.perDay)} ÷ {sal.workingHoursPerDay} hrs/day</Text>
                    </View>
                    <Text style={styles.salaryRowValue}>{fmt(sal.perHour)}</Text>
                  </View>

                  <View style={styles.salaryDivider} />
                  <Text style={styles.salarySubHead}>THIS MONTH'S WORK</Text>

                  <View style={styles.salaryRow}>
                    <Text style={styles.salaryRowLabel}>Days Worked</Text>
                    <Text style={styles.salaryRowValue}>{sal.totalDaysWorked} days</Text>
                  </View>
                  <View style={styles.salaryRow}>
                    <View>
                      <Text style={styles.salaryRowLabel}>Total Hours Worked</Text>
                      <Text style={styles.salaryHelperText}>{sal.totalHoursWorked.toFixed(2)} hrs × {fmt(sal.perHour)}/hr</Text>
                    </View>
                    <Text style={styles.salaryRowValue}>{fmt(sal.totalHoursWorked * sal.perHour)}</Text>
                  </View>

                  {/* ── Net Payable ── */}
                  <View style={styles.salaryDivider} />
                  <View style={[styles.salaryRow, styles.salaryNetRow]}>
                    <Text style={styles.salaryNetLabel}>NET PAYABLE</Text>
                    <Text style={[styles.salaryNetValue, dedAmt > 0 && { textDecorationLine: 'line-through', fontSize: 15, color: '#94A3B8' }]}>
                      {fmt(sal.netSalary)}
                    </Text>
                  </View>

                  {/* ── Deduction Block ── */}
                  {deduction && !editingDed && (
                    <>
                      <View style={styles.deductionRow}>
                        <View style={styles.deductionLeft}>
                          <Text style={styles.deductionLabel}>DEDUCTION</Text>
                          <Text style={styles.deductionReason} numberOfLines={1}>{deduction.reason}</Text>
                        </View>
                        <View style={styles.deductionRight}>
                          <Text style={styles.deductionAmt}>− {fmt(dedAmt)}</Text>
                          <TouchableOpacity onPress={() => setEditingDed(true)} style={styles.deductionEditBtn}>
                            <Text style={styles.deductionEditBtnText}>Edit</Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={[styles.salaryRow, { paddingTop: 4 }]}>
                        <Text style={[styles.salaryNetLabel, { color: '#EF5350' }]}>FINAL PAYABLE</Text>
                        <Text style={[styles.salaryNetValue, { color: '#EF5350' }]}>{fmt(finalPay)}</Text>
                      </View>
                    </>
                  )}

                  {/* No deduction yet — show add button */}
                  {!deduction && !editingDed && (
                    <TouchableOpacity style={styles.addDeductionBtn} onPress={() => setEditingDed(true)}>
                      <Text style={styles.addDeductionBtnText}>+ Add Deduction</Text>
                    </TouchableOpacity>
                  )}

                  {/* ── Deduction Edit Form ── */}
                  {editingDed && (
                    <View style={styles.deductionForm}>
                      <Text style={styles.deductionFormTitle}>
                        {deduction ? 'EDIT DEDUCTION' : 'ADD DEDUCTION'}
                      </Text>

                      <Text style={styles.fieldLabel}>AMOUNT (₹)</Text>
                      <TextInput
                        style={[styles.fieldInput, { marginBottom: 10 }]}
                        placeholder="e.g. 500"
                        placeholderTextColor="#BFC8D6"
                        keyboardType="numeric"
                        value={dedAmount}
                        onChangeText={setDedAmount}
                        editable={!savingDed}
                      />

                      <Text style={styles.fieldLabel}>REASON</Text>
                      <TextInput
                        style={[styles.fieldInput, { marginBottom: 12, height: 72, textAlignVertical: 'top', paddingTop: 10 }]}
                        placeholder="e.g. Late arrival on 3 days, damaged item..."
                        placeholderTextColor="#BFC8D6"
                        multiline
                        value={dedReason}
                        onChangeText={setDedReason}
                        editable={!savingDed}
                      />

                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        {deduction && (
                          <TouchableOpacity
                            style={styles.deductionRemoveBtn}
                            onPress={handleRemoveDeduction}
                            disabled={savingDed}>
                            <Text style={styles.deductionRemoveBtnText}>Remove</Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          style={styles.cancelBtn}
                          onPress={() => {
                            setEditingDed(false);
                            setDedAmount(deduction ? String(deduction.amount) : '');
                            setDedReason(deduction ? (deduction.reason || '') : '');
                          }}
                          disabled={savingDed}>
                          <Text style={styles.cancelBtnText}>CANCEL</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.saveBtn, { flex: 2 }, savingDed && { opacity: 0.7 }]}
                          onPress={handleSaveDeduction}
                          disabled={savingDed}>
                          {savingDed
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={styles.saveBtnText}>SAVE</Text>
                          }
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  <Text style={styles.salaryBasis}>
                    Paid for actual hours worked · Default checkout {String(WORKDAY_END_HOUR).padStart(2,'0')}:00 · Leave & holidays = ₹0
                  </Text>
                </>
              )}
            </View>
          </ScrollView>

          <View style={styles.detailFooter}>
            <TouchableOpacity
              style={styles.detailEditBtn}
              onPress={() => { onClose(); onEdit(member); }}
              activeOpacity={0.85}>
              <EditIcon width={15} height={15} stroke="#fff" />
              <Text style={styles.detailEditBtnText}>EDIT STAFF</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.detailCloseBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.detailCloseBtnText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ─── Add / Edit Staff Modal ───────────────────────────────────────────────────
const AddStaffModal = ({ visible, onClose, onRefresh, editingMember }) => {
  const isEdit = !!editingMember;

  const [fullName,  setFullName]  = useState('');
  const [username,  setUsername]  = useState('');
  const [phone,     setPhone]     = useState('');
  const [role,      setRole]      = useState('staff');
  const [salary,    setSalary]    = useState('');
  const [assignedShop, setAssignedShop] = useState('shop1');
  const [saving,    setSaving]    = useState(false);

  React.useEffect(() => {
    if (editingMember) {
      setFullName(editingMember.full_name || '');
      setUsername(editingMember.username  || '');
      setPhone(editingMember.phone        || '');
      setRole(editingMember.role          || 'staff');
      setSalary(editingMember.salary ? String(editingMember.salary) : '');
      setAssignedShop(editingMember.assigned_shop || 'shop1');
    } else {
      setFullName(''); setUsername(''); setPhone(''); setRole('staff'); setSalary(''); setAssignedShop('shop1');
    }
  }, [editingMember, visible]);

  const resetAndClose = () => {
    setFullName(''); setUsername(''); setPhone(''); setRole('staff'); setSalary(''); setAssignedShop('shop1');
    onClose();
  };

  const handleSave = async () => {
    if (!isEdit) {
      if (!fullName.trim()) { Alert.alert('Missing', 'Please enter the full name.'); return; }
      if (!username.trim()) { Alert.alert('Missing', 'Please enter a username.');    return; }
    }

    setSaving(true);
    try {
      const trimmedUsername = (username || '').trim().toLowerCase();
      const email    = `${trimmedUsername}@vishnumobileshop.com`;
      const autoPass = `${trimmedUsername}${DEFAULT_PASSWORD_SUFFIX}`;

      if (isEdit) {
        const updates = {
          phone:  phone.trim() || null,
          salary: salary.trim() ? parseFloat(salary.trim()) : null,
          assigned_shop: assignedShop,
        };
        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', editingMember.id);
        if (error) throw error;
        Alert.alert('✅ Updated', 'Staff member updated successfully!');
      } else {
        const { data: edgeData, error: edgeError } = await supabase.functions.invoke('create-staff', {
          body: {
            email,
            password: autoPass,
            username: username.trim(),
            fullName: fullName.trim(),
            phone: phone.trim() || null,
            role,
          }
        });

        if (edgeError) throw edgeError;
        if (edgeData?.error) throw new Error(edgeData.error);

        if (edgeData?.user) {
          const bg = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
          await supabase.from('profiles').update({
            avatar_bg: bg,
            salary: salary.trim() ? parseFloat(salary.trim()) : null,
            assigned_shop: assignedShop,
          }).eq('id', edgeData.user.id);
        }

        Alert.alert(
          '✅ Staff Added',
          `${fullName.trim()} added as ${role}.\n\nUsername: ${username.trim()}\nPassword: ${autoPass}\n\nThey must wait for your approval before logging in.`
        );
      }

      onRefresh();
      resetAndClose();
    } catch (e) {
      console.error('handleSave error detail:', e);
      let errorMsg = e.message || 'Failed to save staff.';
      if (e.context?.status) errorMsg = `Error ${e.context.status}: ${errorMsg}`;
      else if (e.status)     errorMsg = `Error ${e.status}: ${errorMsg}`;
      Alert.alert('Error', errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const ROLES = ASSIGNABLE_ROLES;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={resetAndClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>{isEdit ? 'Edit Staff Member' : 'Add Staff Member'}</Text>
              <Text style={styles.modalSubtitle}>
                {isEdit ? 'Update details below' : 'Register a new employee'}
              </Text>
            </View>
            <TouchableOpacity onPress={resetAndClose} style={styles.modalCloseBtn}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {!isEdit && (
              <>
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>FULL NAME *</Text>
                  <TextInput
                    style={styles.fieldInput}
                    placeholder="e.g. Rahul Sharma"
                    placeholderTextColor="#BFC8D6"
                    value={fullName}
                    onChangeText={setFullName}
                    editable={!saving}
                  />
                </View>
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>USERNAME *</Text>
                  <TextInput
                    style={styles.fieldInput}
                    placeholder="vms_rahul"
                    placeholderTextColor="#BFC8D6"
                    autoCapitalize="none"
                    value={username}
                    onChangeText={setUsername}
                    editable={!saving}
                  />
                  <Text style={styles.fieldHint}>
                    Login email: {username.toLowerCase() || 'vms_username'}@vishnumobileshop.com
                  </Text>
                </View>
              </>
            )}

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>PHONE NUMBER</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="+91 98765 43210"
                placeholderTextColor="#BFC8D6"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                editable={!saving}
              />
            </View>

            {!isEdit && (
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>ROLE</Text>
                <View style={styles.roleRow}>
                  {ROLES.map(r => (
                    <TouchableOpacity
                      key={r}
                      style={[styles.roleChip, role === r && styles.roleChipActive]}
                      onPress={() => setRole(r)}
                      disabled={saving}>
                      <Text style={[styles.roleChipText, role === r && styles.roleChipTextActive]}>
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>MONTHLY SALARY (₹)</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="e.g. 10000"
                placeholderTextColor="#BFC8D6"
                keyboardType="numeric"
                value={salary}
                onChangeText={setSalary}
                editable={!saving}
              />
              <Text style={styles.fieldHint}>
                Used for automatic salary calculation based on actual hours worked
              </Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>ASSIGNED SHOP</Text>
              <View style={styles.roleRow}>
                {[
                  { id: 'shop1', label: 'Shop 1' },
                  { id: 'shop2', label: 'Shop 2' },
                ].map(s => (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.roleChip, assignedShop === s.id && styles.roleChipActive]}
                    onPress={() => setAssignedShop(s.id)}
                    disabled={saving}>
                    <Text style={[styles.roleChipText, assignedShop === s.id && styles.roleChipTextActive]}>
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {!isEdit && (
              <View style={[styles.fieldGroup, { backgroundColor: '#F0FFF4', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#BBF7D0' }]}>
                <Text style={[styles.fieldLabel, { color: '#166534' }]}>🔑 AUTO-GENERATED PASSWORD</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#15803D', fontFamily: 'monospace' }}>
                  {username.trim().toLowerCase() || 'username'}{DEFAULT_PASSWORD_SUFFIX}
                </Text>
                <Text style={[styles.fieldHint, { color: '#166534', marginTop: 6 }]}>
                  Staff must wait for your approval before they can login.
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelBtn} onPress={resetAndClose} disabled={saving}>
              <Text style={styles.cancelBtnText}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.7 }]} onPress={handleSave} disabled={saving}>
              {saving
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.saveBtnText}>{isEdit ? 'UPDATE' : 'SAVE STAFF'}</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const StaffListScreen = () => {
  const navigation = useNavigation();
  const { signOut } = useAuth();
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [staff,              setStaff]              = useState([]);
  const [loading,            setLoading]            = useState(true);
  const [addModalVisible,    setAddModalVisible]    = useState(false);
  const [editingMember,      setEditingMember]      = useState(null);
  const [detailMember,       setDetailMember]       = useState(null);
  const [searchQuery,        setSearchQuery]        = useState('');
  const [pendingRequests,    setPendingRequests]    = useState([]);
  const [pendingLoading,     setPendingLoading]     = useState(false);
  const [showPendingPanel,   setShowPendingPanel]   = useState(false);

  const [leaveRequests,    setLeaveRequests]    = useState([]);
  const [leaveLoading,     setLeaveLoading]     = useState(false);
  const [showLeavePanel,   setShowLeavePanel]   = useState(false);

  const [holidays,             setHolidays]             = useState([]);
  const [holidayLoading,       setHolidayLoading]       = useState(false);
  const [holidayModalVisible,  setHolidayModalVisible]  = useState(false);
  const [holidayDate,          setHolidayDate]          = useState('');
  const [holidayTitle,         setHolidayTitle]         = useState('');
  const [holidaySaving,        setHolidaySaving]        = useState(false);

  const [approveRequest,      setApproveRequest]      = useState(null);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [approvingShop,       setApprovingShop]       = useState('shop1');
  const [approving,           setApproving]           = useState(false);

  const [customAlert, setCustomAlert] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: null,
  });

  const showAlert = (title, message, buttons = null) => {
    setCustomAlert({
      visible: true,
      title,
      message,
      buttons,
    });
  };

  const handleLogout = () => {
    setProfileMenuVisible(false);
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  const loadStaff = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, role, phone, email, created_at, avatar_bg, salary, is_approved, assigned_shop')
        .eq('is_approved', true)
        .order('created_at', { ascending: true });
      if (error) throw error;
      const withColors = (data || []).map((m, i) => ({
        ...m,
        avatarBg: m.avatar_bg || AVATAR_COLORS[i % AVATAR_COLORS.length],
      }));
      setStaff(withColors);
    } catch (e) {
      console.error('loadStaff error:', e.message);
      Alert.alert('Error', 'Failed to load staff list.');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingRequests = async () => {
    setPendingLoading(true);
    try {
      const { data, error } = await supabase
        .from('pending_login_requests')
        .select('id, staff_id, username, full_name, requested_at, status')
        .eq('status', 'pending')
        .order('requested_at', { ascending: true });
      if (!error) setPendingRequests(data || []);
    } catch (e) {
      console.warn('Pending requests exception:', e.message);
    } finally {
      setPendingLoading(false);
    }
  };

  const loadLeaveRequests = async () => {
    setLeaveLoading(true);
    try {
      const { data, error } = await supabase
        .from('leave_requests')
        .select('id, staff_id, from_date, to_date, reason, status, requested_at, profiles!leave_requests_staff_id_fkey(full_name, username)')
        .eq('status', 'pending')
        .order('requested_at', { ascending: true });
      if (error) throw error;
      setLeaveRequests(data || []);
    } catch (e) {
      console.warn('loadLeaveRequests error:', e.message);
    } finally {
      setLeaveLoading(false);
    }
  };

  const loadHolidays = async () => {
    setHolidayLoading(true);
    try {
      const { data, error } = await supabase
        .from('holidays')
        .select('id, date, title, created_at')
        .order('date', { ascending: true })
        .limit(200);
      if (error) throw error;
      setHolidays(data || []);
    } catch (e) {
      console.warn('loadHolidays error:', e.message);
    } finally {
      setHolidayLoading(false);
    }
  };

  const addHoliday = async () => {
    const d = holidayDate.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) {
      Alert.alert('Invalid Date', 'Use YYYY-MM-DD');
      return;
    }
    setHolidaySaving(true);
    try {
      const { error } = await supabase.from('holidays').insert({
        date: d,
        title: (holidayTitle.trim() || 'Holiday'),
      });
      if (error) throw error;
      setHolidayDate('');
      setHolidayTitle('');
      setHolidayModalVisible(false);
      loadHolidays();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setHolidaySaving(false);
    }
  };

  const deleteHoliday = async (h) => {
    Alert.alert('Delete Holiday', `Delete ${h.title} (${h.date})?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabase.from('holidays').delete().eq('id', h.id);
            if (error) throw error;
            loadHolidays();
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        }
      }
    ]);
  };

  const approveLeave = async (req) => {
    try {
      const { error } = await supabase
        .from('leave_requests')
        .update({ status: 'approved', decided_at: new Date().toISOString() })
        .eq('id', req.id);
      if (error) throw error;
      Alert.alert('✅ Approved', 'Leave approved.');
      loadLeaveRequests();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const rejectLeave = async (req) => {
    try {
      const { error } = await supabase
        .from('leave_requests')
        .update({ status: 'rejected', decided_at: new Date().toISOString() })
        .eq('id', req.id);
      if (error) throw error;
      Alert.alert('Rejected', 'Leave rejected.');
      loadLeaveRequests();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleApproveStaff = (req) => {
    setApproveRequest(req);
    setApprovingShop('shop1');
    setApproveModalVisible(true);
  };

  const handleRejectStaff = (req) => {
    Alert.alert(
      'Reject Login',
      `Reject login request from ${req.full_name || req.username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject', style: 'destructive',
          onPress: async () => {
            await supabase
              .from('pending_login_requests')
              .update({ status: 'rejected' })
              .eq('id', req.id);
            loadPendingRequests();
          },
        },
      ]
    );
  };

  useFocusEffect(useCallback(() => {
    loadStaff();
    loadPendingRequests();
    loadLeaveRequests();
    loadHolidays();

    // ── Auto-checkout at 8:00 PM (WORKDAY_END_HOUR) ─────────────────────────
    // Fires once per day: inserts CHECK_OUT at exactly 20:00 for every staff
    // member who has a CHECK_IN today but no CHECK_OUT yet.
    const autoCheckoutFiredRef = { current: false };

    const runAutoCheckout = async () => {
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000; // UTC+5:30
      const istNow    = new Date(now.getTime() + istOffset);
      const istHour   = istNow.getUTCHours();

      // Only trigger once, after 20:00 IST
      if (autoCheckoutFiredRef.current) return;
      if (istHour < WORKDAY_END_HOUR) return;

      autoCheckoutFiredRef.current = true;

      // Build today's date string in IST (YYYY-MM-DD)
      const istDateStr = istNow.toISOString().slice(0, 10);
      const dayStart   = new Date(`${istDateStr}T00:00:00.000+05:30`).toISOString();
      const dayEnd     = new Date(`${istDateStr}T23:59:59.999+05:30`).toISOString();

      // The exact 8:00 PM IST checkout timestamp
      const checkoutAt = new Date(`${istDateStr}T${String(WORKDAY_END_HOUR).padStart(2, '0')}:00:00.000+05:30`).toISOString();

      try {
        // Call the SECURITY DEFINER RPC — bypasses RLS so admin can insert
        // CHECK_OUT rows on behalf of other staff members.
        // The function finds all staff with CHECK_IN today but no CHECK_OUT,
        // and inserts CHECK_OUT at exactly 8:00 PM for each of them.
        const { error: rpcErr } = await supabase.rpc('auto_checkout_staff', {
          checkout_at: checkoutAt,
        });

        if (rpcErr) throw rpcErr;

        console.log('[AutoCheckout] Auto-checkout completed at 8:00 PM');
      } catch (e) {
        console.warn('[AutoCheckout] Error:', e.message);
      }
    };

    // Run immediately in case screen opens after 8 PM, then check every minute
    runAutoCheckout();
    const timer = setInterval(runAutoCheckout, 60 * 1000);

    // Cleanup when screen loses focus
    return () => clearInterval(timer);
  }, []));


  const handleEdit = (member) => {
    setEditingMember(member);
    setAddModalVisible(true);
  };

  const handleDelete = (member) => {
    Alert.alert(
      'Delete Staff',
      `Remove ${member.full_name || member.username} from the system?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              // Attempt a hard delete first
              const { error } = await supabase.from('profiles').delete().eq('id', member.id);
              
              if (error) {
                // If they have processed orders, the DB will reject the hard delete.
                // Fallback to a soft delete instead.
                if (error.message && error.message.includes('foreign key constraint')) {
                  const { error: softErr } = await supabase
                    .from('profiles')
                    .update({ is_approved: false })
                    .eq('id', member.id);
                  if (softErr) throw softErr;
                } else {
                  throw error;
                }
              }
              // Remove from UI in both cases
              setStaff(prev => prev.filter(s => s.id !== member.id));
            } catch (e) {
              Alert.alert('Error', 'Failed to remove staff member.\n' + e.message);
            }
          },
        },
      ]
    );
  };

  const openAddModal = () => {
    setEditingMember(null);
    setAddModalVisible(true);
  };

  const admins           = staff.filter(s => s.role === 'admin').length;
  const staffCount       = staff.filter(s => s.role === 'staff').length;
  const totalActive      = admins + staffCount;
  const pendingCount     = pendingRequests.length;
  const leavePendingCount = leaveRequests.length;

  const filteredStaff = staff.filter(s => {
    // Only display 'staff' role in the list
    if (s.role !== 'staff') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (s.full_name || '').toLowerCase().includes(q) ||
        (s.username  || '').toLowerCase().includes(q) ||
        (s.phone     || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F6FA" />

      {/* Profile Dropdown Modal */}
      <Modal visible={profileMenuVisible} transparent animationType="fade" onRequestClose={() => setProfileMenuVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setProfileMenuVisible(false)}>
          <View style={styles.dropdownMenu}>
            <View style={styles.dropdownHeader}>
              <View style={styles.dropdownAvatar}>
                <Text style={styles.dropdownAvatarText}>VM</Text>
              </View>
              <View>
                <Text style={styles.dropdownName}>Vishnu Mobile Shop</Text>
                <Text style={styles.dropdownRole}>Administrator</Text>
              </View>
            </View>
            <View style={styles.dropdownSep} />
            <TouchableOpacity style={styles.dropdownItem} onPress={() => { setProfileMenuVisible(false); navigation.navigate('Settings'); }}>
              <View style={styles.dropdownItemIcon}><SettingsIcon size={18} color="#2D2F8E" /></View>
              <Text style={styles.dropdownItemText}>Settings</Text>
            </TouchableOpacity>
            <View style={styles.dropdownSep} />
            <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
              <View style={[styles.dropdownItemIcon, styles.dropdownItemIconDanger]}><LogoutIcon size={18} color="#ef4444" /></View>
              <Text style={[styles.dropdownItemText, styles.dropdownItemTextDanger]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add / Edit Modal */}
      <AddStaffModal
        visible={addModalVisible}
        onClose={() => { setAddModalVisible(false); setEditingMember(null); }}
        onRefresh={loadStaff}
        editingMember={editingMember}
        showAlert={showAlert}
      />

      {/* Holidays Modal */}
      <Modal visible={holidayModalVisible} transparent animationType="fade" onRequestClose={() => setHolidayModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Add Holiday</Text>
                <Text style={styles.modalSubtitle}>This date will be treated as unpaid (no salary added)</Text>
              </View>
              <TouchableOpacity onPress={() => setHolidayModalVisible(false)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>DATE (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="2026-05-01"
                placeholderTextColor="#BFC8D6"
                value={holidayDate}
                onChangeText={setHolidayDate}
                editable={!holidaySaving}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>TITLE</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="May Day"
                placeholderTextColor="#BFC8D6"
                value={holidayTitle}
                onChangeText={setHolidayTitle}
                editable={!holidaySaving}
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setHolidayModalVisible(false)} disabled={holidaySaving}>
                <Text style={styles.cancelBtnText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, holidaySaving && { opacity: 0.7 }]} onPress={addHoliday} disabled={holidaySaving}>
                {holidaySaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>SAVE</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Detail Modal */}
      <StaffDetailModal
        visible={!!detailMember}
        member={detailMember}
        onClose={() => setDetailMember(null)}
        onEdit={(m) => { setDetailMember(null); handleEdit(m); }}
        showAlert={showAlert}
      />

      {/* Assign Shop Modal */}
      <Modal visible={approveModalVisible} transparent animationType="fade" onRequestClose={() => setApproveModalVisible(false)}>
        <View style={styles.modalOverlayCentered}>
          <View style={[styles.modalCard, { width: '85%', maxWidth: 360, paddingBottom: 22 }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Assign Shop</Text>
                <Text style={styles.modalSubtitle}>Assign a shop to complete approval</Text>
              </View>
              <TouchableOpacity onPress={() => setApproveModalVisible(false)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 13, color: '#455A64', marginBottom: 16 }}>
              Select the shop location where <Text style={{ fontWeight: '700', color: '#1A1A2E' }}>{approveRequest?.full_name || approveRequest?.username}</Text> will work:
            </Text>

            <View style={styles.fieldGroup}>
              <View style={styles.roleRow}>
                {[
                  { id: 'shop1', label: 'Shop 1' },
                  { id: 'shop2', label: 'Shop 2' },
                ].map(s => (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.roleChip, approvingShop === s.id && styles.roleChipActive]}
                    onPress={() => setApprovingShop(s.id)}
                    disabled={approving}>
                    <Text style={[styles.roleChipText, approvingShop === s.id && styles.roleChipTextActive]}>
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[styles.modalFooter, { borderTopWidth: 0, paddingVertical: 0, marginTop: 12 }]}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setApproveModalVisible(false)} disabled={approving}>
                <Text style={styles.cancelBtnText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, approving && { opacity: 0.7 }]}
                onPress={async () => {
                  setApproving(true);
                  try {
                    const { error: profErr } = await supabase
                      .from('profiles')
                      .update({ is_approved: true, assigned_shop: approvingShop })
                      .eq('id', approveRequest.staff_id);
                    if (profErr) throw profErr;
                    await supabase
                      .from('pending_login_requests')
                      .update({ status: 'approved' })
                      .eq('id', approveRequest.id);
                    Alert.alert('✅ Approved', `${approveRequest.full_name || approveRequest.username} has been assigned to ${approvingShop === 'shop2' ? 'Shop 2' : 'Shop 1'} and approved.`);
                    setApproveModalVisible(false);
                    setApproveRequest(null);
                    loadPendingRequests();
                    loadStaff();
                  } catch (e) {
                    Alert.alert('Error', 'Failed to approve: ' + e.message);
                  } finally {
                    setApproving(false);
                  }
                }}
                disabled={approving}>
                {approving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>APPROVE</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom Alert Modal */}
      <CustomAlertModal
        visible={customAlert.visible}
        title={customAlert.title}
        message={customAlert.message}
        buttons={customAlert.buttons}
        onClose={() => setCustomAlert(prev => ({ ...prev, visible: false }))}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerTitle}>
            <View style={styles.dot} />
            <Text style={styles.headerTitleText}>Vishnu Mobile Shop</Text>
          </View>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setProfileMenuVisible(true)}>
            <ProfileIcon size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* SECTION TITLE */}
        <View style={styles.section}>
          <Text style={styles.subTitle}>ADMIN CONTROL</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
  <Text style={styles.mainTitle}>Staff List</Text>
  <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
    <TouchableOpacity
      style={styles.attendanceEntryBtn}
      onPress={() => navigation.navigate('StaffAttendance')}
      activeOpacity={0.8}>
      <Text style={styles.attendanceEntryBtnText}>View Attendance</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.calendarIconBtn}
      onPress={() => navigation.navigate('DayDetail')}
      activeOpacity={0.8}>
      <CalendarIcon2 size={18} color="#2D2F8E" />
    </TouchableOpacity>
  </View>
</View>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 10, color: '#2D2F8E', fontWeight: '800' }}>SELF-REGISTRATION</Text>
            <Text style={{ fontSize: 9, color: '#888' }}>ENABLED</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>TOTAL STAFF</Text>
            <Text style={styles.statValue}>{String(totalActive).padStart(2, '0')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>STAFF</Text>
            <Text style={styles.statValue}>{String(staffCount).padStart(2, '0')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>ADMINS</Text>
            <Text style={styles.statValue}>{String(admins).padStart(2, '0')}</Text>
          </View>
          <View style={styles.statDivider} />
          <TouchableOpacity style={styles.statBlock} onPress={() => setShowPendingPanel(p => !p)}>
            <Text style={[styles.statLabel, pendingCount > 0 && { color: '#EF5350' }]}>PENDING</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={[styles.statValue, { color: pendingCount > 0 ? '#EF5350' : '#2D2F8E' }]}>
                {String(pendingCount).padStart(2, '0')}
              </Text>
              {pendingCount > 0 && <View style={styles.pendingDot} />}
            </View>
          </TouchableOpacity>
        </View>

        {/* Holidays Panel */}
        <View style={styles.pendingPanel}>
          <View style={styles.pendingPanelHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <HolidayIcon size={14} color="#8B5CF6" />
              <Text style={styles.pendingPanelTitle}>Holidays</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity onPress={loadHolidays}>
                <Text style={styles.pendingRefresh}>↻ Refresh</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setHolidayModalVisible(true)}>
                <Text style={styles.pendingRefresh}>+ Add</Text>
              </TouchableOpacity>
            </View>
          </View>

          {holidayLoading ? (
            <ActivityIndicator size="small" color="#3D5AFE" style={{ paddingVertical: 12 }} />
          ) : holidays.length === 0 ? (
            <Text style={styles.pendingEmpty}>No holidays added</Text>
          ) : (
            holidays.slice(0, 8).map(h => (
              <View key={h.id} style={styles.pendingCard}>
                <View style={styles.pendingCardLeft}>
                  <View style={styles.pendingAvatar}>
                    <Text style={styles.pendingAvatarText}>H</Text>
                  </View>
                  <View>
                    <Text style={styles.pendingName}>{h.title}</Text>
                    <Text style={styles.pendingMeta}>{h.date}</Text>
                  </View>
                </View>
                <View style={styles.pendingActions}>
                  <TouchableOpacity
                    style={[styles.rejectBtn, { paddingHorizontal: 10 }]}
                    onPress={() => deleteHoliday(h)}
                    activeOpacity={0.8}>
                    <TrashIcon size={14} color="#EF5350" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
          {holidays.length > 8 && (
            <Text style={{ color: '#94A3B8', fontSize: 10, marginTop: 6, fontStyle: 'italic' }}>
              Showing first 8 holidays
            </Text>
          )}
        </View>

        {/* Leave Requests Panel Toggle */}
        <TouchableOpacity
          style={[styles.leavePanelToggle, leavePendingCount > 0 && { borderColor: '#FFE7C2' }]}
          onPress={() => setShowLeavePanel(v => !v)}
          activeOpacity={0.85}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <CalendarIcon size={16} color="#F59E0B" />
            <Text style={styles.leavePanelTitle}>Leave Requests</Text>
          </View>
          <Text style={[styles.leavePanelCount, leavePendingCount > 0 && { color: '#EF5350' }]}>
            {String(leavePendingCount).padStart(2, '0')}
          </Text>
        </TouchableOpacity>

        {showLeavePanel && (
          <View style={styles.pendingPanel}>
            <View style={styles.pendingPanelHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <CalendarIcon size={14} color="#F59E0B" />
                <Text style={styles.pendingPanelTitle}>Pending Leave Requests</Text>
              </View>
              <TouchableOpacity onPress={loadLeaveRequests}>
                <Text style={styles.pendingRefresh}>↻ Refresh</Text>
              </TouchableOpacity>
            </View>

            {leaveLoading ? (
              <ActivityIndicator size="small" color="#3D5AFE" style={{ paddingVertical: 12 }} />
            ) : leaveRequests.length === 0 ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10 }}>
                <CheckCircleIcon size={15} color="#22C55E" />
                <Text style={styles.pendingEmpty}>No pending leaves</Text>
              </View>
            ) : (
              leaveRequests.map(req => (
                <View key={req.id} style={styles.pendingCard}>
                  <View style={styles.pendingCardLeft}>
                    <View style={styles.pendingAvatar}>
                      <Text style={styles.pendingAvatarText}>L</Text>
                    </View>
                    <View>
                      <Text style={styles.pendingName}>
                        {req.profiles?.full_name || req.profiles?.username || req.staff_id.slice(0, 8).toUpperCase()}
                      </Text>
                      <Text style={styles.pendingMeta}>
                        {new Date(req.from_date).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })} →{' '}
                        {new Date(req.to_date).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </Text>
                      {!!req.reason && <Text style={styles.pendingTime}>{req.reason}</Text>}
                    </View>
                  </View>
                  <View style={styles.pendingActions}>
                    <TouchableOpacity
                      style={[styles.approveBtn, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}
                      onPress={() => approveLeave(req)}
                      activeOpacity={0.8}>
                      <CheckIcon size={12} color="#fff" />
                      <Text style={styles.approveBtnText}>APPROVE</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.rejectBtn, { paddingHorizontal: 10 }]}
                      onPress={() => rejectLeave(req)}
                      activeOpacity={0.8}>
                      <CloseIcon size={12} color="#EF5350" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Pending Login Requests Panel */}
        {showPendingPanel && (
          <View style={styles.pendingPanel}>
            <View style={styles.pendingPanelHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <BellIcon size={14} color="#F59E0B" />
                <Text style={styles.pendingPanelTitle}>Pending Login Requests</Text>
              </View>
              <TouchableOpacity onPress={loadPendingRequests}>
                <Text style={styles.pendingRefresh}>↻ Refresh</Text>
              </TouchableOpacity>
            </View>
            {pendingLoading ? (
              <ActivityIndicator size="small" color="#3D5AFE" style={{ paddingVertical: 12 }} />
            ) : pendingRequests.length === 0 ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10 }}>
                <CheckCircleIcon size={15} color="#22C55E" />
                <Text style={styles.pendingEmpty}>No pending requests</Text>
              </View>
            ) : (
              pendingRequests.map(req => (
                <View key={req.id} style={styles.pendingCard}>
                  <View style={styles.pendingCardLeft}>
                    <View style={styles.pendingAvatar}>
                      <Text style={styles.pendingAvatarText}>
                        {(req.full_name || req.username || '?').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.pendingName}>{req.full_name || req.username}</Text>
                      <Text style={styles.pendingMeta}>@{req.username}</Text>
                      <Text style={styles.pendingTime}>
                        {new Date(req.requested_at).toLocaleString('en-IN', {
                          day: '2-digit', month: 'short',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.pendingActions}>
                    <TouchableOpacity
                      style={[styles.approveBtn, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}
                      onPress={() => handleApproveStaff(req)}
                      activeOpacity={0.8}>
                      <CheckIcon size={12} color="#fff" />
                      <Text style={styles.approveBtnText}>APPROVE</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.rejectBtn, { paddingHorizontal: 10 }]}
                      onPress={() => handleRejectStaff(req)}
                      activeOpacity={0.8}>
                      <CloseIcon size={12} color="#EF5350" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchIcon size={16} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, username, phone or role..."
            placeholderTextColor="#B0BEC5"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <CloseIcon size={14} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Staff List */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#2D2F8E" />
            <Text style={styles.loadingText}>Loading staff...</Text>
          </View>
        ) : filteredStaff.length === 0 ? (
          <View style={styles.emptyBox}>
            {searchQuery.trim() ? <SearchIcon size={36} color="#CBD5E1" /> : <UsersIcon size={36} color="#CBD5E1" />}
            <Text style={styles.emptyText}>
              {searchQuery.trim() ? 'No results found' : 'No staff members yet'}
            </Text>
            <Text style={styles.emptySub}>
              {searchQuery.trim() ? `No staff match "${searchQuery}"` : 'Tap + ADD STAFF to get started'}
            </Text>
          </View>
        ) : (
          <View style={styles.cardList}>
            {filteredStaff.map(member => (
              <StaffCard
                key={member.id}
                member={member}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onPress={(m) => setDetailMember(m)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F0F2F8' },

  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 48 },
  loadingText: { color: '#94A3B8', fontSize: 14 },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '700', color: '#333' },
  emptySub: { fontSize: 13, color: '#aaa', marginTop: 2 },

  // Detail modal
  detailOverlay: { flex: 1, backgroundColor: 'rgba(20,20,40,0.5)', justifyContent: 'flex-end' },
  detailSheet: {
    backgroundColor: '#FFF', borderTopLeftRadius: 26, borderTopRightRadius: 26,
    paddingHorizontal: 22, paddingTop: 14, paddingBottom: 30, maxHeight: '88%',
  },
  detailHandle: {
    width: 38, height: 4, borderRadius: 2,
    backgroundColor: '#DDE1EA', alignSelf: 'center', marginBottom: 20,
  },
  detailHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18 },
  detailHeaderText: { flex: 1 },
  detailName: { fontSize: 20, fontWeight: '800', color: '#1A1A2E', letterSpacing: -0.4 },
  detailRow: { paddingVertical: 13, borderBottomWidth: 0.5, borderBottomColor: '#F0F2F5' },
  detailLabel: { fontSize: 9, fontWeight: '800', color: '#B0BEC5', letterSpacing: 1.2, marginBottom: 5 },
  detailValue: { fontSize: 14, fontWeight: '600', color: '#1A1A2E' },
  detailFooter: { flexDirection: 'row', gap: 10, paddingTop: 16 },
  detailEditBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#2D2F8E', borderRadius: 14, paddingVertical: 14,
  },
  detailEditBtnText: { color: '#FFF', fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  detailCloseBtn: {
    flex: 1, borderRadius: 14, paddingVertical: 14,
    borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC', alignItems: 'center',
  },
  detailCloseBtnText: { fontSize: 13, fontWeight: '700', color: '#64748B', letterSpacing: 0.5 },

  // Header
   header: {
    backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 2,
  },
 headerTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitleText: { fontSize: 16, fontWeight: '800', color: '#2D2F8E' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' },
  iconBtn: {
    backgroundColor: '#2D2F8E', borderRadius: 10,
    width: 36, height: 36, alignItems: 'center', justifyContent: 'center',
  },
  calendarIconBtn: {
    width: 34, height: 34, backgroundColor: '#EEF0FF',
    borderRadius: 9, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#C5CAE9',
  },

  // Section
  section: { paddingHorizontal: 16, marginTop: 12 },
  subTitle: { fontSize: 10, color: '#94A3B8', letterSpacing: 2, fontWeight: '700' },
  mainTitle: { fontSize: 26, fontWeight: '800', marginTop: 4, color: '#1A1A2E', letterSpacing: -0.5 },

  // Profile Dropdown
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start', alignItems: 'flex-end',
    paddingTop: 68, paddingRight: 16,
  },
  modalOverlayCentered: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center',
  },
  dropdownMenu: {
    backgroundColor: '#fff', borderRadius: 18, width: 230,
    elevation: 16, overflow: 'hidden',
  },
  dropdownHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, backgroundColor: '#F8F9FF' },
  dropdownAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#2D2F8E', alignItems: 'center', justifyContent: 'center' },
  dropdownAvatarText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  dropdownName: { fontSize: 13, fontWeight: '800', color: '#1E293B' },
  dropdownRole: { fontSize: 11, color: '#94A3B8', marginTop: 1 },
  dropdownSep: { height: 0.5, backgroundColor: '#F1F5F9' },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 14 },
  dropdownItemIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#EEF0FF', alignItems: 'center', justifyContent: 'center' },
  dropdownItemIconDanger: { backgroundColor: '#FEE2E2' },
  dropdownItemText: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  dropdownItemTextDanger: { color: '#EF4444' },

  // Stats
  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginTop: 14, marginBottom: 12,
    backgroundColor: '#FFF', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16,
    borderWidth: 0.5, borderColor: '#E8ECF4',
  },
  statBlock: { flex: 1, alignItems: 'center', gap: 4 },
  statLabel: { fontSize: 8, fontWeight: '800', color: '#94A3B8', letterSpacing: 1.2 },
  statValue: { fontSize: 24, fontWeight: '900', color: '#2D2F8E', letterSpacing: -1, lineHeight: 28 },
  statDivider: { width: 0.5, height: 36, backgroundColor: '#EDEEF5' },
  pendingDot: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: '#EF5350',
    position: 'absolute', top: -2, right: -10,
  },

  // Pending Panel
  pendingPanel: {
    marginHorizontal: 16, marginBottom: 12,
    backgroundColor: '#FFF', borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: '#FFE0E0',
  },
  pendingPanelHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  pendingPanelTitle: { fontSize: 12, fontWeight: '800', color: '#1A1A2E' },
  pendingRefresh: { fontSize: 11, fontWeight: '700', color: '#2D2F8E' },
  pendingEmpty: { fontSize: 13, color: '#22C55E', fontWeight: '700', textAlign: 'center', paddingVertical: 8 },

  pendingCard: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 0.5,
    borderBottomColor: '#F5F6FA', justifyContent: 'space-between',
  },
  pendingCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  pendingAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#EEF0FF', alignItems: 'center', justifyContent: 'center',
  },
  pendingAvatarText: { fontSize: 14, fontWeight: '800', color: '#2D2F8E' },
  pendingName: { fontSize: 13, fontWeight: '700', color: '#1A1A2E' },
  pendingMeta: { fontSize: 11, color: '#94A3B8', marginTop: 1 },
  pendingTime: { fontSize: 10, color: '#B0BEC5', marginTop: 1 },

  pendingActions: { flexDirection: 'row', gap: 7 },
  approveBtn: {
    backgroundColor: '#22C55E', paddingHorizontal: 11,
    paddingVertical: 7, borderRadius: 9,
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  approveBtnText: { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  rejectBtn: {
    backgroundColor: '#FEE2E2', paddingHorizontal: 10,
    paddingVertical: 7, borderRadius: 9, alignItems: 'center', justifyContent: 'center',
  },

  // Search bar
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginBottom: 14,
    backgroundColor: '#FFF', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 11,
    borderWidth: 1, borderColor: '#E8ECF4',
  },
  searchInput: {
    flex: 1, fontSize: 13, color: '#1A1A2E',
    paddingVertical: 0, marginLeft: 8,
  },

  // Card list
  cardList: { paddingHorizontal: 16, gap: 12, paddingBottom: 32 },

  // Staff card
  card: {
    backgroundColor: '#FFF', borderRadius: 18, paddingHorizontal: 16,
    paddingTop: 16, paddingBottom: 14,
    borderWidth: 0.5, borderColor: '#EDEEF5'
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 13 },
  cardNameBlock: { flex: 1, gap: 5 },
  cardName: { fontSize: 15, fontWeight: '800', color: '#1A1A2E', letterSpacing: -0.1 },
  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 7 },
  roleBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionBtn: {
    width: 32, height: 32, borderRadius: 9,
    backgroundColor: '#F5F6FA', alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5, borderColor: '#EDEEF5'
  },
  actionBtnDelete: {
    backgroundColor: '#FFF0F0', borderColor: '#FFD5D5',
  },
  cardDivider: { height: 0.5, backgroundColor: '#F0F2F5', marginBottom: 13 },
  cardMeta: { flexDirection: 'row', alignItems: 'center' },
  metaItem: { flex: 1 },
  metaLabel: { fontSize: 8, fontWeight: '800', color: '#B0BEC5', letterSpacing: 1.2, marginBottom: 3 },
  metaValue: { fontSize: 12, fontWeight: '700', color: '#455A64' },
  metaSeparator: { width: 0.5, height: 28, backgroundColor: '#EDEEF5', marginHorizontal: 14 },

  // Add Staff Modal
  modalCard: {
    backgroundColor: '#FFFFFF', borderRadius: 22,
    paddingHorizontal: 22, paddingTop: 22, paddingBottom: 0,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A2E' },
  modalSubtitle: { fontSize: 12, color: '#94A3B8', marginTop: 3 },
  modalCloseBtn: {
    width: 32, height: 32, backgroundColor: '#F5F6FA',
    borderRadius: 10, alignItems: 'center', justifyContent: 'center',
  },
  modalCloseText: { fontSize: 14, color: '#64748B', fontWeight: '700' },

  fieldGroup: { marginBottom: 16 },
  fieldLabel: { fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 1.2, marginBottom: 7 },
  fieldInput: {
    backgroundColor: '#F8F9FF', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 14, color: '#1A1A2E', borderWidth: 1, borderColor: '#E8ECF4',
  },
  fieldHint: { fontSize: 10, color: '#94A3B8', marginTop: 5, fontStyle: 'italic' },

  roleRow: { flexDirection: 'row', gap: 8 },
  roleChip: {
    flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
    backgroundColor: '#F8F9FF', borderWidth: 1, borderColor: '#E8ECF4',
  },
  roleChipActive: { backgroundColor: '#EEF0FF', borderColor: '#2D2F8E' },
  roleChipText: { fontSize: 12, fontWeight: '700', color: '#94A3B8' },
  roleChipTextActive: { color: '#2D2F8E' },

  modalFooter: {
    flexDirection: 'row', gap: 12,
    paddingVertical: 16, borderTopWidth: 0.5, borderTopColor: '#F0F2F5', marginTop: 8,
  },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    borderWidth: 1, borderColor: '#D0D5DD', alignItems: 'center',
  },
  cancelBtnText: { fontSize: 13, fontWeight: '700', color: '#64748B', letterSpacing: 0.5 },
  saveBtn: {
    flex: 2, paddingVertical: 14, borderRadius: 12,
    backgroundColor: '#2D2F8E', alignItems: 'center', justifyContent: 'center',
  },
  saveBtnText: { fontSize: 13, fontWeight: '800', color: '#FFF', letterSpacing: 0.5 },

  // Salary card
  salaryCard: {
    marginTop: 18, marginBottom: 8,
    backgroundColor: '#F8F9FF', borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: '#E8ECF4',
  },
  salaryCardHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14,
  },
  salaryCardTitle: { fontSize: 13, fontWeight: '800', color: '#1A1A2E', letterSpacing: 0.1 },
  salaryNoData: { fontSize: 13, color: '#94A3B8', fontStyle: 'italic', textAlign: 'center', paddingVertical: 8 },
  salaryRow: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingVertical: 8,
  },
  salaryRowLabel: { fontSize: 13, fontWeight: '600', color: '#1A1A2E' },
  salaryHelperText: { fontSize: 10, color: '#94A3B8', marginTop: 2 },
  salaryRowValue: { fontSize: 13, fontWeight: '700', color: '#1A1A2E' },
  salaryDivider: { height: 0.5, backgroundColor: '#E8ECF4', marginVertical: 4 },
  salarySubHead: { fontSize: 9, fontWeight: '800', color: '#B0BEC5', letterSpacing: 1.2, marginTop: 4, marginBottom: 2 },
  salaryNetRow: { paddingVertical: 10 },
  salaryNetLabel: { fontSize: 14, fontWeight: '900', color: '#1A1A2E' },
  salaryNetValue: { fontSize: 20, fontWeight: '900', color: '#2D2F8E', letterSpacing: -0.5 },
  salaryBasis: { fontSize: 9, color: '#B0BEC5', marginTop: 6, fontStyle: 'italic' },

  attendanceEntryBtn: {
    backgroundColor: '#EEF0FF', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 9, borderWidth: 1, borderColor: '#C5CAE9',
  },
  attendanceEntryBtnText: {
    fontSize: 12, fontWeight: '700', color: '#3949AB', letterSpacing: 0.2,
  },

  // Leave toggle
  leavePanelToggle: {
    marginHorizontal: 16, marginBottom: 10,
    backgroundColor: '#FFF', borderRadius: 14,
    paddingVertical: 12, paddingHorizontal: 16,
    borderWidth: 1, borderColor: '#E8ECF4',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  leavePanelTitle: { fontSize: 12, fontWeight: '900', color: '#1A1A2E' },
  leavePanelCount: { fontSize: 18, fontWeight: '900', color: '#2D2F8E' },
  // Deduction styles
deductionRow: {
  flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
  backgroundColor: '#FFF5F5', borderRadius: 10, padding: 10, marginTop: 4, marginBottom: 4,
  borderWidth: 1, borderColor: '#FFD5D5',
},
deductionLeft: { flex: 1, paddingRight: 8 },
deductionRight: { alignItems: 'flex-end', gap: 6 },
deductionLabel: { fontSize: 9, fontWeight: '800', color: '#EF5350', letterSpacing: 1.2, marginBottom: 3 },
deductionReason: { fontSize: 12, color: '#455A64', fontWeight: '600' },
deductionAmt: { fontSize: 14, fontWeight: '800', color: '#EF5350' },
deductionEditBtn: {
  backgroundColor: '#FEE2E2', borderRadius: 7,
  paddingHorizontal: 10, paddingVertical: 4,
},
deductionEditBtnText: { fontSize: 11, fontWeight: '700', color: '#EF5350' },

addDeductionBtn: {
  marginTop: 8, paddingVertical: 9, borderRadius: 10,
  borderWidth: 1, borderColor: '#E8ECF4', borderStyle: 'dashed',
  alignItems: 'center', backgroundColor: '#FAFBFF',
},
addDeductionBtnText: { fontSize: 12, fontWeight: '700', color: '#94A3B8' },

deductionForm: {
  marginTop: 10, backgroundColor: '#F8F9FF', borderRadius: 14,
  padding: 14, borderWidth: 1, borderColor: '#E8ECF4',
},
deductionFormTitle: {
  fontSize: 10, fontWeight: '800', color: '#2D2F8E',
  letterSpacing: 1.2, marginBottom: 12,
},
deductionRemoveBtn: {
  flex: 1, paddingVertical: 14, borderRadius: 12,
  borderWidth: 1, borderColor: '#FFD5D5',
  backgroundColor: '#FFF0F0', alignItems: 'center',
},
deductionRemoveBtnText: { fontSize: 13, fontWeight: '700', color: '#EF5350' },

});
const todayStyles = StyleSheet.create({
  card: {
    marginTop: 16, marginBottom: 4,
    backgroundColor: '#F8F9FF', borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: '#E8ECF4',
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 14,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  title: { fontSize: 9, fontWeight: '800', color: '#1A1A2E', letterSpacing: 1.2 },
  badge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1,
  },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 8,
    borderWidth: 1, borderColor: '#EDEEF5',
  },
  box: { flex: 1, alignItems: 'center', gap: 4 },
  boxLabel: { fontSize: 8, fontWeight: '800', color: '#B0BEC5', letterSpacing: 1 },
  boxTime: { fontSize: 16, fontWeight: '900', letterSpacing: -0.3 },
  boxSub: { fontSize: 9, color: '#94A3B8', fontWeight: '600' },
  boxEmpty: { fontSize: 11, color: '#CBD5E1', fontWeight: '600', marginTop: 4 },
  separator: { width: 0.5, height: 40, backgroundColor: '#EDEEF5' },
});
export default StaffListScreen;