import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../../lib/supabase';
import Svg2, { Path, Polyline, Circle, Line, Rect } from 'react-native-svg';
import { Dimensions } from 'react-native';

const CELL_SIZE = Math.floor((Dimensions.get('window').width - 32 - 32 - 12) / 7);
// 32 = horizontal padding of screen, 32 = card padding (16*2), 12 = extra buffer
// ── Icons ─────────────────────────────────────────────────────────────────────
const BackIcon = () => (
  <Svg2 width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M12 5l-7 7 7 7" stroke="#2D2F8E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg2>
);

const ChevronLeft = () => (
  <Svg2 width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Polyline points="15 18 9 12 15 6" stroke="#2D2F8E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg2>
);

const ChevronRight = () => (
  <Svg2 width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Polyline points="9 18 15 12 9 6" stroke="#2D2F8E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg2>
);

const UserIcon = ({ color = '#2D2F8E' }) => (
  <Svg2 width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" />
  </Svg2>
);

const CartIcon = ({ color = '#16A34A' }) => (
  <Svg2 width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Circle cx="9" cy="21" r="1" stroke={color} strokeWidth="2" />
    <Circle cx="20" cy="21" r="1" stroke={color} strokeWidth="2" />
    <Path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg2>
);

// ── Helpers ───────────────────────────────────────────────────────────────────
const toDateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const formatINR = (v) => '₹' + Number(v || 0).toLocaleString('en-IN');

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function DayDetailScreen() {
  const navigation = useNavigation();

  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(toDateKey(today));

  const [loading,    setLoading]    = useState(false);
  const [attendance, setAttendance] = useState([]);
  const [orders,     setOrders]     = useState([]);
  const [salesTotal, setSalesTotal] = useState(0);

  // ── Calendar grid ─────────────────────────────────────────────────────────
  const firstDay  = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const calCells = [];
  for (let i = 0; i < firstDay; i++) calCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calCells.push(d);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  // ── Load data for selected date ───────────────────────────────────────────
  const loadDayData = useCallback(async () => {
    if (!selectedDate) return;
    setLoading(true);
    try {
      const start = `${selectedDate}T00:00:00.000Z`;
      const end   = `${selectedDate}T23:59:59.999Z`;

      // Attendance for the day
   const { data: attData } = await supabase
  .from('attendance_logs')
  .select('id, staff_id, name, role, check_type, status, time, created_at')
  .gte('created_at', start)
  .lte('created_at', end)
  .order('created_at', { ascending: true });

      // Orders for the day
const { data: orderData } = await supabase
  .from('orders')
  .select('id, customer_name, total_payable, payment_method, created_at, sold_by_name, invoice_no')
        .gte('created_at', start)
        .lte('created_at', end)
        .order('created_at', { ascending: false });
// Fetch order items for all orders
const orderIds = (orderData || []).map(o => o.id);
let itemsMap = {};
if (orderIds.length > 0) {
  const { data: itemsData } = await supabase
    .from('order_items')
    .select('order_id, name')
    .in('order_id', orderIds);
  (itemsData || []).forEach(item => {
    if (!itemsMap[item.order_id]) itemsMap[item.order_id] = [];
    itemsMap[item.order_id].push(item.name);
  });
}
     const att = attData || [];
const ord = (orderData || []).map(o => ({
  ...o,
  productNames: itemsMap[o.id] || [],
}));

      // Group attendance by staff — earliest check-in, latest check-out
      const staffMap = {};
     att.forEach(log => {
  const sid = log.staff_id;
  if (!staffMap[sid]) {
    staffMap[sid] = {
      name: log.name || sid.slice(0, 8),
      role: log.role || '',
      checkIn: null,
      checkOut: null,
      status: log.status || '',
    };
  }
        if (log.check_type === 'CHECK_IN') {
          if (!staffMap[sid].checkIn || new Date(log.created_at) < new Date(staffMap[sid].checkIn))
            staffMap[sid].checkIn = log.created_at;
        } else if (log.check_type === 'CHECK_OUT') {
          if (!staffMap[sid].checkOut || new Date(log.created_at) > new Date(staffMap[sid].checkOut))
            staffMap[sid].checkOut = log.created_at;
        }
      });

      setAttendance(Object.values(staffMap));
      setOrders(ord);
      setSalesTotal(ord.reduce((s, o) => s + (Number(o.total_payable) || 0), 0));
    } catch (e) {
      console.error('DayDetail load error:', e.message);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useFocusEffect(useCallback(() => { loadDayData(); }, [loadDayData]));

  const isToday = (d) => {
    const t = new Date();
    return d === t.getDate() && viewMonth === t.getMonth() && viewYear === t.getFullYear();
  };
  const isSelected = (d) => {
    const key = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    return key === selectedDate;
  };

  const handleDayPress = (d) => {
    if (!d) return;
    const key = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    setSelectedDate(key);
  };

const hoursWorked = (checkIn, checkOut) => {
    if (!checkIn) return '—';
    let end;
    if (checkOut) {
      end = new Date(checkOut);
    } else {
      end = new Date(checkIn);
      end.setHours(20, 0, 0, 0); // default 8:00 PM
    }
    const diff = (end - new Date(checkIn)) / (1000 * 60 * 60);
    return `${Math.max(0, diff).toFixed(1)} hrs`;
  };

  return (
    <SafeAreaView style={s.safe}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <BackIcon />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Day Details</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.body}>

        {/* ── Calendar ── */}
        <View style={s.calCard}>
          {/* Month nav */}
          <View style={s.calNav}>
            <TouchableOpacity style={s.calNavBtn} onPress={prevMonth}>
              <ChevronLeft />
            </TouchableOpacity>
            <Text style={s.calMonthText}>{MONTHS[viewMonth]} {viewYear}</Text>
            <TouchableOpacity style={s.calNavBtn} onPress={nextMonth}>
              <ChevronRight />
            </TouchableOpacity>
          </View>

          {/* Day labels */}
          <View style={s.calDayRow}>
            {DAYS.map(d => (
              <Text key={d} style={s.calDayLabel}>{d}</Text>
            ))}
          </View>

          {/* Date cells */}
          <View style={s.calGrid}>
            {calCells.map((d, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  s.calCell,
                  d && isSelected(d) && s.calCellSelected,
                  d && isToday(d) && !isSelected(d) && s.calCellToday,
                ]}
                onPress={() => handleDayPress(d)}
                activeOpacity={d ? 0.7 : 1}
              >
                {d ? (
                  <Text style={[
                    s.calCellText,
                    isSelected(d) && s.calCellTextSelected,
                    isToday(d) && !isSelected(d) && s.calCellTextToday,
                  ]}>
                    {d}
                  </Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Selected date label ── */}
        <Text style={s.selectedLabel}>
          {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-IN', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
          })}
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#2D2F8E" style={{ marginTop: 32 }} />
        ) : (
          <>
            {/* ── Summary pills ── */}
            <View style={s.summaryRow}>
              <View style={[s.summaryPill, { backgroundColor: '#EEF0FF' }]}>
                <UserIcon color="#2D2F8E" />
                <Text style={[s.summaryPillText, { color: '#2D2F8E' }]}>
                  {attendance.length} Staff Present
                </Text>
              </View>
              <View style={[s.summaryPill, { backgroundColor: '#DCFCE7' }]}>
                <CartIcon color="#16A34A" />
                <Text style={[s.summaryPillText, { color: '#16A34A' }]}>
                  {orders.length} Orders · {formatINR(salesTotal)}
                </Text>
              </View>
            </View>

            {/* ── Attendance Section ── */}
            <View style={s.section}>
              <View style={s.sectionHead}>
                <View style={s.sectionDot} />
                <Text style={s.sectionTitle}>Attendance</Text>
              </View>

              {attendance.length === 0 ? (
                <View style={s.emptyBox}>
                  <Text style={s.emptyText}>No attendance recorded for this day</Text>
                </View>
              ) : (
                attendance.map((staff, i) => {
                  const hasOut = !!staff.checkOut;
                  return (
                    <View key={i} style={s.attRow}>
                      <View style={s.attAvatar}>
                        <Text style={s.attAvatarText}>
                          {(staff.name || '?').charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={s.attInfo}>
                        <Text style={s.attName}>{staff.name}</Text>
                        <View style={s.attTimeRow}>
                          <View style={s.attTimePill}>
                            <Text style={s.attTimePillLabel}>IN</Text>
                            <Text style={s.attTimePillVal}>
                              {staff.checkIn ? formatTime(staff.checkIn) : '—'}
                            </Text>
                          </View>
                          <Text style={s.attArrow}>→</Text>
                          <View style={[s.attTimePill, !hasOut && { backgroundColor: '#FEF3C7' }]}>
                            <Text style={s.attTimePillLabel}>OUT</Text>
                            <Text style={[s.attTimePillVal, !hasOut && { color: '#D97706' }]}>
                              {staff.checkOut ? formatTime(staff.checkOut) : 'Not yet'}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View style={s.attRight}>
                        <Text style={s.attHours}>{hoursWorked(staff.checkIn, staff.checkOut)}</Text>
                        <Text style={s.attHoursLabel}>worked</Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>

            {/* ── Sales Section ── */}
            <View style={s.section}>
              <View style={s.sectionHead}>
                <View style={[s.sectionDot, { backgroundColor: '#16A34A' }]} />
                <Text style={s.sectionTitle}>Sales</Text>
                {orders.length > 0 && (
                  <View style={s.totalBadge}>
                    <Text style={s.totalBadgeText}>{formatINR(salesTotal)} total</Text>
                  </View>
                )}
              </View>

              {orders.length === 0 ? (
                <View style={s.emptyBox}>
                  <Text style={s.emptyText}>No orders on this day</Text>
                </View>
              ) : (
                orders.map((order) => (
                  <View key={order.id} style={s.orderRow}>
                    <View style={s.orderIcon}>
                      <CartIcon color="#16A34A" />
                    </View>
                    <View style={s.orderInfo}>
  <Text style={s.orderCustomer}>
    {order.customer_name || 'Walk-in Customer'}
  </Text>
 <Text style={s.orderTime}>{formatTime(order.created_at)}</Text>
{order.productNames?.length > 0 && (
  <Text style={s.orderProducts} numberOfLines={2}>
    📦 {order.productNames.join(', ')}
  </Text>
)}
  {order.sold_by_name ? (
    <Text style={s.orderSoldBy}>🧑‍💼 {order.sold_by_name}</Text>
  ) : null}

</View>
                    <View style={s.orderRight}>
                      <Text style={s.orderAmount}>{formatINR(order.total_payable)}</Text>
                      <View style={[
                        s.payBadge,
                        order.payment_method === 'cash' && { backgroundColor: '#DCFCE7' },
                        order.payment_method === 'card' && { backgroundColor: '#FEF9C3' },
                      ]}>
                        <Text style={[
                          s.payBadgeText,
                          order.payment_method === 'cash' && { color: '#16A34A' },
                          order.payment_method === 'card' && { color: '#D97706' },
                        ]}>
                          {(order.payment_method || 'UPI').toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0F2FA' },

  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1, borderBottomColor: '#E4E7F2',
    elevation: 2,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#EEF0FF',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#1A1D6E' },

  body: { padding: 16 },

  // ── Calendar ──────────────────────────────────────────────────────────────
  calCard: {
    backgroundColor: '#fff',
    borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: '#E4E7F2',
    elevation: 2, marginBottom: 16,
  },
  calNav: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 14,
  },
  calNavBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: '#EEF0FF',
    alignItems: 'center', justifyContent: 'center',
  },
  calMonthText: { fontSize: 15, fontWeight: '800', color: '#1A1D6E' },

  calDayRow: {
    flexDirection: 'row', marginBottom: 6,
  },
  calDayLabel: {
    flex: 1, textAlign: 'center',
    fontSize: 10, fontWeight: '700',
    color: '#94A3B8', letterSpacing: 0.5,
  },

 calGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
},
calCell: {
  width: CELL_SIZE,
  height: CELL_SIZE,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 10,
},
calCellSelected: { backgroundColor: '#1A1D6E' },
calCellToday: { backgroundColor: '#EEF0FF' },
calCellText: { fontSize: 13, fontWeight: '600', color: '#1E293B' },
calCellTextSelected: { color: '#fff', fontWeight: '800' },
calCellTextToday: { color: '#1A1D6E', fontWeight: '800' },

  // ── Selected label ────────────────────────────────────────────────────────
  selectedLabel: {
    fontSize: 13, fontWeight: '700',
    color: '#64748B', textAlign: 'center',
    marginBottom: 14,
  },

  // ── Summary pills ─────────────────────────────────────────────────────────
  summaryRow: {
    flexDirection: 'row', gap: 10, marginBottom: 16,
  },
  summaryPill: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    gap: 6, paddingHorizontal: 12, paddingVertical: 10,
    borderRadius: 12,
  },
  summaryPillText: { fontSize: 12, fontWeight: '700' },

  // ── Section ───────────────────────────────────────────────────────────────
  section: {
    backgroundColor: '#fff',
    borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: '#E4E7F2',
    elevation: 2, marginBottom: 14,
  },
  sectionHead: {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, marginBottom: 14,
  },
  sectionDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#1A1D6E',
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#111827', flex: 1 },
  totalBadge: {
    backgroundColor: '#DCFCE7', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  totalBadgeText: { fontSize: 11, fontWeight: '700', color: '#16A34A' },

  emptyBox: { paddingVertical: 20, alignItems: 'center' },
  emptyText: { color: '#94A3B8', fontSize: 13, fontWeight: '500' },

  // ── Attendance rows ───────────────────────────────────────────────────────
  attRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  attAvatar: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#EEF0FF',
    alignItems: 'center', justifyContent: 'center',
  },
  attAvatarText: { fontSize: 16, fontWeight: '800', color: '#1A1D6E' },
  attInfo: { flex: 1 },
  attName: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 6 },
  attTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  attTimePill: {
    backgroundColor: '#F0F2FA', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
    alignItems: 'center',
  },
  attTimePillLabel: { fontSize: 8, fontWeight: '700', color: '#94A3B8', letterSpacing: 0.8 },
  attTimePillVal: { fontSize: 12, fontWeight: '700', color: '#111827' },
  attArrow: { color: '#CBD5E1', fontWeight: '700' },
  attRight: { alignItems: 'flex-end' },
  attHours: { fontSize: 14, fontWeight: '800', color: '#1A1D6E' },
  attHoursLabel: { fontSize: 9, color: '#94A3B8', fontWeight: '600' },

  // ── Order rows ────────────────────────────────────────────────────────────
  orderRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  orderIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#DCFCE7',
    alignItems: 'center', justifyContent: 'center',
  },
  orderInfo: { flex: 1 },
  orderSoldBy: { fontSize: 11, color: '#2D2F8E', fontWeight: '700', marginTop: 2 },
orderInvoice: { fontSize: 10, color: '#94A3B8', marginTop: 1 },
  orderCustomer: { fontSize: 13, fontWeight: '700', color: '#111827' },
  orderTime: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  orderRight: { alignItems: 'flex-end', gap: 4 },
  orderAmount: { fontSize: 14, fontWeight: '800', color: '#111827' },
  payBadge: {
    backgroundColor: '#EEF0FF', borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  payBadgeText: { fontSize: 9, fontWeight: '800', color: '#2D2F8E' },
  orderProducts: { fontSize: 11, color: '#475569', marginTop: 2, fontWeight: '600' },
});