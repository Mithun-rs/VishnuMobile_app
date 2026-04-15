import { useState, useCallback } from "react";
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
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';

// SVG Icons as React Native SVG components
import Svg2, { Path, Circle, Rect, Polyline, Line, Polygon, Text as SvgText } from "react-native-svg";

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

const ProfileIcon = ({ size = 20, color = "#fff" }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" />
  </Svg2>
);

const SettingsIcon = ({ size = 18, color = "#1E293B" }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
    <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg2>
);

const LogoutIcon = ({ size = 18, color = "#ef4444" }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="16 17 21 12 16 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="21" y1="12" x2="9" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
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

// Theme Color Pallete mapping for Stylesheet
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
  const navigation = useNavigation();
  const { signOut, profile } = useAuth();
  const [tab, setTab] = useState("WEEKLY");
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);

  // ── Live stats from Supabase ────────────────────────────────────────
  const [stats,      setStats]      = useState({ todaySales: 0, totalOrders: 0, totalProducts: 0, lowStockCount: 0 });
  const [lowStock,   setLowStock]   = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  const [rawOrders, setRawOrders] = useState([]);
  const [topPerformer, setTopPerformer] = useState(null);

  const loadDashboard = async () => {
    setLoadingStats(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Today's orders
      const { data: todayOrders } = await supabase
        .from('orders')
        .select('total_payable')
        .gte('created_at', today.toISOString());

      const todaySales = (todayOrders || []).reduce((s, o) => s + (o.total_payable || 0), 0);

      // Total orders count
      const { count: totalOrders } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true });

      // Total products
      const { count: totalProducts } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true });

      // Low / out of stock
      const { data: lowStockItems } = await supabase
        .from('products')
        .select('id, name, "stockQty", status')
        .in('status', ['LOW STOCK', 'OUT OF STOCK'])
        .order('"stockQty"', { ascending: true })
        .limit(5);

      // Recent orders
      const { data: recent } = await supabase
        .from('orders')
        .select('id, customer_name, total_payable, payment_method, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      // All past 6 months orders for the chart
      let sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
      sixMonthsAgo.setHours(0,0,0,0);
      const { data: allOrders } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', sixMonthsAgo.toISOString());
      
      const { data: allItems } = await supabase
        .from('order_items')
        .select('*');
        
      const { data: allProducts } = await supabase.from('products').select('id, name, storage, color');

      // Calculate Products Sold Today
      let soldToday = 0;
      if (allOrders?.length && allItems?.length) {
        const todayOrderIds = new Set(allOrders.filter(o => new Date(o.created_at) >= today).map(o => o.id));
        soldToday = allItems.filter(i => todayOrderIds.has(i.order_id)).reduce((sum, item) => sum + (item.qty || 0), 0);
      }

      setStats({
        todaySales,
        totalOrders:   totalOrders   || 0,
        soldToday:     soldToday     || 0,
        lowStockCount: (lowStockItems || []).length,
      });
      setLowStock(lowStockItems || []);
      setRecentOrders(recent || []);
      setRawOrders(allOrders || []);

      // Calculate Top Performer
      if (allOrders?.length && allItems?.length && allProducts?.length) {
        const qtyMap = {};
        allItems.forEach(i => { qtyMap[i.product_id] = (qtyMap[i.product_id] || 0) + (i.qty || 0); });
        let topId = Object.keys(qtyMap).sort((a,b) => qtyMap[b] - qtyMap[a])[0];
        if (topId) {
          const prodInfo = allProducts.find(p => p.id === topId);
          if (prodInfo) {
            setTopPerformer({
              name: prodInfo.name,
              sub: (prodInfo.storage || prodInfo.color) ? `${prodInfo.storage || ''} ${prodInfo.color || ''}`.trim() : 'Best Seller',
              pct: 95, // arbitrary placeholder
              sold: qtyMap[topId],
            });
          }
        }
      }
    } catch (e) {
      console.error('Dashboard load error:', e.message);
    } finally {
      setLoadingStats(false);
    }
  };

  useFocusEffect(useCallback(() => { loadDashboard(); }, []));

  // Build display name from profile
  const displayName = profile?.full_name || profile?.username || 'Admin';
  const initials    = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const roleLabel   = profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'Administrator';

  const { chartBars, maxVal } = React.useMemo(() => {
    if (!rawOrders.length) return { chartBars: [], maxVal: 10 };

    const now = new Date();
    let startDate = new Date();
    let groupedData = {}; // key: group label

    if (tab === 'WEEKLY') {
      startDate.setDate(now.getDate() - 6);
      for(let i=0; i<7; i++) {
        let d = new Date(startDate);
        d.setDate(d.getDate() + i);
        groupedData[d.toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase()] = { sales: 0, profit: 0 };
      }
    } else {
      // Monthly tab: show last 6 months
      startDate.setMonth(now.getMonth() - 5);
      for(let i=0; i<6; i++) {
        let d = new Date(startDate);
        d.setMonth(d.getMonth() + i);
        groupedData[d.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase()] = { sales: 0, profit: 0 };
      }
    }

    startDate.setHours(0,0,0,0);
    const validOrders = rawOrders.filter(o => new Date(o.created_at) >= startDate);

    validOrders.forEach(o => {
      const p = parseFloat(o.total_payable) || 0;
      const profit = p * 0.15; // 15% estimated margin
      
      const oDate = new Date(o.created_at);
      let groupKey = '';
      if (tab === 'WEEKLY') groupKey = oDate.toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase();
      if (tab === 'MONTHLY') groupKey = oDate.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase();

      if (groupedData[groupKey]) {
        groupedData[groupKey].sales += p;
        groupedData[groupKey].profit += profit;
      }
    });

    let formattedBars = Object.keys(groupedData).map(k => ({
      label: k,
      sales: parseFloat((groupedData[k].sales / 1000).toFixed(1)),
      profit: parseFloat((groupedData[k].profit / 1000).toFixed(1))
    }));

    const max = Math.max(...formattedBars.map(d => d.sales), 10) * 1.1;

    return { chartBars: formattedBars, maxVal: max };
  }, [rawOrders, tab]);

  const formatINR = (v) => '₹' + Math.round(v || 0).toLocaleString('en-IN');

  const RevenueChartHome = ({ data }) => {
    const chartW = Dimensions.get('window').width - 64; // Scale perfectly with padding
    const chartH = 160;
    const paddingLeft = 28;
    const paddingBottom = 24;
    const barAreaH = chartH - paddingBottom;
    const barCount = data.length || 1;
    const groupW = (chartW - paddingLeft) / barCount;
    const barW = Math.min(groupW * 0.32, 18);

    return (
      <Svg2 width={"100%"} height={chartH} viewBox={`0 0 ${chartW} ${chartH}`}>
        {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => {
          const y = barAreaH - frac * barAreaH;
          const val = Math.round(maxVal * frac);
          return (
            <React.Fragment key={i}>
              {frac > 0 && (
                <Line x1={paddingLeft} y1={y} x2={chartW} y2={y} stroke="#E8EAF6" strokeWidth={1} strokeDasharray="4,4" />
              )}
            </React.Fragment>
          );
        })}

        {data.map((d, i) => {
          const cx = paddingLeft + i * groupW + groupW / 2;
          const salesH = (d.sales / maxVal) * barAreaH;
          const profitH = (d.profit / maxVal) * barAreaH;

          return (
            <React.Fragment key={d.label}>
              <Rect
                x={cx - barW - 2} y={barAreaH - salesH} width={barW} height={salesH} rx={4} fill="#C5CAE9"
                onPress={() => Alert.alert(`Stats for ${d.label}`, `Sales: ₹${(d.sales * 1000).toLocaleString('en-IN')}\nProfit: ₹${(d.profit * 1000).toLocaleString('en-IN')}`)}
              />
              <Rect
                x={cx + 2} y={barAreaH - profitH} width={barW} height={profitH} rx={4} fill="#2D2F8E"
                onPress={() => Alert.alert(`Stats for ${d.label}`, `Sales: ₹${(d.sales * 1000).toLocaleString('en-IN')}\nProfit: ₹${(d.profit * 1000).toLocaleString('en-IN')}`)}
              />
              <SvgText
                x={cx}
                y={chartH - 4}
                fontSize={9}
                fill="#8A9BB0"
                textAnchor="middle"
                fontWeight="600">
                {d.label}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg2>
    );
  };

  const handleLogout = () => {
    setProfileMenuVisible(false);
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout', style: 'destructive',
          onPress: () => signOut(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1a2a6c" />

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
                <Text style={styles.dropdownAvatarText}>{initials}</Text>
              </View>
              <View>
                <Text style={styles.dropdownName}>{displayName}</Text>
                <Text style={styles.dropdownRole}>{roleLabel}</Text>
              </View>
            </View>
            <View style={styles.dropdownSep} />
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => { setProfileMenuVisible(false); navigation.navigate('Settings'); }}
            >
              <View style={styles.dropdownItemIcon}><SettingsIcon size={18} color="#2D2F8E" /></View>
              <Text style={styles.dropdownItemText}>Settings</Text>
            </TouchableOpacity>
            <View style={styles.dropdownSep} />
            <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
              <View style={[styles.dropdownItemIcon, styles.dropdownItemIconDanger]}>
                <LogoutIcon size={18} color="#ef4444" />
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
            <ProfileIcon size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {/* Stat Cards */}
        {loadingStats ? (
          <View style={{ alignItems: 'center', paddingVertical: 24 }}>
            <ActivityIndicator size="large" color="#2D2F8E" />
          </View>
        ) : (
        <View style={styles.statsGrid}>
          {[
            { label: 'Today Sales',     value: formatINR(stats.todaySales),   iconBg: 'rgba(61,90,241,0.15)',   iconColor: '#3d5af1', IconComp: DollarIcon },
            { label: 'Total Orders',    value: String(stats.totalOrders),     iconBg: 'rgba(34,197,94,0.15)',   iconColor: '#22c55e', IconComp: BoxIcon },
            { label: 'Products Sold',   value: String(stats.soldToday),       iconBg: 'rgba(167,139,250,0.15)', iconColor: '#a78bfa', IconComp: CalendarIcon, link: 'ProductsSoldReport' },
            { label: 'Low Stock Items', value: String(stats.lowStockCount),   iconBg: 'rgba(245,158,11,0.15)',  iconColor: '#f59e0b', IconComp: StarIcon },
          ].map((s) => {
            const CardView = s.link ? TouchableOpacity : View;
            return (
            <CardView 
              key={s.label} 
              style={styles.statCard}
              onPress={s.link ? () => navigation.navigate(s.link) : undefined}
              activeOpacity={s.link ? 0.7 : 1}
            >
              <View style={styles.statTop}>
                <View style={[styles.statIconBox, { backgroundColor: s.iconBg }]}>
                  <s.IconComp size={18} color={s.iconColor} />
                </View>
              </View>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
            </CardView>
            );
          })}
        </View>
        )}

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
          <View style={{ marginTop: 24, alignItems: 'center', width: '100%' }}>
            <RevenueChartHome data={chartBars} />
          </View>
        </View>

        {/* Top Selling Product */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Top Selling Product</Text>
          </View>
          {topPerformer ? (
            <View style={styles.performerRow}>
              <View style={styles.performerBox}>
                <SmartphoneIcon size={30} color="#7986cb" />
              </View>
              <View style={styles.performerInfo}>
                <Text style={styles.performerName}>{topPerformer.name}</Text>
                <Text style={styles.performerSub}>{topPerformer.sub}</Text>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, {width: `${topPerformer.pct || 100}%`}]} />
                </View>
                <Text style={styles.performerPct}>{topPerformer.sold} Unit(s) Sold in this period</Text>
              </View>
            </View>
          ) : (
            <Text style={{textAlign: 'center', color: '#999', paddingVertical: 20}}>No items sold yet</Text>
          )}
          <TouchableOpacity style={styles.viewFull} onPress={() => navigation.navigate('Report')}>
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
          {/* Recent Transactions - live from Supabase */}
          {recentOrders.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 12 }}>
              <Text style={{ color: '#aaa', fontSize: 13 }}>No orders yet</Text>
            </View>
          ) : (
            recentOrders.map((tx) => (
              <View key={tx.id} style={styles.txRow}>
                <View style={styles.txIcon}>
                  <ShoppingCartIcon size={16} color="#7986cb" />
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txId}>#{tx.id.slice(0, 8).toUpperCase()}</Text>
                  <Text style={styles.txProduct} numberOfLines={1}>
                    {tx.customer_name || 'Walk-in Customer'}
                  </Text>
                </View>
                <View style={styles.txRight}>
                  <Text style={styles.txAmount}>{formatINR(tx.total_payable)}</Text>
                  <Text style={[styles.txStatus, styles.txStatusOk]}>COMPLETED</Text>
                </View>
              </View>
            ))
          )}
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
          {/* Stock Replenishment - live from Supabase */}
          {lowStock.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 12 }}>
              <Text style={{ color: '#22c55e', fontSize: 13, fontWeight: '700' }}>✅ All stock levels healthy!</Text>
            </View>
          ) : (
            lowStock.map((s) => (
              <View key={s.id} style={styles.stockRow}>
                <View style={[styles.stockBox, s.status === 'OUT OF STOCK' ? styles.stockBoxCritical : styles.stockBoxWarn]}>
                  <SmartphoneIcon size={22} color={s.status === 'OUT OF STOCK' ? '#ef4444' : '#f59e0b'} />
                </View>
                <Text style={styles.stockName} numberOfLines={1}>{s.name}</Text>
                <View style={styles.stockRight}>
                  <Text style={[styles.stockLeft, s.status === 'OUT OF STOCK' ? styles.stockCritical : styles.stockWarn]}>
                    {s['stockQty']} left
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Bottom Nav */}
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#2D2F8E',
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
    borderWidth: 1, borderColor: '#fff',
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