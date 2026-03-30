import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Svg,
} from "react-native";

// SVG Icons as React Native SVG components
import Svg2, { Path, Circle, Rect, Polyline, Line, Polygon } from "react-native-svg";

// Icon components
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

const DollarIcon = ({ size = 18, color = "#3d5af1" }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="12" y1="1" x2="12" y2="23" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg2>
);

const CalendarIcon = ({ size = 18, color = "#a78bfa" }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke={color} strokeWidth="2" />
    <Line x1="16" y1="2" x2="16" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="8" y1="2" x2="8" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="3" y1="10" x2="21" y2="10" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg2>
);

const BoxIcon = ({ size = 18, color = "#22c55e" }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="12" y1="22.08" x2="12" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg2>
);

const StarIcon = ({ size = 18, color = "#f59e0b" }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg2>
);

const SmartphoneIcon = ({ size = 28, color = "#7986cb" }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="5" y="2" width="14" height="20" rx="2" ry="2" stroke={color} strokeWidth="2" />
    <Line x1="12" y1="18" x2="12.01" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg2>
);

const ShoppingCartIcon = ({ size = 18, color = "#8892b0" }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="9" cy="21" r="1" stroke={color} strokeWidth="2" />
    <Circle cx="20" cy="21" r="1" stroke={color} strokeWidth="2" />
    <Path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg2>
);

const HeadphonesIcon = ({ size = 22, color = "#7986cb" }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 18v-6a9 9 0 0 1 18 0v6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg2>
);

const WatchIcon = ({ size = 22, color = "#ef4444" }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="7" stroke={color} strokeWidth="2" />
    <Polyline points="12 9 12 12 13.5 13.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16.51 17.35l-.35 3.83a2 2 0 0 1-2 1.82H9.83a2 2 0 0 1-2-1.82l-.35-3.83m.01-10.7l.35-3.83A2 2 0 0 1 9.83 1h4.35a2 2 0 0 1 2 1.82l.35 3.83" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg2>
);

const ChevronRightIcon = ({ size = 14, color = "#7986cb" }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline points="9 18 15 12 9 6" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg2>
);

const MoreVertIcon = ({ size = 16, color = "#4a5568" }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="5" r="1" fill={color} />
    <Circle cx="12" cy="12" r="1" fill={color} />
    <Circle cx="12" cy="19" r="1" fill={color} />
  </Svg2>
);

const TrendUpIcon = ({ size = 10, color = "#22c55e" }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="17 6 23 6 23 12" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg2>
);

const HomeIcon = ({ size = 22, color = "#fff" }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="9 22 9 12 15 12 15 22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg2>
);

const BarChartIcon = ({ size = 22, color = "#8892b0" }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="18" y1="20" x2="18" y2="10" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="12" y1="20" x2="12" y2="4" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="6" y1="20" x2="6" y2="14" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg2>
);

const ShoppingBagIcon = ({ size = 22, color = "#8892b0" }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="3" y1="6" x2="21" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M16 10a4 4 0 0 1-8 0" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg2>
);

const UserIcon = ({ size = 22, color = "#8892b0" }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" />
  </Svg2>
);

const data = {
  stats: [
    { IconComp: DollarIcon, iconColor: "#3d5af1", iconBg: "rgba(61,90,241,0.15)", label: "Today Sales", value: "₹42,500", change: "+12%", up: true },
    { IconComp: CalendarIcon, iconColor: "#a78bfa", iconBg: "rgba(167,139,250,0.15)", label: "Monthly Sales", value: "₹12.8L", change: "+8%", up: true },
    { IconComp: BoxIcon, iconColor: "#22c55e", iconBg: "rgba(34,197,94,0.15)", label: "Total Orders", value: "1,240", change: "+4%", up: true },
    { IconComp: StarIcon, iconColor: "#f59e0b", iconBg: "rgba(245,158,11,0.15)", label: "Top Product", value: "iPhone 15", change: "+4", up: true },
  ],
  weekly: [55, 70, 45, 80, 65, 90, 75],
  monthly: [40, 50, 60, 55, 70, 80, 65],
  days: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
  transactions: [
    { id: "ORD-8821", product: "Samsung Galaxy S24 Ultra", amount: "₹1,24,999", status: "COMPLETED", ok: true },
    { id: "ORD-8820", product: "OnePlus 100 (Black)", amount: "₹39,999", status: "PROCESSING", ok: false },
    { id: "ORD-8819", product: "Infinix GT Neo 3", amount: "₹28,500", status: "COMPLETED", ok: true },
  ],
  stock: [
    { name: "Redmi Note 13 Pro+", left: 2, critical: true, IconComp: SmartphoneIcon, iconColor: "#ef4444" },
    { name: "Galaxy Buds2 Pro", left: 5, critical: false, IconComp: HeadphonesIcon, iconColor: "#a78bfa" },
    { name: "Apple Watch Series 9", left: 1, critical: true, IconComp: WatchIcon, iconColor: "#ef4444" },
  ],
};

