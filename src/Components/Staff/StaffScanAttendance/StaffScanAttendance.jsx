import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Modal,
  AppState,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
// Install: npm install react-native-vision-camera
// iOS:     cd ios && pod install
//          Add to Info.plist: NSCameraUsageDescription
// Android: Add to AndroidManifest.xml:
//          <uses-permission android:name="android.permission.CAMERA" />

import Svg2, {
  Path,
  Circle,
  Rect,
  Polyline,
  Line,
} from 'react-native-svg';

// ─── Icons ────────────────────────────────────────────────────────────────────

const MenuIcon = ({ size = 20, color = '#fff' }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="3" y1="6" x2="21" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="3" y1="12" x2="21" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="3" y1="18" x2="21" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg2>
);

const BellIcon = ({ size = 20, color = '#fff' }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg2>
);

const ScanIcon = ({ size = 26, color = '#fff' }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 7V5a2 2 0 0 1 2-2h2" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M17 3h2a2 2 0 0 1 2 2v2" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M21 17v2a2 2 0 0 1-2 2h-2" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M7 21H5a2 2 0 0 1-2-2v-2" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Rect x="7" y="7" width="3" height="3" rx="1" stroke={color} strokeWidth="1.5" />
    <Rect x="14" y="7" width="3" height="3" rx="1" stroke={color} strokeWidth="1.5" />
    <Rect x="7" y="14" width="3" height="3" rx="1" stroke={color} strokeWidth="1.5" />
    <Path d="M14 14h3v3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg2>
);

const CheckCircleIcon = ({ size = 52, color = '#22c55e' }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Polyline points="9 12 11 14 15 10" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg2>
);

const XCircleIcon = ({ size = 52, color = '#ef4444' }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Line x1="15" y1="9" x2="9" y2="15" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <Line x1="9" y1="9" x2="15" y2="15" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </Svg2>
);

const ClockIcon = ({ size = 14, color = '#64748B' }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
    <Polyline points="12 7 12 12 15 15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg2>
);

const LoginIcon = ({ size = 16, color = '#22c55e' }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="10 17 15 12 10 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="15" y1="12" x2="3" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg2>
);

const LogoutIcon = ({ size = 16, color = '#ef4444' }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="16 17 21 12 16 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="21" y1="12" x2="9" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg2>
);

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLORS = {
  PRESENT:    '#22c55e',
  LATE:       '#ef4444',
  'HALF-DAY': '#f59e0b',
  ABSENT:     '#94A3B8',
};

const STATUS_BG = {
  PRESENT:    'rgba(34,197,94,0.1)',
  LATE:       'rgba(239,68,68,0.1)',
  'HALF-DAY': 'rgba(245,158,11,0.1)',
  ABSENT:     'rgba(148,163,184,0.1)',
};

const myLogs = [
  { id: 'ATT-1041', date: 'Today',     checkIn: '09:15 AM', checkOut: '06:30 PM', status: 'PRESENT'  },
  { id: 'ATT-1040', date: 'Yesterday', checkIn: '10:05 AM', checkOut: '06:45 PM', status: 'LATE'     },
  { id: 'ATT-1039', date: '29 Mar',    checkIn: '09:00 AM', checkOut: '—',        status: 'HALF-DAY' },
  { id: 'ATT-1038', date: '28 Mar',    checkIn: '09:10 AM', checkOut: '06:25 PM', status: 'PRESENT'  },
];

const FRAME_SIZE    = 240;
const OVERLAY_COLOR = 'rgba(0,0,0,0.62)';

// ─── Camera Permission Hook ───────────────────────────────────────────────────

function useCameraPermission() {
  const [status, setStatus] = useState('unknown'); // 'unknown' | 'granted' | 'denied'

  useEffect(() => {
  const getPermission = async () => {
    const s = await Camera.requestCameraPermission();
    setStatus(s === 'granted' ? 'granted' : 'denied');
  };

  getPermission();
}, []);

  const request = useCallback(async () => {
    // If already denied, re-check (user may have updated in Settings)
    const current = await Camera.getCameraPermissionStatus();
    if (current === 'granted') { setStatus('granted'); return; }
    const result = await Camera.requestCameraPermission();
    setStatus(result === 'granted' ? 'granted' : 'denied');
  }, []);

  return { status, request };
}

