import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg2, { Path, Circle, Line, Polyline, Rect } from 'react-native-svg';
import BackArrow from '../../asset/back-arrow.svg';

const BLUE = '#2D2F8E';

// ─── Icons ────────────────────────────────────────────────────────────────────
const UserIcon = ({ size = 20, color = BLUE }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" />
  </Svg2>
);

const BellIcon = ({ size = 20, color = BLUE }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg2>
);

const LockIcon = ({ size = 20, color = BLUE }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke={color} strokeWidth="2" />
    <Path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg2>
);

const PrinterIcon = ({ size = 20, color = BLUE }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline points="6 9 6 2 18 2 18 9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Rect x="6" y="14" width="12" height="8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg2>
);

const GSTIcon = ({ size = 20, color = BLUE }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2L2 7l10 5 10-5-10-5z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M2 17l10 5 10-5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M2 12l10 5 10-5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg2>
);

const StoreIcon = ({ size = 20, color = BLUE }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="9 22 9 12 15 12 15 22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg2>
);

const ChevronRight = ({ size = 16, color = '#94A3B8' }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline points="9 18 15 12 9 6" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg2>
);

const InfoIcon = ({ size = 20, color = BLUE }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Line x1="12" y1="8" x2="12" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="12" y1="16" x2="12.01" y2="16" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg2>
);

// ─── Setting Row Components ───────────────────────────────────────────────────
const SettingToggle = ({ icon, label, subtitle, value, onToggle }) => (
  <View style={s.row}>
    <View style={s.rowIcon}>{icon}</View>
    <View style={s.rowText}>
      <Text style={s.rowLabel}>{label}</Text>
      {subtitle ? <Text style={s.rowSub}>{subtitle}</Text> : null}
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{ false: '#E2E8F0', true: `${BLUE}55` }}
      thumbColor={value ? BLUE : '#94A3B8'}
    />
  </View>
);

const SettingLink = ({ icon, label, subtitle, onPress, danger }) => (
  <TouchableOpacity style={s.row} onPress={onPress} activeOpacity={0.7}>
    <View style={[s.rowIcon, danger && s.rowIconDanger]}>{icon}</View>
    <View style={s.rowText}>
      <Text style={[s.rowLabel, danger && s.rowLabelDanger]}>{label}</Text>
      {subtitle ? <Text style={s.rowSub}>{subtitle}</Text> : null}
    </View>
    <ChevronRight />
  </TouchableOpacity>
);

