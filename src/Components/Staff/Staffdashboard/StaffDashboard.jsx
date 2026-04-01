import { useState } from "react";
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Modal,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import Svg2, {
  Path,
  Circle,
  Rect,
  Polyline,
  Line,
  Polygon,
} from "react-native-svg";

// ─── Icons ────────────────────────────────────────────────────────────────────

const MenuIcon = ({ size = 20, color = "#fff" }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="3" y1="6" x2="21" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="3" y1="12" x2="21" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="3" y1="18" x2="21" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg2>
);

const BellIcon = ({ size = 20, color = "#fff" }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg2>
);

const BoxIcon = ({ size = 20, color = "#2D2F8E" }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="12" y1="22.08" x2="12" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg2>
);

const ShiftIcon = ({ size = 20, color = "#f59e0b" }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke={color} strokeWidth="2" />
    <Line x1="16" y1="2" x2="16" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="8" y1="2" x2="8" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="3" y1="10" x2="21" y2="10" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg2>
);

const SellIcon = ({ size = 26, color = "#fff" }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="3" width="20" height="14" rx="2" stroke={color} strokeWidth="2" />
    <Line x1="8" y1="21" x2="16" y2="21" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="12" y1="17" x2="12" y2="21" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="7" y1="8" x2="7" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="12" y1="6" x2="12" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="17" y1="9" x2="17" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg2>
);

const FingerprintIcon = ({ size = 26, color = "#fff" }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 10a2 2 0 0 0-2 2v4" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M10 8.5A4 4 0 0 1 16 12v2" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M8.5 7.5A6 6 0 0 1 18 12v3" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M7 6.5A8 8 0 0 1 20 12v4" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M5 5.5A10 10 0 0 1 22 12v5" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg2>
);

const SmartphoneIcon = ({ size = 22, color = "#2D2F8E" }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="5" y="2" width="14" height="20" rx="2" ry="2" stroke={color} strokeWidth="2" />
    <Line x1="12" y1="18" x2="12.01" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg2>
);

const HeadphonesIcon = ({ size = 22, color = "#f59e0b" }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 18v-6a9 9 0 0 1 18 0v6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg2>
);

const ChevronRightIcon = ({ size = 14, color = "#7986cb" }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline points="9 18 15 12 9 6" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg2>
);

const HomeIcon = ({ size = 22, color = "#fff" }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="9 22 9 12 15 12 15 22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg2>
);

const HistoryIcon = ({ size = 22, color = "#8892b0" }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
    <Polyline points="12 7 12 12 15 15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg2>
);

const UserIcon = ({ size = 22, color = "#8892b0" }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" />
  </Svg2>
);

const SettingsIcon = ({ size = 18, color = "#2D2F8E" }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
    <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg2>
);

const LogoutIcon2 = ({ size = 18, color = "#ef4444" }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="16 17 21 12 16 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="21" y1="12" x2="9" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg2>
);

// ─── Data ─────────────────────────────────────────────────────────────────────

