import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Alert,
  Modal,
} from 'react-native';
import Share from 'react-native-share';
import * as XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import { generateAndSharePDF } from '../../utils/exportUtils';

// ─── Install dependencies ─────────────────────────────────────────────────────
// npm install react-native-svg

import Svg, {Rect, Line, Text as SvgText} from 'react-native-svg';
import NotificationIcon from '../../asset/bell.svg';
import DownloadIcon from '../../asset/upload.svg';
import RefreshIcon from '../../asset/reset.svg';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// ─── Icon Placeholder ─────────────────────────────────────────────────────────
// Replace with your actual icon library, e.g.:
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// Usage: <Icon name="bell" size={20} color="#333" />

const IconPlaceholder = ({
  name,
  size = 20,
  color = '#5C6BC0',
  bg,
}) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.28,
      backgroundColor: bg ?? color + '22',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
    <Text style={{fontSize: size * 0.48, color, fontWeight: '700'}}>
      {name.charAt(0).toUpperCase()}
    </Text>
  </View>
);

// ─── Static Data ──────────────────────────────────────────────────────────────
const BAR_DATA = {
  Daily: [
    {label: 'MON', sales: 75, profit: 45},
    {label: 'TUE', sales: 90, profit: 55},
    {label: 'WED', sales: 60, profit: 35},
    {label: 'THU', sales: 85, profit: 60},
    {label: 'FRI', sales: 95, profit: 65},
    {label: 'SAT', sales: 80, profit: 50},
  ],
  Weekly: [
    {label: 'WK1', sales: 80, profit: 50},
    {label: 'WK2', sales: 65, profit: 40},
    {label: 'WK3', sales: 90, profit: 60},
    {label: 'WK4', sales: 75, profit: 48},
  ],
  Monthly: [
    {label: 'JAN', sales: 70, profit: 42},
    {label: 'FEB', sales: 85, profit: 55},
    {label: 'MAR', sales: 95, profit: 68},
    {label: 'APR', sales: 78, profit: 50},
    {label: 'MAY', sales: 88, profit: 60},
    {label: 'JUN', sales: 92, profit: 64},
  ],
};

const STAT_DATA = {
  Daily:   {sales: '₹4,82,900', profit: '₹1,24,350', salesPct: '+12%', profitPct: '+8.4%'},
  Weekly:  {sales: '₹28,60,500', profit: '₹7,42,000', salesPct: '+9.1%', profitPct: '+6.2%'},
  Monthly: {sales: '₹1,14,80,000', profit: '₹29,60,000', salesPct: '+15%', profitPct: '+11%'},
};

const TOP_PRODUCTS = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    units: '24 Units Sold',
    price: '₹1,24,999',
    progress: 0.78,
    iconBg: '#E8F5E9',
    iconColor: '#2E7D32',
    iconName: 'Phone',
  },
  {
    id: '2',
    name: 'Samsung S24 Ultra',
    units: '18 Units Sold',
    price: '₹1,09,000',
    progress: 0.58,
    iconBg: '#E3F2FD',
    iconColor: '#1565C0',
    iconName: 'Samsung',
  },
];

const REPORT_ITEMS = [
  {id: '1', label: 'Sales Report',   iconBg: '#EDE7F6', iconColor: '#5C35C9', iconName: 'Sales'},
  {id: '2', label: 'Profit Report',  iconBg: '#E8F5E9', iconColor: '#2E7D32', iconName: 'Profit'},
  {id: '3', label: 'Product Report', iconBg: '#E3F2FD', iconColor: '#1565C0', iconName: 'Product'},
];

const NOTIFICATIONS = [
  { id: '1', title: 'Sales Report Ready', body: 'Daily sales data has been compiled.', time: 'Just now', dot: '#2D2F8E' },
  { id: '2', title: 'Profit Milestone 🎉', body: 'Profit exceeded ₹1L target this week!', time: '2h ago', dot: '#00C48C' },
  { id: '3', title: 'Low Stock Alert', body: 'iPhone 15 Pro — only 3 units remaining.', time: '5h ago', dot: '#FF6B6B' },
  { id: '4', title: 'Excel Export Done', body: 'Monthly report exported successfully.', time: 'Yesterday', dot: '#FFB800' },
];