const SectionHeader = ({ title }) => (
  <Text style={s.sectionHeader}>{title}</Text>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const navigation = useNavigation();

  const [notifications, setNotifications] = useState(true);
  const [lowStockAlert, setLowStockAlert]   = useState(true);
  const [soundEnabled, setSoundEnabled]     = useState(false);
  const [autoPrint, setAutoPrint]           = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* HEADER */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <BackArrow width={20} height={20} fill={BLUE} stroke={BLUE} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Settings</Text>
          <Text style={s.headerSub}>Vishnu Mobile Shop</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Profile Card */}
        <View style={s.profileCard}>
          <View style={s.profileAvatar}>
            <Text style={s.profileAvatarText}>VM</Text>
          </View>
          <View style={s.profileText}>
            <Text style={s.profileName}>Vishnu Mobile Shop</Text>
            <Text style={s.profileRole}>Administrator</Text>
          </View>
          <View style={s.profileBadge}>
            <Text style={s.profileBadgeText}>ADMIN</Text>
          </View>
        </View>

        {/* Store Info */}
        <SectionHeader title="STORE INFORMATION" />
        <View style={s.card}>
          <SettingLink
            icon={<StoreIcon />}
            label="Shop Name"
            subtitle="Vishnu Mobile Shop"
            onPress={() => Alert.alert('Shop Name', 'Edit shop name — coming soon!')}
          />
          <View style={s.sep} />
          <SettingLink
            icon={<GSTIcon />}
            label="GST Number"
            subtitle="GST rate: 18% · Edit GSTIN"
            onPress={() => Alert.alert('GST Settings', 'Edit GST number — coming soon!')}
          />
          <View style={s.sep} />
          <SettingLink
            icon={<UserIcon />}
            label="Account & Profile"
            subtitle="Manage owner details"
            onPress={() => Alert.alert('Profile', 'Edit profile — coming soon!')}
          />
        </View>

        {/* Notifications */}
        <SectionHeader title="NOTIFICATIONS" />
        <View style={s.card}>
          <SettingToggle
            icon={<BellIcon />}
            label="Push Notifications"
            subtitle="Sales, alerts & updates"
            value={notifications}
            onToggle={setNotifications}
          />
          <View style={s.sep} />
          <SettingToggle
            icon={<BellIcon color="#f59e0b" />}
            label="Low Stock Alerts"
            subtitle="Alert when stock < 5 units"
            value={lowStockAlert}
            onToggle={setLowStockAlert}
          />
          <View style={s.sep} />
          <SettingToggle
            icon={<BellIcon color="#22c55e" />}
            label="Sound & Vibration"
            subtitle="Play sound on new sale"
            value={soundEnabled}
            onToggle={setSoundEnabled}
          />
        </View>

        {/* Billing */}
        <SectionHeader title="BILLING & PRINTING" />
        <View style={s.card}>
          <SettingToggle
            icon={<PrinterIcon />}
            label="Auto-Print Bill"
            subtitle="Print immediately after sale"
            value={autoPrint}
            onToggle={setAutoPrint}
          />
          <View style={s.sep} />
          <SettingLink
            icon={<PrinterIcon color="#a78bfa" />}
            label="Bill Footer Text"
            subtitle="Customize thank-you message"
            onPress={() => Alert.alert('Bill Footer', 'Edit footer text — coming soon!')}
          />
        </View>

        {/* Security */}
        <SectionHeader title="SECURITY" />
        <View style={s.card}>
          <SettingLink
            icon={<LockIcon />}
            label="Change Password"
            subtitle="Update your login password"
            onPress={() => Alert.alert('Change Password', 'Feature coming soon!')}
          />
          <View style={s.sep} />
          <SettingLink
            icon={<LockIcon color="#f59e0b" />}
            label="Staff PIN Settings"
            subtitle="Manage staff access PINs"
            onPress={() => Alert.alert('Staff PIN', 'Feature coming soon!')}
          />
        </View>

        {/* About */}
        <SectionHeader title="ABOUT" />
        <View style={s.card}>
          <SettingLink
            icon={<InfoIcon />}
            label="App Version"
            subtitle="v1.0.0 · Vishnu Mobile Shop"
            onPress={() => {}}
          />
        </View>

        {/* Logout */}
        <SectionHeader title="" />
        <View style={s.card}>
          <SettingLink
            icon={<UserIcon color="#ef4444" />}
            label="Logout"
            subtitle="Sign out of your account"
            onPress={handleLogout}
            danger
          />
        </View>

        <Text style={s.footer}>Vishnu Mobile Shop · v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F6FA' },

  // Header
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderBottomWidth: 1, borderBottomColor: '#eee', elevation: 2,
  },
  backBtn: {
    width: 36, height: 36, backgroundColor: '#EEF0FF',
    borderRadius: 10, alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: BLUE },
  headerSub: { fontSize: 11, color: '#aaa', marginTop: 1 },

  scroll: { padding: 16, paddingBottom: 40 },

  // Profile card
  profileCard: {
    backgroundColor: BLUE, borderRadius: 16, padding: 18,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    marginBottom: 20, elevation: 4,
  },
  profileAvatar: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
  },
  profileAvatarText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  profileText: { flex: 1 },
  profileName: { color: '#fff', fontSize: 15, fontWeight: '800' },
  profileRole: { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 },
  profileBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  profileBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 1 },

  // Section header
  sectionHeader: {
    fontSize: 10, fontWeight: '800', color: '#94A3B8',
    letterSpacing: 1.2, marginBottom: 8, marginTop: 4, paddingHorizontal: 4,
  },

  // Card
  card: {
    backgroundColor: '#fff', borderRadius: 16, marginBottom: 12,
    overflow: 'hidden', elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8,
  },
  sep: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 66 },

  // Rows
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  rowIcon: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: '#EEF0FF',
    alignItems: 'center', justifyContent: 'center',
  },
  rowIconDanger: { backgroundColor: '#FEE2E2' },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  rowLabelDanger: { color: '#ef4444' },
  rowSub: { fontSize: 11, color: '#94A3B8', marginTop: 2 },

  footer: { textAlign: 'center', color: '#94A3B8', fontSize: 11, marginTop: 8 },
});