const recentSales = [
  {
    id: "ORD-9042",
    product: "iPhone 15 Pro Max",
    time: "2 mins ago",
    amount: "₹1,44,900",
    IconComp: SmartphoneIcon,
    iconColor: "#2D2F8E",
    iconBg: "rgba(45,47,142,0.1)",
  },
  {
    id: "ORD-9041",
    product: "AirPods Max",
    time: "15 mins ago",
    amount: "₹59,900",
    IconComp: HeadphonesIcon,
    iconColor: "#f59e0b",
    iconBg: "rgba(245,158,11,0.1)",
  },
  {
    id: "ORD-9040",
    product: "Samsung Galaxy S24 Ultra",
    time: "42 mins ago",
    amount: "₹1,24,999",
    IconComp: SmartphoneIcon,
    iconColor: "#2D2F8E",
    iconBg: "rgba(45,47,142,0.1)",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function StaffHomePage() {
  const navigation = useNavigation();
  const [activeNav, setActiveNav] = useState("home");
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const shiftActive = true;

  const handleLogout = () => {
    setProfileMenuVisible(false);
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout', style: 'destructive',
          onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Profile Dropdown Modal */}
      <Modal
        visible={profileMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setProfileMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setProfileMenuVisible(false)}
        >
          <View style={styles.dropdownMenu}>
            <View style={styles.dropdownHeader}>
              <View style={styles.dropdownAvatar}>
                <Text style={styles.dropdownAvatarText}>VM</Text>
              </View>
              <View>
                <Text style={styles.dropdownName}>Vishnu Mobile Shop</Text>
                <Text style={styles.dropdownRole}>Staff Member</Text>
              </View>
            </View>
            <View style={styles.dropdownSep} />
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => { setProfileMenuVisible(false); navigation.navigate('Settings'); }}
            >
              <View style={styles.dropdownItemIcon}>
                <SettingsIcon size={18} color="#2D2F8E" />
              </View>
              <Text style={styles.dropdownItemText}>Settings</Text>
            </TouchableOpacity>
            <View style={styles.dropdownSep} />
            <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
              <View style={[styles.dropdownItemIcon, styles.dropdownItemIconDanger]}>
                <LogoutIcon2 size={18} color="#ef4444" />
              </View>
              <Text style={[styles.dropdownItemText, styles.dropdownItemTextDanger]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <View style={styles.dot} />
          <Text style={styles.headerTitleText}>Vishnu Mobile Shop</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <BellIcon size={18} color="#fff" />
            <View style={styles.badge} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setProfileMenuVisible(true)}
          >
            <UserIcon size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={styles.greetingRow}>
          <View>
            <Text style={styles.greetingName}>Hey, Ravi 👋</Text>
            <Text style={styles.greetingDate}>Wednesday, 1 Apr 2026</Text>
          </View>
          <View style={[styles.shiftBadge, shiftActive ? styles.shiftBadgeActive : styles.shiftBadgeOff]}>
            <View style={[styles.shiftDot, shiftActive ? styles.shiftDotActive : styles.shiftDotOff]} />
            <Text style={[styles.shiftBadgeText, shiftActive ? styles.shiftBadgeTextActive : styles.shiftBadgeTextOff]}>
              {shiftActive ? "Shift Active" : "Off Duty"}
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {/* Total Items Sold */}
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: "rgba(45,47,142,0.1)" }]}>
              <BoxIcon size={18} color="#2D2F8E" />
            </View>
            <Text style={styles.statLabel}>Total Items Sold</Text>
            <Text style={styles.statValue}>128</Text>
          </View>

          {/* Shift Status */}
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: "rgba(245,158,11,0.12)" }]}>
              <ShiftIcon size={18} color="#f59e0b" />
            </View>
            <Text style={styles.statLabel}>Shift Status</Text>
            <Text style={[styles.statValue, { color: shiftActive ? "#22c55e" : "#ef4444" }]}>
              {shiftActive ? "Active" : "Inactive"}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          {/* Sell Product */}
          <TouchableOpacity style={styles.actionCard} activeOpacity={0.85}>
            <View style={[styles.actionIconBox, { backgroundColor: "#2D2F8E" }]}>
              <SellIcon size={26} color="#fff" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Sell Product</Text>
              <Text style={styles.actionSub}>Start a new transaction now</Text>
            </View>
            <ChevronRightIcon size={16} color="#94A3B8" />
          </TouchableOpacity>

          {/* Scan Attendance */}
          <TouchableOpacity style={[styles.actionCard, styles.actionCardLast]} activeOpacity={0.85}>
            <View style={[styles.actionIconBox, { backgroundColor: "#94A3B8" }]}>
              <FingerprintIcon size={26} color="#fff" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Scan Attendance</Text>
              <Text style={styles.actionSub}>Check-in or Check-out</Text>
            </View>
            <ChevronRightIcon size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Recent Sales */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Recent Sales</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>View All</Text>
            </TouchableOpacity>
          </View>

          {recentSales.map((tx, idx) => (
            <View
              key={tx.id}
              style={[
                styles.txRow,
                idx === recentSales.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <View style={[styles.txIconBox, { backgroundColor: tx.iconBg }]}>
                <tx.IconComp size={20} color={tx.iconColor} />
              </View>
              <View style={styles.txInfo}>
                <Text style={styles.txProduct}>{tx.product}</Text>
                <Text style={styles.txMeta}>
                  {tx.time} • Transaction {tx.id}
                </Text>
              </View>
              <Text style={styles.txAmount}>{tx.amount}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  // Header
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
  },
  headerTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitleText: { fontSize: 16, fontWeight: '800', color: '#2D2F8E' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' },
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

  // Profile Dropdown Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start', alignItems: 'flex-end',
    paddingTop: 68, paddingRight: 16,
  },
  dropdownMenu: {
    backgroundColor: '#fff', borderRadius: 16, width: 230,
    elevation: 12, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 16,
    overflow: 'hidden',
  },
  dropdownHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 14, backgroundColor: '#F8F9FF',
  },
  dropdownAvatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#2D2F8E',
    alignItems: 'center', justifyContent: 'center',
  },
  dropdownAvatarText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  dropdownName: { fontSize: 13, fontWeight: '800', color: '#1E293B' },
  dropdownRole: { fontSize: 11, color: '#94A3B8', marginTop: 1 },
  dropdownSep: { height: 1, backgroundColor: '#F1F5F9' },
  dropdownItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  dropdownItemIcon: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#EEF0FF',
    alignItems: 'center', justifyContent: 'center',
  },
  dropdownItemIconDanger: { backgroundColor: '#FEE2E2' },
  dropdownItemText: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  dropdownItemTextDanger: { color: '#ef4444' },

  // Body
  body: {
    backgroundColor: "#F5F6FA",
    padding: 16,
    paddingBottom: 32,
  },

  // Greeting
  greetingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  greetingName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E293B",
  },
  greetingDate: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  shiftBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  shiftBadgeActive: { backgroundColor: "rgba(34,197,94,0.12)" },
  shiftBadgeOff: { backgroundColor: "rgba(239,68,68,0.12)" },
  shiftDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  shiftDotActive: { backgroundColor: "#22c55e" },
  shiftDotOff: { backgroundColor: "#ef4444" },
  shiftBadgeText: { fontSize: 11, fontWeight: "700" },
  shiftBadgeTextActive: { color: "#22c55e" },
  shiftBadgeTextOff: { color: "#ef4444" },

  // Stats Row
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderBottomWidth: 3,
    borderBottomColor: "#2D2F8E",
  },
  statIconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  statLabel: {
    color: "#64748B",
    fontSize: 11,
    marginBottom: 3,
  },
  statValue: {
    color: "#1E293B",
    fontSize: 22,
    fontWeight: "800",
  },

  // Section
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    color: "#1E293B",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 14,
  },
  seeAll: {
    color: "#2D2F8E",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 14,
  },

  // Action Cards
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  actionCardLast: {
    borderBottomWidth: 0,
  },
  actionIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  actionInfo: { flex: 1 },
  actionTitle: {
    color: "#1E293B",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 3,
  },
  actionSub: {
    color: "#64748B",
    fontSize: 12,
  },

  // Transactions
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  txIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  txInfo: { flex: 1 },
  txProduct: {
    color: "#1E293B",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 3,
  },
  txMeta: {
    color: "#94A3B8",
    fontSize: 11,
  },
  txAmount: {
    color: "#1E293B",
    fontSize: 14,
    fontWeight: "800",
  },

  // Bottom Nav
  bottomNav: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 20,
    justifyContent: "space-around",
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    position: "relative",
  },
  navActiveIndicator: {
    position: "absolute",
    top: -12,
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#2D2F8E",
  },
});