// ─── Revenue Bar Chart ────────────────────────────────────────────────────────
const RevenueChart = ({data}) => {
  const chartW = SCREEN_WIDTH - 48;
  const chartH = 160;
  const paddingLeft = 28;
  const paddingBottom = 24;
  const barAreaH = chartH - paddingBottom;
  const barCount = data.length;
  const groupW = (chartW - paddingLeft) / barCount;
  const barW = Math.min(groupW * 0.32, 18);
  const maxVal = 100;

  return (
    <Svg width={chartW} height={chartH}>
      {/* Y-Axis Labels & Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => {
        const y = barAreaH - frac * barAreaH;
        const val = Math.round(maxVal * frac);
        return (
          <React.Fragment key={i}>
            <SvgText
              x={paddingLeft - 6}
              y={y + 3}
              fontSize={9}
              fill="#8A9BB0"
              textAnchor="end"
              fontWeight="600">
              {val}k
            </SvgText>
            {frac > 0 && (
              <Line
                x1={paddingLeft}
                y1={y}
                x2={chartW}
                y2={y}
                stroke="#E8EAF6"
                strokeWidth={1}
                strokeDasharray="4,4"
              />
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
            {/* Sales bar (back, lighter) */}
            <Rect
              x={cx - barW - 2}
              y={barAreaH - salesH}
              width={barW}
              height={salesH}
              rx={4}
              fill="#C5CAE9"
            />
            {/* Profit bar (front, solid) */}
            <Rect
              x={cx + 2}
              y={barAreaH - profitH}
              width={barW}
              height={profitH}
              rx={4}
              fill="#2D2F8E"
            />
            {/* Label */}
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
    </Svg>
  );
};

// ─── Progress Bar ─────────────────────────────────────────────────────────────
const ProgressBar = ({value, color}) => (
  <View style={styles.progressTrack}>
    <View style={[styles.progressFill, {width: `${value * 100}%`, backgroundColor: color}]} />
  </View>
);

// ─── Sub-components ───────────────────────────────────────────────────────────