const C = {
  bg: "#FFFFFF",
  card: "#FFFFFF",
  accent: "#2D2F8E",
  text: "#1E293B",
  muted: "#64748B",
  green: "#22c55e",
  orange: "#f59e0b",
  red: "#ef4444",
  purple: "#2D2F8E",
};

export default function Dashboard() {
  const [tab, setTab] = useState("WEEKLY");
  const bars = tab === "WEEKLY" ? data.weekly : data.monthly;
  const maxBar = Math.max(...bars);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1a2a6c" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn}>
          <MenuIcon size={18} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <View style={styles.dot} />
          <Text style={styles.headerTitleText}>Vishnu Mobile Shop</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn}>
          <BellIcon size={18} color="#fff" />
          <View style={styles.badge} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {/* Stat Cards */}
        <View style={styles.statsGrid}>
          {data.stats.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <View style={styles.statTop}>
                <View style={[styles.statIconBox, { backgroundColor: s.iconBg }]}>
                  <s.IconComp size={18} color={s.iconColor} />
                </View>
                <View style={[styles.changePill, s.up ? styles.changePillUp : styles.changePillDown]}>
                  <View style={styles.changePillInner}>
                    <TrendUpIcon size={8} color={s.up ? C.green : C.red} />
                    <Text style={[styles.changePillText, s.up ? styles.changePillTextUp : styles.changePillTextDown]}>
                      {" "}{s.change}
                    </Text>
                  </View>
                </View>
              </View>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
            </View>
          ))}
        </View>

        {/* Revenue Chart */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Revenue Dynamics</Text>
            <View style={styles.tabRow}>
              {["WEEKLY", "MONTHLY"].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.tab, tab === t && styles.tabActive]}
                  onPress={() => setTab(t)}
                >
                  <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.chartArea}>
            {bars.map((val, i) => (
              <View key={i} style={styles.barCol}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      tab === "WEEKLY" ? styles.barBlue : styles.barPurple,
                      { height: `${(val / maxBar) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{data.days[i]}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Top Performer */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Top Performer</Text>
          </View>
          <View style={styles.performerRow}>
            <View style={styles.performerBox}>
              <SmartphoneIcon size={30} color="#7986cb" />
            </View>
            <View style={styles.performerInfo}>
              <Text style={styles.performerName}>iPhone 15 Pro Max</Text>
              <Text style={styles.performerSub}>256GB · Natural Titanium</Text>
              <View style={styles.progressBg}>
                <View style={styles.progressFill} />
              </View>
              <Text style={styles.performerPct}>83% of target achieved</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.viewFull}>
            <Text style={styles.viewFullText}>View full report</Text>
            <ChevronRightIcon size={13} color="#7986cb" />
          </TouchableOpacity>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {data.transactions.map((tx) => (
            <View key={tx.id} style={styles.txRow}>
              <View style={styles.txIcon}>
                <ShoppingCartIcon size={16} color="#7986cb" />
              </View>
              <View style={styles.txInfo}>
                <Text style={styles.txId}>{tx.id}</Text>
                <Text style={styles.txProduct} numberOfLines={1}>{tx.product}</Text>
              </View>
              <View style={styles.txRight}>
                <Text style={styles.txAmount}>{tx.amount}</Text>
                <Text style={[styles.txStatus, tx.ok ? styles.txStatusOk : styles.txStatusPending]}>
                  {tx.status}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Stock Replenishment */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Stock Replenishment</Text>
            <View style={styles.criticalBadge}>
              <View style={styles.criticalDot} />
              <Text style={styles.criticalBadgeText}>16 Critical</Text>
            </View>
          </View>
          {data.stock.map((s) => (
            <View key={s.name} style={styles.stockRow}>
              <View style={[styles.stockBox, s.critical ? styles.stockBoxCritical : styles.stockBoxWarn]}>
                <s.IconComp size={22} color={s.iconColor} />
              </View>
              <Text style={styles.stockName}>{s.name}</Text>
              <View style={styles.stockRight}>
                <Text style={[styles.stockLeft, s.critical ? styles.stockCritical : styles.stockWarn]}>
                  {s.left} left
                </Text>
                <MoreVertIcon size={16} color="rgba(255,255,255,0.25)" />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Nav */}
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#1a2a6c",
  },

  // Header
 
 

header: {
  backgroundColor: "#FFFFFF",
  paddingHorizontal: 20,
  paddingVertical: 14,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
},

headerTitleText: {
  fontSize: 16,
  fontWeight: "700",
  color: "#2D2F8E",
},

iconBtn: {
  backgroundColor: "#2D2F8E",
  borderRadius: 10,
  width: 36,
  height: 36,
  alignItems: "center",
  justifyContent: "center",
},

badge: {
  backgroundColor: "#000000",
  borderColor: "#a87878",
},

  // Body
  body: {
  backgroundColor: "#F5F6FA",
  padding: 16,
  paddingBottom: 32,
},

  // Stat Grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 14,
    
    borderBottomColor: "#2D2F8E",
    width: "47.5%",
    borderBottomWidth: 3,
  },
  statTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  statIconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  changePill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  changePillUp: { backgroundColor: "rgba(34,197,94,0.15)" },
  changePillDown: { backgroundColor: "rgba(239,68,68,0.15)" },
  changePillInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  changePillText: { fontSize: 10, fontWeight: "700" },
  changePillTextUp: { color: C.green },
  changePillTextDown: { color: C.red },
  statLabel: { color: C.muted, fontSize: 11, marginBottom: 3 },
  statValue: { color: C.text, fontSize: 18, fontWeight: "800" },

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
  sectionTitle: { color: C.text, fontSize: 15, fontWeight: "700" },
  seeAll: { color: "#7986cb", fontSize: 12, fontWeight: "600" },

  // Chart
  tabRow: { flexDirection: "row", gap: 6 },
  tab: {
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 8,
  backgroundColor: "#F1F5F9",
},

tabActive: {
  backgroundColor: "#2D2F8E",
},

tabText: {
  fontSize: 10,
  fontWeight: "700",
  color: "#64748B",
},

tabTextActive: {
  color: "#FFFFFF",
},
  chartArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 110,
    marginTop: 4,
    gap: 4,
  },
  barCol: {
    flex: 1,
    alignItems: "center",
    height: "100%",
    gap: 6,
  },
  barWrapper: {
    flex: 1,
    width: "60%",
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    borderRadius: 4,
    minHeight: 4,
  },
 barBlue: { backgroundColor: "#2D2F8E" },
barPurple: { backgroundColor: "#2D2F8E" },

barLabel: {
  color: "#94A3B8",
  fontSize: 8,
},

  // Top Performer
  performerRow: { flexDirection: "row", gap: 14, alignItems: "center" },
  performerBox: {
    width: 64,
    height: 64,
    backgroundColor: "#0a0e1a",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  performerInfo: { flex: 1 },
  performerName: { color: C.text, fontWeight: "700", fontSize: 14, marginBottom: 2 },
  performerSub: { color: C.muted, fontSize: 11, marginBottom: 8 },
  progressBg: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: C.purple,
    borderRadius: 3,
    width: "83%",
  },
  performerPct: { color: C.muted, fontSize: 10 },
  viewFull: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.07)",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewFullText: { color: "#7986cb", fontSize: 12, fontWeight: "600" },

  // Transactions
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  txIcon: {
    width: 38,
    height: 38,
    backgroundColor: "rgba(61,90,241,0.12)",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  txInfo: { flex: 1 },
  txId: { color: C.text, fontWeight: "700", fontSize: 12 },
  txProduct: { color: C.muted, fontSize: 10, marginTop: 2 },
  txRight: { alignItems: "flex-end" },
  txAmount: { color: C.text, fontWeight: "700", fontSize: 13 },
  txStatus: { fontSize: 9, fontWeight: "700", marginTop: 2 },
  txStatusOk: { color: C.green },
  txStatusPending: { color: C.orange },

  // Stock
  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  stockBox: {
    width: 44,
    height: 44,
    backgroundColor: "#0a0e1a",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  stockBoxCritical: {
    borderColor: "rgba(239,68,68,0.25)",
    backgroundColor: "rgba(239,68,68,0.08)",
  },
  stockBoxWarn: {
    borderColor: "rgba(167,139,250,0.25)",
    backgroundColor: "rgba(167,139,250,0.08)",
  },
  stockName: { flex: 1, color: C.text, fontSize: 12, fontWeight: "600" },
  stockRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  stockLeft: { fontSize: 11, fontWeight: "700" },
  stockCritical: { color: C.red },
  stockWarn: { color: C.orange },
  criticalBadge: {
    backgroundColor: "rgba(239,68,68,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  criticalDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.red,
  },
  criticalBadgeText: { color: C.red, fontSize: 10, fontWeight: "700" },

  // Bottom Nav
  bottomNav: {
    backgroundColor: "#16213e",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.07)",
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 20,
    justifyContent: "space-around",
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    position: "relative",
  },
  navActiveIndicator: {
    position: "absolute",
    top: -12,
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: C.accent,
  },
});