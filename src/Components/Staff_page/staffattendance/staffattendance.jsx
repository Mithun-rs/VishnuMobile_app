import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Modal,
  Alert,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { generateAndSharePDF } from '../../../utils/exportUtils';
import FilterIcon from '../../../asset/filter_icon.svg';
import DownloadIcon from '../../../asset/upload.svg';
// Install: npm install react-native-qrcode-svg react-native-svg
// Then: cd ios && pod install

// ─── Icon Placeholders ───────────────────────────────────────────────────────
// Replace these with your actual icon imports, e.g.:
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const IconPlaceholder = ({
  name,
  size = 20,
  color = '#888',
}) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: 4,
      backgroundColor: color + '33',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
    <Text style={{fontSize: size * 0.45, color}}>{name[0]}</Text>
  </View>
);

// ─── QR Value Generator ───────────────────────────────────────────────────────
const generateQRValue = (type) => {
  const timestamp = new Date().toISOString();
  const sessionId = Math.random().toString(36).substring(2, 10).toUpperCase();
  return JSON.stringify({
    shop: 'VishnutMobileShop',
    type: type === 'in' ? 'CHECK_IN' : 'CHECK_OUT',
    sessionId,
    timestamp,
    validFor: 300, // seconds
  });
};

// ─── QR Modal ─────────────────────────────────────────────────────────────────
const QRModal = ({
  visible,
  type,
  qrValue,
  onClose,
}) => {
  const isIn = type === 'in';
  const parsed = qrValue ? JSON.parse(qrValue) : null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, isIn ? styles.modalHeaderIn : styles.modalHeaderOut]}>
            <Text style={styles.modalHeaderText}>
              {isIn ? '✓ Check-In QR Code' : '✗ Check-Out QR Code'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
              <Text style={styles.modalCloseBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* QR Code */}
          <View style={styles.modalQRWrapper}>
            {qrValue ? (
              <QRCode
                value={qrValue}
                size={200}
                color="#1A1A2E"
                backgroundColor="#FFFFFF"
              />
            ) : null}
          </View>

          {/* Session Info */}
          {parsed && (
            <View style={styles.modalMeta}>
              <Text style={styles.modalMetaLabel}>Session ID</Text>
              <Text style={styles.modalMetaValue}>{parsed.sessionId}</Text>
              <Text style={styles.modalMetaLabel}>Generated At</Text>
              <Text style={styles.modalMetaValue}>
                {new Date(parsed.timestamp).toLocaleTimeString()}
              </Text>
              <Text style={styles.modalMetaLabel}>Valid For</Text>
              <Text style={styles.modalMetaValue}>{parsed.validFor}s</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={onClose}
            style={[styles.modalDoneBtn, isIn ? styles.modalDoneBtnIn : styles.modalDoneBtnOut]}>
            <Text style={styles.modalDoneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  PRESENT: '#00C48C',
  LATE: '#FF6B6B',
  'HALF-DAY': '#FFB800',
  ABSENT: '#888',
};

const logs = [
  {
    id: '1',
    initials: 'AK',
    name: 'Amit Kumar',
    role: 'Sales Associate',
    time: 'Today, 09:15 AM',
    status: 'PRESENT',
    avatarColor: '#4A90D9',
  },
  {
    id: '2',
    initials: 'RS',
    name: 'Rahul Singh',
    role: 'Tech Support',
    time: 'Today, 10:05 AM',
    status: 'LATE',
    avatarColor: '#7B68EE',
  },
  {
    id: '3',
    initials: 'PP',
    name: 'Priya Patel',
    role: 'Inventory Mgr',
    time: 'Today, 09:00 AM',
    status: 'HALF-DAY',
    avatarColor: '#B0B0B0',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const Header = () => (
  <View style={styles.header}>
    <View style={styles.headerTitle}>
      <View style={styles.dot} />
      <Text style={styles.headerTitleText}>Vishnu Mobile Shop</Text>
    </View>
    <View style={styles.headerRight}>
      <View style={styles.iconBtn}>
        <IconPlaceholder name="Bell" size={16} color="#fff" />
      </View>
    </View>
  </View>
);

const CheckCard = ({
  type,
  onGenerate,
}) => {
  const isIn = type === 'in';
  const [qrValue, setQrValue] = useState(null);

  const handleGenerate = () => {
    const value = generateQRValue(type);
    setQrValue(value);
    onGenerate(type, value);
  };

  return (
    <View style={[styles.card, isIn && styles.cardActive]}>
      {/* Badge */}
      <View style={[styles.badge, isIn ? styles.badgeIn : styles.badgeOut]}>
        <Text style={[styles.badgeText, isIn ? styles.badgeTextIn : styles.badgeTextOut]}>
          {isIn ? 'IN' : 'OUT'}
        </Text>
      </View>

      {/* Corner icon */}
      <View style={styles.cardCornerIcon}>
        <IconPlaceholder name={isIn ? '→' : '←'} size={16} color="#888" />
      </View>

      <Text style={styles.cardTitle}>{isIn ? 'Check-In' : 'Check-Out'}</Text>

      {/* Live QR Code or dark placeholder */}
      <View style={[styles.qrBox, !isIn && styles.qrBoxOut]}>
        {qrValue ? (
          <QRCode
            value={qrValue}
            size={80}
            color="#FFFFFF"
            backgroundColor="transparent"
          />
        ) : (
          <View style={styles.qrIdleContent}>
            <View style={styles.qrIdleIcon}>
              <Text style={styles.qrIdleIconText}>{isIn ? '⊞' : '⊟'}</Text>
            </View>
            <Text style={styles.qrIdleHint}>Tap Generate</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        onPress={handleGenerate}
        style={[styles.generateBtn, isIn && styles.generateBtnActive]}
        activeOpacity={0.8}>
        <Text
          style={[
            styles.generateBtnText,
            isIn && styles.generateBtnTextActive,
          ]}>
          {qrValue ? 'Regenerate' : 'Generate'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const LogItem = ({entry}) => (
  <View style={styles.logItem}>
    <View style={[styles.logAvatar, {backgroundColor: entry.avatarColor}]}>
      <Text style={styles.logAvatarText}>{entry.initials}</Text>
    </View>
    <View style={styles.logInfo}>
      <Text style={styles.logName}>{entry.name}</Text>
      <View style={styles.logSubRow}>
        <Text style={styles.logRole}>{entry.role}</Text>
        <Text style={styles.logDot}> • </Text>
        <Text style={[styles.logStatus, {color: STATUS_COLORS[entry.status]}]}>
          {entry.status}
        </Text>
      </View>
    </View>
    <Text style={styles.logTime}>{entry.time}</Text>
  </View>
);

// ─── Filter Modal ─────────────────────────────────────────────────────────────
const FilterModal = ({
  visible,
  currentFilter,
  onApply,
  onClose,
}) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.bottomSheetOverlay}>
      <View style={styles.bottomSheet}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Filter Logs</Text>
          <TouchableOpacity onPress={onClose} style={styles.sheetCloseBtn}>
            <Text style={styles.sheetCloseBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.filterSectionTitle}>By Status</Text>
        <View style={styles.filterOptionsRow}>
          {['ALL', 'PRESENT', 'LATE', 'HALF-DAY', 'ABSENT'].map(status => (
            <TouchableOpacity
              key={status}
              onPress={() => onApply(status)}
              style={[
                styles.filterChip,
                currentFilter === status && styles.filterChipActive
              ]}>
              <Text style={[
                styles.filterChipText,
                currentFilter === status && styles.filterChipTextActive
              ]}>{status}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  </Modal>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
const AttendanceScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('in');
  const [modalQRValue, setModalQRValue] = useState('');

  const [filterVisible, setFilterVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const filteredLogs = logs.filter(
    entry => filterStatus === 'ALL' || entry.status === filterStatus
  );

  const generatePDF = async () => {
    if (filteredLogs.length === 0) {
      Alert.alert('No Logs', 'There are no logs to generate a PDF for.');
      return;
    }
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Helvetica, sans-serif; padding: 20px; color: #1A1A2E; }
            h1 { color: #3D5AFE; text-align: center; margin-bottom: 5px; }
            h3 { text-align: center; color: #8A9BB0; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            th, td { border: 1px solid #E2E8F0; padding: 12px; text-align: left; }
            th { background-color: #F2F4F7; font-weight: bold; }
            .status-PRESENT { color: #00C48C; font-weight: bold; }
            .status-LATE { color: #FF6B6B; font-weight: bold; }
            .status-HALF-DAY { color: #FFB800; font-weight: bold; }
            .status-ABSENT { color: #888888; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Vishnu Mobile Shop</h1>
          <h3>Attendance Logs ${filterStatus !== 'ALL' ? `(${filterStatus})` : ''}</h3>
          <table>
            <tr><th>Name</th><th>Role</th><th>Time</th><th>Status</th></tr>
            ${filteredLogs.map(log => `
              <tr>
                <td>${log.name}</td>
                <td>${log.role}</td>
                <td>${log.time}</td>
                <td class="status-${log.status.replace(/\s+/g, '-')}">${log.status}</td>
              </tr>`).join('')}
          </table>
        </body>
      </html>
    `;
    await generateAndSharePDF(htmlContent, 'Attendance_Logs');
  };

  const handleGenerate = (type, value) => {
    setModalType(type);
    setModalQRValue(value);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F4F7" />

      {/* QR Full-Screen Modal */}
      <QRModal
        visible={modalVisible}
        type={modalType}
        qrValue={modalQRValue}
        onClose={() => setModalVisible(false)}
      />

      {/* Filter Bottom Sheet */}
      <FilterModal 
        visible={filterVisible}
        currentFilter={filterStatus}
        onApply={(status) => {
          setFilterStatus(status);
          setFilterVisible(false);
        }}
        onClose={() => setFilterVisible(false)}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <Header />

        {/* ── Page Title ── */}
        {/* ── Page Title ── */}
<View style={styles.pageTitleRow}>
  <View>
    <Text style={styles.pageTitle}>Attendance</Text>
    <Text style={styles.pageSubtitle}>Operations Control</Text>
  </View>
  <TouchableOpacity
    style={styles.staffListBtn}
    onPress={() => navigation.navigate('StaffList')}
    activeOpacity={0.85}>
    <Text style={styles.staffListBtnText}>👥 Staff List</Text>
  </TouchableOpacity>
</View>

        {/* ── Check In / Out Cards ── */}
        <View style={styles.cardsRow}>
          <CheckCard type="in" onGenerate={handleGenerate} />
          <CheckCard type="out" onGenerate={handleGenerate} />
        </View>

        {/* ── Logs Section ── */}
        <View style={styles.logsSection}>
          <View style={styles.logsHeader}>
            <Text style={styles.logsTitle}>Logs</Text>
            <View style={styles.logsActions}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => setFilterVisible(true)}>
                <FilterIcon width={18} height={18} stroke="#555" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={generatePDF}>
                <DownloadIcon width={18} height={18} fill="#555" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.logsList}>
            {filteredLogs.length > 0 ? filteredLogs.map((entry, index) => (
              <React.Fragment key={entry.id}>
                <LogItem entry={entry} />
                {index < filteredLogs.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            )) : (
              <View style={styles.emptyLogs}>
                <Text style={styles.emptyLogsText}>No logs matched "{filterStatus}"</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },

  // Header
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
  },
  headerTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerRight: { flexDirection: 'row', gap: 8 },
  headerTitleText: { fontSize: 16, fontWeight: '800', color: '#2D2F8E' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' },
  iconBtn: {
    backgroundColor: '#2D2F8E', borderRadius: 10,
    width: 36, height: 36, alignItems: 'center', justifyContent: 'center',
  },

  // Page Title
  pageTitleRow: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A2E',
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#8A9BB0',
    marginTop: 2,
  },
pageTitleRow: {
  paddingHorizontal: 16,
  paddingTop: 8,
  paddingBottom: 16,
  flexDirection: 'row',          // add this
  justifyContent: 'space-between', // add this
  alignItems: 'flex-end',         // add this
},
staffListBtn: {
  backgroundColor: '#2D2F8E',
  paddingHorizontal: 14,
  paddingVertical: 9,
  borderRadius: 10,
  shadowColor: '#2D2F8E',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.3,
  shadowRadius: 6,
  elevation: 4,
},
staffListBtnText: {
  color: '#FFFFFF',
  fontSize: 12,
  fontWeight: '700',
  letterSpacing: 0.4,
},
  // Cards Row
  cardsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 10,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  cardActive: {
    borderWidth: 0,
  },

  // Badge
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4,
  },
  badgeIn: {
    backgroundColor: '#E8F5E9',
  },
  badgeOut: {
    backgroundColor: '#FFF3E0',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  badgeTextIn: {
    color: '#2E7D32',
  },
  badgeTextOut: {
    color: '#E65100',
  },

  // Card corner icon
  cardCornerIcon: {
    position: 'absolute',
    top: 14,
    right: 14,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A2E',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 10,
  },

  // QR Box (live or idle)
  qrBox: {
    backgroundColor: '#1E3A5F',
    borderRadius: 10,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  qrBoxOut: {
    backgroundColor: '#1A3A30',
  },
  qrIdleContent: {
    alignItems: 'center',
    gap: 6,
  },
  qrIdleIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrIdleIconText: {
    fontSize: 22,
    color: 'rgba(255,255,255,0.5)',
  },
  qrIdleHint: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 1,
    fontWeight: '600',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalHeaderIn: {
    backgroundColor: '#2D2F8E',
  },
  modalHeaderOut: {
    backgroundColor: '#1A3A30',
  },
  modalHeaderText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  modalQRWrapper: {
    alignItems: 'center',
    paddingVertical: 28,
    backgroundColor: '#FAFAFA',
  },
  modalMeta: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 4,
  },
  modalMetaLabel: {
    fontSize: 11,
    color: '#8A9BB0',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 8,
    textTransform: 'uppercase',
  },
  modalMetaValue: {
    fontSize: 14,
    color: '#1A1A2E',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  modalDoneBtn: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  modalDoneBtnIn: {
    backgroundColor: '#2D2F8E',
  },
  modalDoneBtnOut: {
    backgroundColor: '#1E3A5F',
  },
  modalDoneBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  // Generate button
  generateBtn: {
    borderWidth: 1.5,
    borderColor: '#D0D5DD',
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  generateBtnActive: {
    backgroundColor: '#2D2F8E',
    borderColor: '#2D2F8E',
  },
  generateBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
  },
  generateBtnTextActive: {
    color: '#FFFFFF',
  },

  // Logs
  logsSection: {
    marginTop: 24,
    paddingHorizontal: 12,
  },
  logsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  logsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  logsActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  logsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  logAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logAvatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  logInfo: {
    flex: 1,
  },
  logName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 3,
  },
  logSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logRole: {
    fontSize: 12,
    color: '#8A9BB0',
  },
  logDot: {
    fontSize: 12,
    color: '#8A9BB0',
  },
  logStatus: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  logTime: {
    fontSize: 11,
    color: '#8A9BB0',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F2F5',
    marginHorizontal: 16,
  },

  // Filter Modal
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  sheetCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F2F4F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetCloseBtnText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '700',
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8A9BB0',
    marginBottom: 12,
  },
  filterOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F2F4F7',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#3D5AFE',
    borderColor: '#3D5AFE',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  emptyLogs: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyLogsText: {
    color: '#8A9BB0',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default AttendanceScreen;