const Header = ({onBellPress, unreadCount}) => (
  <View style={styles.header}>
    <View style={styles.headerTitle}>
      <View style={styles.dot} />
      <Text style={styles.headerTitleText}>Vishnu Mobile Shop</Text>
    </View>
    <TouchableOpacity style={styles.iconBtn} onPress={onBellPress}>
      <NotificationIcon width={18} height={18} stroke="#fff" />
      {unreadCount > 0 && (
        <View style={styles.bellBadge}>
          <Text style={styles.bellBadgeText}>{unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  </View>
);

const PeriodTabs = ({active, onChange}) => (
  <View style={styles.tabsRow}>
    {['Daily', 'Weekly', 'Monthly'].map(p => (
      <TouchableOpacity
        key={p}
        onPress={() => onChange(p)}
        style={[styles.tab, active === p && styles.tabActive]}
        activeOpacity={0.8}>
        <Text style={[styles.tabText, active === p && styles.tabTextActive]}>{p}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

const StatCard = ({
  label,
  value,
  pct,
  iconName,
  iconBg,
  iconColor,
  positive,
}) => (
  <View style={styles.statCard}>
    <View style={styles.statCardTop}>
      {/* Replace with actual icon */}
      <View style={[styles.statIcon, {backgroundColor: iconBg}]}>
        <IconPlaceholder name={iconName} size={20} color={iconColor} bg="transparent" />
      </View>
      <View style={[styles.statBadge, {backgroundColor: positive ? '#E8F5E9' : '#FFEBEE'}]}>
        {/* Replace with: <Icon name={positive ? "trending-up" : "trending-down"} size={10} /> */}
        <Text style={[styles.statBadgeText, {color: positive ? '#2E7D32' : '#C62828'}]}>
          {pct}
        </Text>
      </View>
    </View>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const ProductRow = ({product}) => (
  <View style={styles.productRow}>
    <View style={[styles.productIcon, {backgroundColor: product.iconBg}]}>
      {/* Replace with actual product image or icon */}
      <IconPlaceholder name={product.iconName} size={28} color={product.iconColor} bg="transparent" />
    </View>
    <View style={styles.productInfo}>
      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.productUnits}>{product.units}</Text>
      <ProgressBar value={product.progress} color={product.iconColor} />
    </View>
    <Text style={styles.productPrice}>{product.price}</Text>
  </View>
);

const ReportRow = ({item, onDownload, onRefresh}) => (
  <View style={styles.reportRow}>
    <View style={[styles.reportIcon, {backgroundColor: item.iconBg}]}>
      <IconPlaceholder name={item.iconName} size={20} color={item.iconColor} bg="transparent" />
    </View>
    <Text style={styles.reportLabel}>{item.label}</Text>
    <View style={styles.reportActions}>
      <TouchableOpacity style={styles.reportActionBtn} onPress={onRefresh}>
        <RefreshIcon width={16} height={16} stroke="#5C6BC0" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.reportActionBtn} onPress={onDownload}>
        <DownloadIcon width={16} height={16} stroke="#5C6BC0" />
      </TouchableOpacity>
    </View>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
const ReportsDashboardScreen = () => {
  const [period, setPeriod] = useState('Daily');
  const [notifVisible, setNotifVisible] = useState(false);
  const [unreadCount] = useState(NOTIFICATIONS.length);
  const stats = STAT_DATA[period];
  const bars = BAR_DATA[period];

  // ── Per-report PDF generators ────────────────────────────────────────────
  const buildSalesHTML = () => `
    <html><head><style>
      body{font-family:Helvetica,sans-serif;padding:20px;color:#1A1A2E;}
      h1{color:#5C35C9;text-align:center;border-bottom:2px solid #EDE7F6;padding-bottom:12px;}
      h3{color:#8A9BB0;text-align:center;} .box{background:#F8F5FF;padding:14px;border-radius:8px;margin-bottom:10px;}
    </style></head><body>
      <h1>Sales Report</h1>
      <h3>Period: ${period}</h3>
      <div class="box"><b>Total Sales:</b> ${stats.sales} &nbsp; <span style="color:#5C35C9">(${stats.salesPct})</span></div>
      ${bars.map(d => `<div class="box">${d.label} &nbsp;—&nbsp; Sales: ${d.sales}k</div>`).join('')}
    </body></html>`;

  const buildProfitHTML = () => `
    <html><head><style>
      body{font-family:Helvetica,sans-serif;padding:20px;color:#1A1A2E;}
      h1{color:#2E7D32;text-align:center;border-bottom:2px solid #E8F5E9;padding-bottom:12px;}
      h3{color:#8A9BB0;text-align:center;} .box{background:#F1FFF5;padding:14px;border-radius:8px;margin-bottom:10px;}
    </style></head><body>
      <h1>Profit Report</h1>
      <h3>Period: ${period}</h3>
      <div class="box"><b>Total Profit:</b> ${stats.profit} &nbsp; <span style="color:#2E7D32">(${stats.profitPct})</span></div>
      ${bars.map(d => `<div class="box">${d.label} &nbsp;—&nbsp; Profit: ${d.profit}k</div>`).join('')}
    </body></html>`;

  const buildProductHTML = () => `
    <html><head><style>
      body{font-family:Helvetica,sans-serif;padding:20px;color:#1A1A2E;}
      h1{color:#1565C0;text-align:center;border-bottom:2px solid #E3F2FD;padding-bottom:12px;}
      h3{color:#8A9BB0;text-align:center;} table{width:100%;border-collapse:collapse;margin-top:20px;}
      th,td{border:1px solid #E2E8F0;padding:10px;text-align:left;} th{background:#EBF4FF;}
    </style></head><body>
      <h1>Product Report</h1>
      <h3>Top Selling Products</h3>
      <table>
        <tr><th>Product</th><th>Units Sold</th><th>Price</th></tr>
        ${TOP_PRODUCTS.map(p => `<tr><td>${p.name}</td><td>${p.units}</td><td>${p.price}</td></tr>`).join('')}
      </table>
    </body></html>`;

  const reportDownloaders = {
    '1': () => generateAndSharePDF(buildSalesHTML(), `Sales_Report_${period}`),
    '2': () => generateAndSharePDF(buildProfitHTML(), `Profit_Report_${period}`),
    '3': () => generateAndSharePDF(buildProductHTML(), 'Product_Report'),
  };

  const handleGeneratePDF = async () => {
    const htmlReport = `
      <html>
        <head>
          <style>
             body { font-family: Helvetica, sans-serif; padding: 20px; color: #1A1A2E; }
             h1 { color: #3D5AFE; text-align: center; border-bottom: 2px solid #E8EAF6; padding-bottom: 15px;}
             h3 { color: #8A9BB0; text-align: center; }
             .metric { background-color: #F8F9FB; padding: 15px; margin-bottom: 10px; border-radius: 8px;}
          </style>
        </head>
        <body>
          <h1>Vishnu Mobile Shop</h1>
          <h3>Performance Report (${period})</h3>
          <div class="metric">
            <h2>Total Sales: ${stats.sales} <span style="color:#2E7D32; font-size: 16px;">(${stats.salesPct})</span></h2>
          </div>
          <div class="metric">
            <h2>Total Profit: ${stats.profit} <span style="color:#2E7D32; font-size: 16px;">(${stats.profitPct})</span></h2>
          </div>
          <p style="text-align: center; margin-top: 50px; font-size: 10px; color: #BBB;">Automatically generated by Vishnu Mobiles Analytics System</p>
        </body>
      </html>
    `;
    await generateAndSharePDF(htmlReport, `VishnuMobiles_Dashboard_${period}`);
  };
  const handleGenerateExcel = async () => {
    try {
      const wb = XLSX.utils.book_new();

      const summaryData = [
        { Metric: "Total Sales", Value: stats.sales, Growth: stats.salesPct },
        { Metric: "Total Profit", Value: stats.profit, Growth: stats.profitPct },
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryData), "Summary");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(bars), "Trend");
      
      const productsData = TOP_PRODUCTS.map(p => ({
        Product: p.name,
        Units: p.units,
        Price: p.price
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(productsData), "Top Products");

      const wbout = XLSX.write(wb, { type: 'base64', bookType: "xlsx" });

      const filePath = `${RNFS.CachesDirectoryPath}/VishnuMobiles_Report_${period}.xlsx`;
      await RNFS.writeFile(filePath, wbout, 'base64');

      await Share.open({
        url: `file://${filePath}`,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        title: 'Download Excel Report',
        failOnCancel: false,
      });
    } catch (error) {
       if (error && String(error).includes('User did not share')) return;
       Alert.alert('Export Error', 'Failed to generate Excel file: ' + String(error));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F6FA" />

      {/* ── Notification Panel Modal ── */}
      <Modal visible={notifVisible} transparent animationType="fade" onRequestClose={() => setNotifVisible(false)}>
        <TouchableOpacity style={styles.notifOverlay} activeOpacity={1} onPress={() => setNotifVisible(false)}>
          <View style={styles.notifPanel}>
            <View style={styles.notifPanelHeader}>
              <Text style={styles.notifPanelTitle}>Notifications</Text>
              <TouchableOpacity onPress={() => setNotifVisible(false)}>
                <Text style={styles.notifPanelClose}>✕</Text>
              </TouchableOpacity>
            </View>
            {NOTIFICATIONS.map((n, i) => (
              <View key={n.id} style={[styles.notifItem, i < NOTIFICATIONS.length - 1 && styles.notifItemBorder]}>
                <View style={[styles.notifDot, {backgroundColor: n.dot}]} />
                <View style={styles.notifText}>
                  <Text style={styles.notifTitle}>{n.title}</Text>
                  <Text style={styles.notifBody}>{n.body}</Text>
                </View>
                <Text style={styles.notifTime}>{n.time}</Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <Header onBellPress={() => setNotifVisible(true)} unreadCount={unreadCount} />

        {/* ── Page Title ── */}
        <View style={styles.pageTitleBlock}>
          <Text style={styles.pageTitle}>Reports Dashboard</Text>
          <Text style={styles.pageSubtitle}>Vishnu Mobile Shop Performance Overview</Text>
        </View>

        {/* ── Period Tabs ── */}
        <PeriodTabs active={period} onChange={setPeriod} />

        {/* ── Stat Cards ── */}
        <View style={styles.statsRow}>
          <StatCard
            label="TOTAL SALES"
            value={stats.sales}
            pct={stats.salesPct}
            iconName="Sales"
            iconBg="#EDE7F6"
            iconColor="#5C35C9"
            positive
          />
          <StatCard
            label="TOTAL PROFIT"
            value={stats.profit}
            pct={stats.profitPct}
            iconName="Profit"
            iconBg="#E8F5E9"
            iconColor="#2E7D32"
            positive
          />
        </View>

        {/* ── Revenue Trend Chart ── */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>Revenue Trend</Text>
              <Text style={styles.chartSubtitle}>Bi-weekly performance{'\n'}tracking</Text>
            </View>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, {backgroundColor: '#C5CAE9'}]} />
                <Text style={styles.legendText}>SALES</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, {backgroundColor: '#2D2F8E'}]} />
                <Text style={styles.legendText}>PROFIT</Text>
              </View>
            </View>
          </View>
          <RevenueChart data={bars} />
        </View>

        {/* ── Top Selling Products ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Selling Products</Text>
          <View style={styles.sectionCard}>
            {TOP_PRODUCTS.map((p, i) => (
              <React.Fragment key={p.id}>
                <ProductRow product={p} />
                {i < TOP_PRODUCTS.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* ── Detailed Reports ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detailed Reports</Text>
          <View style={styles.sectionCard}>
            {REPORT_ITEMS.map((item, i) => (
              <React.Fragment key={item.id}>
                <ReportRow
                  item={item}
                  onDownload={reportDownloaders[item.id]}
                  onRefresh={() => Alert.alert('Refreshing', `${item.label} data is being refreshed...`)}
                />
                {i < REPORT_ITEMS.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* ── Bottom spacer for FAB ── */}
        <View style={{height: 90}} />
      </ScrollView>

      {/* ── Fixed Bottom Buttons ── */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.bottomBtn, styles.bottomBtnPDF]}
          onPress={handleGeneratePDF}
          activeOpacity={0.85}>
          {/* Replace with: <Icon name="file-pdf-box" size={18} color="#fff" /> */}
          <IconPlaceholder name="PDF" size={18} color="#fff" bg="rgba(255,255,255,0.25)" />
          <Text style={styles.bottomBtnText}>GENERATE PDF</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bottomBtn, styles.bottomBtnExcel]}
          onPress={handleGenerateExcel}
          activeOpacity={0.85}>
          {/* Replace with: <Icon name="microsoft-excel" size={18} color="#fff" /> */}
          <IconPlaceholder name="Excel" size={18} color="#fff" bg="rgba(255,255,255,0.25)" />
          <Text style={styles.bottomBtnText}>GENERATE EXCEL</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },

  // Header — unified style
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
  headerTitleText: { fontSize: 16, fontWeight: '800', color: '#2D2F8E' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' },
  iconBtn: {
    backgroundColor: '#2D2F8E', borderRadius: 10,
    width: 36, height: 36, alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  bellBadge: {
    position: 'absolute', top: -3, right: -3,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: '#ef4444',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#F5F6FA',
  },
  bellBadgeText: { color: '#FFF', fontSize: 8, fontWeight: '800' },

  // Notification panel
  notifOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  notifPanel: {
    position: 'absolute',
    top: 60,
    right: 12,
    left: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  notifPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  notifPanelTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  notifPanelClose: {
    fontSize: 14,
    color: '#8A9BB0',
    fontWeight: '600',
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  notifItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  notifDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  notifText: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 2,
  },
  notifBody: {
    fontSize: 12,
    color: '#8A9BB0',
    lineHeight: 16,
  },
  notifTime: {
    fontSize: 10,
    color: '#B0BAC9',
    fontWeight: '500',
    marginTop: 2,
  },

  // Page title
  pageTitleBlock: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 16,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1A2E',
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 12,
    color: '#8A9BB0',
    marginTop: 3,
  },

  // Period tabs
  tabsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#EDEEF5',
    borderRadius: 10,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#2D2F8E',
    shadowColor: '#2D2F8E',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8A9BB0',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },

  // Stat cards
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#2D2F8E',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  statCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8A9BB0',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A2E',
    letterSpacing: -0.3,
  },

  // Chart card
  chartCard: {
    marginHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  chartSubtitle: {
    fontSize: 11,
    color: '#8A9BB0',
    marginTop: 2,
    lineHeight: 16,
  },
  chartLegend: {
    gap: 6,
    alignItems: 'flex-end',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8A9BB0',
    letterSpacing: 0.5,
  },

  // Section
  section: {
    marginHorizontal: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F2F5',
    marginHorizontal: 16,
  },

  // Product rows
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  productIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    flex: 1,
    gap: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  productUnits: {
    fontSize: 11,
    color: '#8A9BB0',
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#EDEEF5',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A1A2E',
  },

  // Report rows
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  reportIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  reportActions: {
    flexDirection: 'row',
    gap: 8,
  },
  reportActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EDE7F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingBottom: 20,
    gap: 10,
    backgroundColor: '#F5F6FA',
    borderTopWidth: 1,
    borderTopColor: '#EDEEF5',
  },
  bottomBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  bottomBtnPDF: {
    backgroundColor: '#2D2F8E',
    shadowColor: '#2D2F8E',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  bottomBtnExcel: {
    backgroundColor: '#217346',
    shadowColor: '#217346',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  bottomBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});

export default ReportsDashboardScreen;