// ─── QR Scanner View ──────────────────────────────────────────────────────────
// Rendered *inside* the full-screen Modal so Camera mounts/unmounts cleanly.

const QRScannerView = ({ scanType, onScan, onClose }) => {
  const isIn        = scanType === 'in';
  const device      = useCameraDevice('back');
  const scannedRef  = useRef(false);
  const { status, request } = useCameraPermission();

  // Pause camera when app goes to background (Vision Camera best practice)
  const [isActive, setIsActive] = useState(true);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      setIsActive(nextState === 'active');
    });
    return () => sub.remove();
  }, []);

  // useCodeScanner — Vision Camera v4 API
  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: (codes) => {
      if (scannedRef.current || codes.length === 0) return;
      const raw = codes[0]?.value;
      if (!raw) return;

      scannedRef.current = true; // prevent duplicate fires

      try {
        const parsed       = JSON.parse(raw);
        const expectedType = isIn ? 'CHECK_IN' : 'CHECK_OUT';

        if (parsed.shop === 'VishnutMobileShop' && parsed.type === expectedType) {
          onScan({
            success:   true,
            sessionId: parsed.sessionId,
            time:      new Date().toLocaleTimeString(),
          });
        } else {
          onScan({ success: false, reason: 'Wrong QR type or invalid shop code' });
        }
      } catch {
        onScan({ success: false, reason: 'Unreadable QR — please try again' });
      }
    },
  });

  // ── Permission gate ────────────────────────────────────────────────────────
  if (status !== 'granted') {
    return (
      <View style={scanStyles.centreBox}>
        <Text style={scanStyles.permTitle}>Camera Access Needed</Text>
        <Text style={scanStyles.permSub}>
          Allow camera access to scan attendance QR codes.
        </Text>
        <TouchableOpacity style={scanStyles.permBtn} onPress={request}>
          <Text style={scanStyles.permBtnText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} style={scanStyles.cancelLink}>
          <Text style={scanStyles.cancelLinkText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── No back camera ─────────────────────────────────────────────────────────
  if (!device) {
    return (
      <View style={scanStyles.centreBox}>
        <Text style={scanStyles.permTitle}>No Camera Found</Text>
        <Text style={scanStyles.permSub}>Back camera is unavailable on this device.</Text>
        <TouchableOpacity onPress={onClose} style={scanStyles.cancelLink}>
          <Text style={scanStyles.cancelLinkText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Camera + overlay ───────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1 }}>
      {/* Vision Camera — fills the entire area */}
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isActive}
        codeScanner={codeScanner}
      />

      {/*
        Overlay strategy: 4 solid strips around a transparent centre hole.
        This avoids any transparent-background hacks that break on some RN versions.
      */}
      {/* Top strip */}
      <View style={[scanStyles.strip, scanStyles.stripTop]} />
      {/* Bottom strip */}
      <View style={[scanStyles.strip, scanStyles.stripBottom]} />
      {/* Middle row: left | frame | right */}
      <View style={scanStyles.middleRow}>
        <View style={scanStyles.sideStrip} />
        {/* Transparent scan frame — corner brackets only */}
        <View style={{ width: FRAME_SIZE, height: FRAME_SIZE }}>
          <View style={[scanStyles.corner, scanStyles.cornerTL, isIn ? scanStyles.accentIn : scanStyles.accentOut]} />
          <View style={[scanStyles.corner, scanStyles.cornerTR, isIn ? scanStyles.accentIn : scanStyles.accentOut]} />
          <View style={[scanStyles.corner, scanStyles.cornerBL, isIn ? scanStyles.accentIn : scanStyles.accentOut]} />
          <View style={[scanStyles.corner, scanStyles.cornerBR, isIn ? scanStyles.accentIn : scanStyles.accentOut]} />
        </View>
        <View style={scanStyles.sideStrip} />
      </View>

      {/* Bottom instruction bar */}
      <View style={scanStyles.instrBar}>
        <View style={[scanStyles.typePill, isIn ? scanStyles.pillIn : scanStyles.pillOut]}>
          <Text style={scanStyles.pillText}>{isIn ? '→  CHECK IN' : '←  CHECK OUT'}</Text>
        </View>
        <Text style={scanStyles.hintText}>
          Point your camera at the QR code{'\n'}displayed by your manager
        </Text>
      </View>
    </View>
  );
};

// ─── Scanner Modal Shell ──────────────────────────────────────────────────────

const QRScannerModal = ({ visible, scanType, onScan, onClose }) => (
  <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
    <SafeAreaView style={scanStyles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* Header */}
      <View style={scanStyles.header}>
        <TouchableOpacity onPress={onClose} style={scanStyles.backBtn}>
          <Text style={scanStyles.backBtnText}>✕</Text>
        </TouchableOpacity>
        <Text style={scanStyles.headerTitle}>
          {scanType === 'in' ? 'Scan Check-In QR' : 'Scan Check-Out QR'}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <QRScannerView scanType={scanType} onScan={onScan} onClose={onClose} />
    </SafeAreaView>
  </Modal>
);

// ─── Scan Result Modal ────────────────────────────────────────────────────────

const ScanResultModal = ({ visible, result, scanType, onClose }) => {
  const isIn    = scanType === 'in';
  const success = result?.success;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={resultStyles.overlay}>
        <View style={resultStyles.card}>
          <View style={[resultStyles.iconRing, success ? resultStyles.ringSuccess : resultStyles.ringError]}>
            {success ? <CheckCircleIcon size={52} color="#22c55e" /> : <XCircleIcon size={52} color="#ef4444" />}
          </View>

          <Text style={resultStyles.title}>
            {success ? (isIn ? 'Checked In!' : 'Checked Out!') : 'Scan Failed'}
          </Text>
          <Text style={resultStyles.subtitle}>
            {success
              ? isIn
                ? 'Welcome! Your attendance has been recorded.'
                : 'See you tomorrow! Have a great evening.'
              : result?.reason || 'Please try again with a valid QR code.'}
          </Text>

          {success && result?.time && (
            <View style={resultStyles.metaRow}>
              <ClockIcon size={14} color="#64748B" />
              <Text style={resultStyles.metaText}>Recorded at {result.time}</Text>
            </View>
          )}

          {success && result?.sessionId && (
            <View style={resultStyles.sessionBox}>
              <Text style={resultStyles.sessionLabel}>SESSION ID</Text>
              <Text style={resultStyles.sessionValue}>{result.sessionId}</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={onClose}
            style={[resultStyles.doneBtn, success ? resultStyles.doneBtnSuccess : resultStyles.doneBtnError]}
          >
            <Text style={resultStyles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ─── Log Item ─────────────────────────────────────────────────────────────────

const LogItem = ({ entry, isLast }) => (
  <View style={[styles.logItem, isLast && { borderBottomWidth: 0 }]}>
    <View style={styles.logDateBox}>
      <Text style={styles.logDate}>{entry.date}</Text>
      <Text style={styles.logId}>{entry.id}</Text>
    </View>
    <View style={styles.logTimes}>
      <View style={styles.logTimeRow}>
        <LoginIcon size={13} color="#22c55e" />
        <Text style={styles.logTimeText}>{entry.checkIn}</Text>
      </View>
      <View style={styles.logTimeRow}>
        <LogoutIcon size={13} color="#ef4444" />
        <Text style={styles.logTimeText}>{entry.checkOut}</Text>
      </View>
    </View>
    <View style={[styles.statusPill, { backgroundColor: STATUS_BG[entry.status] }]}>
      <Text style={[styles.statusPillText, { color: STATUS_COLORS[entry.status] }]}>
        {entry.status}
      </Text>
    </View>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

const StaffAttendanceScreen = () => {
  const [scannerVisible, setScannerVisible] = useState(false);
  const [scanType,       setScanType]       = useState('in');
  const [resultVisible,  setResultVisible]  = useState(false);
  const [scanResult,     setScanResult]     = useState(null);

  const todayLog       = myLogs[0];
  const checkedInToday  = todayLog?.checkIn  !== '—';
  const checkedOutToday = todayLog?.checkOut !== '—';

  const openScanner = (type) => {
    setScanType(type);
    setScannerVisible(true);
  };

  const handleScanResult = (result) => {
    setScannerVisible(false);
    setScanResult(result);
    setResultVisible(true);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <QRScannerModal
        visible={scannerVisible}
        scanType={scanType}
        onScan={handleScanResult}
        onClose={() => setScannerVisible(false)}
      />
      <ScanResultModal
        visible={resultVisible}
        result={scanResult}
        scanType={scanType}
        onClose={() => setResultVisible(false)}
      />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <Text style={styles.headerTitleText}>Vishnu Mobile Shop</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn}>
          <BellIcon size={18} color="#fff" />
          <View style={styles.badge} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

        {/* ── Page Title ── */}
        <View style={styles.pageTitleRow}>
          <View>
            <Text style={styles.pageTitle}>Attendance</Text>
            <Text style={styles.pageSubtitle}>My Records</Text>
          </View>
          <View style={[styles.todayPill, checkedInToday ? styles.todayPillActive : styles.todayPillOff]}>
            <View style={[styles.todayDot, checkedInToday ? styles.todayDotActive : styles.todayDotOff]} />
            <Text style={[styles.todayPillText, checkedInToday ? styles.todayPillTextActive : styles.todayPillTextOff]}>
              {checkedInToday ? 'Present Today' : 'Not Checked In'}
            </Text>
          </View>
        </View>

        {/* ── Today Summary Card ── */}
        <View style={styles.todayCard}>
          <Text style={styles.todayCardTitle}>Today's Summary</Text>
          <View style={styles.todaySummaryRow}>
            <View style={styles.todaySummaryItem}>
              <View style={[styles.summaryIconBox, { backgroundColor: 'rgba(34,197,94,0.1)' }]}>
                <LoginIcon size={18} color="#22c55e" />
              </View>
              <Text style={styles.summaryLabel}>Check-In</Text>
              <Text style={[styles.summaryTime, { color: checkedInToday ? '#1E293B' : '#94A3B8' }]}>
                {checkedInToday ? todayLog.checkIn : '—'}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.todaySummaryItem}>
              <View style={[styles.summaryIconBox, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
                <LogoutIcon size={18} color="#ef4444" />
              </View>
              <Text style={styles.summaryLabel}>Check-Out</Text>
              <Text style={[styles.summaryTime, { color: checkedOutToday ? '#1E293B' : '#94A3B8' }]}>
                {checkedOutToday ? todayLog.checkOut : '—'}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Scan QR Section ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scan Attendance QR</Text>

          {/* Check In */}
          <TouchableOpacity
            style={[styles.scanCard, checkedInToday && styles.scanCardDone]}
            onPress={() => openScanner('in')}
            activeOpacity={0.85}
          >
            <View style={[styles.scanIconBox, { backgroundColor: checkedInToday ? 'rgba(34,197,94,0.12)' : '#2D2F8E' }]}>
              <ScanIcon size={24} color={checkedInToday ? '#22c55e' : '#fff'} />
            </View>
            <View style={styles.scanInfo}>
              <Text style={styles.scanTitle}>
                {checkedInToday ? 'Checked In ✓' : 'Scan Check-In QR'}
              </Text>
              <Text style={styles.scanSub}>
                {checkedInToday ? `Recorded at ${todayLog.checkIn}` : "Point camera at manager's QR code"}
              </Text>
            </View>
            <View style={[styles.scanBadge, { backgroundColor: checkedInToday ? 'rgba(34,197,94,0.1)' : 'rgba(45,47,142,0.08)' }]}>
              <Text style={[styles.scanBadgeText, { color: checkedInToday ? '#22c55e' : '#2D2F8E' }]}>IN</Text>
            </View>
          </TouchableOpacity>

          {/* Check Out */}
          <TouchableOpacity
            style={[styles.scanCard, styles.scanCardLast, checkedOutToday && styles.scanCardDone]}
            onPress={() => openScanner('out')}
            activeOpacity={0.85}
          >
            <View style={[styles.scanIconBox, { backgroundColor: checkedOutToday ? 'rgba(239,68,68,0.12)' : '#64748B' }]}>
              <ScanIcon size={24} color={checkedOutToday ? '#ef4444' : '#fff'} />
            </View>
            <View style={styles.scanInfo}>
              <Text style={styles.scanTitle}>
                {checkedOutToday ? 'Checked Out ✓' : 'Scan Check-Out QR'}
              </Text>
              <Text style={styles.scanSub}>
                {checkedOutToday ? `Recorded at ${todayLog.checkOut}` : 'Scan when leaving for the day'}
              </Text>
            </View>
            <View style={[styles.scanBadge, { backgroundColor: checkedOutToday ? 'rgba(239,68,68,0.1)' : 'rgba(100,116,139,0.08)' }]}>
              <Text style={[styles.scanBadgeText, { color: checkedOutToday ? '#ef4444' : '#64748B' }]}>OUT</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── My Logs — no download / no filter (admin-only) ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Logs</Text>
          {myLogs.map((entry, idx) => (
            <LogItem key={entry.id} entry={entry} isLast={idx === myLogs.length - 1} />
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Main Styles ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },

  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleText: { fontSize: 16, fontWeight: '700', color: '#2D2F8E' },
  headerTitle:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot:             { width: 7, height: 7, borderRadius: 4, backgroundColor: '#22c55e' },
  iconBtn: {
    backgroundColor: '#2D2F8E',
    borderRadius: 10,
    width: 36, height: 36,
    alignItems: 'center', justifyContent: 'center',
  },
  badge: {
    position: 'absolute', top: 6, right: 6,
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 1, borderColor: '#FFFFFF',
  },

  body: { backgroundColor: '#F5F6FA', padding: 16, paddingBottom: 32 },

  pageTitleRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  pageTitle:     { fontSize: 24, fontWeight: '800', color: '#1E293B', letterSpacing: -0.5 },
  pageSubtitle:  { fontSize: 12, color: '#64748B', marginTop: 2 },

  todayPill:           { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  todayPillActive:     { backgroundColor: 'rgba(34,197,94,0.12)' },
  todayPillOff:        { backgroundColor: 'rgba(148,163,184,0.12)' },
  todayDot:            { width: 6, height: 6, borderRadius: 3 },
  todayDotActive:      { backgroundColor: '#22c55e' },
  todayDotOff:         { backgroundColor: '#94A3B8' },
  todayPillText:       { fontSize: 11, fontWeight: '700' },
  todayPillTextActive: { color: '#22c55e' },
  todayPillTextOff:    { color: '#94A3B8' },

  todayCard:      { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, borderBottomWidth: 3, borderBottomColor: '#2D2F8E' },
  todayCardTitle: { fontSize: 11, fontWeight: '700', color: '#64748B', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.8 },
  todaySummaryRow:  { flexDirection: 'row', alignItems: 'center' },
  todaySummaryItem: { flex: 1, alignItems: 'center', gap: 6 },
  summaryIconBox:   { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  summaryLabel:     { fontSize: 11, color: '#64748B', fontWeight: '600' },
  summaryTime:      { fontSize: 20, fontWeight: '800' },
  summaryDivider:   { width: 1, height: 52, backgroundColor: '#E2E8F0', marginHorizontal: 16 },

  section:      { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 14 },

  scanCard:      { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  scanCardLast:  { borderBottomWidth: 0 },
  scanCardDone:  { opacity: 0.8 },
  scanIconBox:   { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  scanInfo:      { flex: 1 },
  scanTitle:     { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 3 },
  scanSub:       { fontSize: 11, color: '#64748B' },
  scanBadge:     { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  scanBadgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },

  logItem:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', gap: 8 },
  logDateBox:    { width: 76 },
  logDate:       { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  logId:         { fontSize: 10, color: '#94A3B8', marginTop: 2 },
  logTimes:      { flex: 1, gap: 4 },
  logTimeRow:    { flexDirection: 'row', alignItems: 'center', gap: 5 },
  logTimeText:   { fontSize: 12, color: '#64748B', fontWeight: '500' },
  statusPill:    { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusPillText:{ fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
});

// ─── Scanner Styles ───────────────────────────────────────────────────────────

const scanStyles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: '#0f172a' },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  backBtn:     { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  backBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  headerTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // 4-strip overlay
  strip:       { position: 'absolute', left: 0, right: 0, backgroundColor: OVERLAY_COLOR },
//   stripTop:    { top: 0, height: '28%' },
//   stripBottom: { bottom: 0, top: '30%', height: '35%' },  // approximate; fine-tune per device
  middleRow:   { position: 'absolute', top: '28%', left: 0, right: 0, height: FRAME_SIZE, flexDirection: 'row' },
  sideStrip:   { flex: 1 },

  // Corner brackets
  corner:     { position: 'absolute', width: 28, height: 28, borderWidth: 3 },
  accentIn:   { borderColor: '#2D2F8E' },
  accentOut:  { borderColor: '#ef4444' },
  cornerTL:   { top: 0,    left: 0,  borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 4 },
  cornerTR:   { top: 0,    right: 0, borderLeftWidth: 0,  borderBottomWidth: 0, borderTopRightRadius: 4 },
  cornerBL:   { bottom: 0, left: 0,  borderRightWidth: 0, borderTopWidth: 0,    borderBottomLeftRadius: 4 },
  cornerBR:   { bottom: 0, right: 0, borderLeftWidth: 0,  borderTopWidth: 0,    borderBottomRightRadius: 4 },

  // Bottom instruction bar
  instrBar:   { position: 'absolute', bottom: 0, left: 0, right: 0, paddingVertical: 28, alignItems: 'center', gap: 10, backgroundColor: '#0f172a' },
  typePill:   { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  pillIn:     { backgroundColor: 'rgba(45,47,142,0.35)', borderWidth: 1, borderColor: '#2D2F8E' },
  pillOut:    { backgroundColor: 'rgba(239,68,68,0.25)', borderWidth: 1, borderColor: '#ef4444' },
  pillText:   { color: '#fff', fontSize: 12, fontWeight: '700', letterSpacing: 0.8 },
  hintText:   { color: 'rgba(255,255,255,0.45)', fontSize: 13, textAlign: 'center', lineHeight: 20 },

  // Permission / error
  centreBox:    { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12, backgroundColor: '#0f172a' },
  permTitle:    { color: '#fff', fontSize: 18, fontWeight: '700' },
  permSub:      { color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'center', lineHeight: 20 },
  permBtn:      { marginTop: 8, backgroundColor: '#2D2F8E', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 10 },
  permBtnText:  { color: '#fff', fontWeight: '700', fontSize: 14 },
  cancelLink:   { marginTop: 4 },
  cancelLinkText:{ color: 'rgba(255,255,255,0.4)', fontSize: 13 },
});

// ─── Result Modal Styles ──────────────────────────────────────────────────────

const resultStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card:    { backgroundColor: '#FFFFFF', borderRadius: 20, width: '100%', padding: 28, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 12 },

  iconRing:    { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  ringSuccess: { backgroundColor: 'rgba(34,197,94,0.1)' },
  ringError:   { backgroundColor: 'rgba(239,68,68,0.1)' },

  title:    { fontSize: 22, fontWeight: '800', color: '#1E293B', marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20, marginBottom: 16 },

  metaRow:  { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 12 },
  metaText: { fontSize: 12, color: '#64748B' },

  sessionBox:   { backgroundColor: '#F5F6FA', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center', marginBottom: 20, width: '100%' },
  sessionLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  sessionValue: { fontSize: 15, color: '#1E293B', fontWeight: '700', fontFamily: 'monospace', marginTop: 3 },

  doneBtn:        { width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  doneBtnSuccess: { backgroundColor: '#2D2F8E' },
  doneBtnError:   { backgroundColor: '#ef4444' },
  doneBtnText:    { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});

export default StaffAttendanceScreen;