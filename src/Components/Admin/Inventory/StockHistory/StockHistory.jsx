import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ActivityIndicator, FlatList, Modal, Animated, Dimensions, LayoutAnimation, Platform, UIManager,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../../../lib/supabase';
import Svg2, { Path } from 'react-native-svg';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const BackIcon = () => (
  <Svg2 width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M12 5l-7 7 7 7" stroke="#2D2F8E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg2>
);

const BoxIcon = () => (
  <Svg2 width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M20 7H4a1 1 0 00-1 1v11a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg2>
);

const CloseIcon = () => (
  <Svg2 width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6l12 12" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg2>
);

const ChevronIcon = ({ expanded }) => (
  <Svg2 width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d={expanded ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"}
      stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    />
  </Svg2>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Supabase stores UTC. IST = UTC + 5h30m
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

const toISTDateKey = (iso) => {
  const istDate = new Date(new Date(iso).getTime() + IST_OFFSET_MS);
  const yyyy = istDate.getUTCFullYear();
  const mm   = String(istDate.getUTCMonth() + 1).padStart(2, '0');
  const dd   = String(istDate.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const formatDateLabel = (iso) => {
  if (!iso) return '—';
  const d = new Date(new Date(iso).getTime() + IST_OFFSET_MS);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatTime = (iso) => {
  if (!iso) return '';
  const d = new Date(new Date(iso).getTime() + IST_OFFSET_MS);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

const isToday = (iso) => {
  if (!iso) return false;
  return toISTDateKey(iso) === toISTDateKey(new Date().toISOString());
};

// Groups stock_history rows by product_id.
// qtyMap: { [product_id]: currentStockQty } fetched from products table
const groupByProduct = (items, qtyMap = {}) => {
  const map = {};
  items.forEach(item => {
    const key = item.product_id || item.product_name || 'unknown';
    if (!map[key]) {
      map[key] = {
        name:      item.product_name || '—',
        productId: item.product_id,
        entries:   [],
        firstAdded: item.created_at,
      };
    }
    map[key].entries.push({
      qty:        Number(item.qty_change) || 0,
      created_at: item.created_at,
    });
    if (item.created_at < map[key].firstAdded) map[key].firstAdded = item.created_at;
  });

  Object.values(map).forEach(p => {
    p.entries.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    // currentQty = real stockQty from products table (accurate after sales)
    p.currentQty = qtyMap.hasOwnProperty(p.productId)
      ? qtyMap[p.productId]
      : p.entries.reduce((s, e) => s + e.qty, 0); // fallback: sum of additions
  });

  return Object.values(map).sort((a, b) =>
    new Date(b.entries[0].created_at) - new Date(a.entries[0].created_at)
  );
};

// ─── Sold Modal ───────────────────────────────────────────────────────────────

function SoldModal({ visible, onClose, brandId, brandName }) {
  const [soldData, setSoldData] = useState([]);
  const [loading, setLoading]   = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  React.useEffect(() => {
    if (visible) {
      fetchSold();
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start();
    } else {
      Animated.timing(slideAnim, { toValue: SCREEN_HEIGHT, duration: 260, useNativeDriver: true }).start();
    }
  }, [visible]);

  const fetchSold = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sold_products')
        .select('id, name, sku, price, market_price, category, color, customer_name, phone, payment_method, sold_at, sold_by_name, brand_id, orders(total_items)')
        .eq('brand_id', brandId)
        .order('sold_at', { ascending: false });
      if (error) throw error;
      setSoldData(data || []);
    } catch (e) {
      console.error('Sold fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const totalQty     = soldData.reduce((s, i) => s + (Number(i.orders?.total_items) || 0), 0);
  const totalRevenue = soldData.reduce((s, i) => s + (Number(i.price) || 0), 0);
  const todayQty     = soldData.filter(i => isToday(i.sold_at))
                               .reduce((s, i) => s + (Number(i.orders?.total_items) || 0), 0);

  const renderSoldRow = ({ item, index }) => {
    const price     = Number(item.price) || 0;
    const qty       = Number(item.orders?.total_items) || 0;
    const todayFlag = isToday(item.sold_at);
    return (
      <View style={[m.row, index % 2 === 0 && m.rowAlt]}>
        <View style={m.rowLeft}>
          <Text style={m.rowName} numberOfLines={1}>{item.name || '—'}</Text>
          {item.category ? <Text style={m.rowCat}>🏷 {item.category}</Text> : null}
          {item.customer_name ? (
            <Text style={m.rowCust}>👤 {item.customer_name}{item.phone ? `  ·  ${item.phone}` : ''}</Text>
          ) : null}
          <Text style={m.rowSub}>
            {formatDateLabel(item.sold_at)}{'  ·  '}{formatTime(item.sold_at)}
            {item.sold_by_name ? `  ·  ${item.sold_by_name}` : ''}
          </Text>
        </View>
        <View style={m.rowRight}>
          {todayFlag && <View style={m.todayBadge}><Text style={m.todayTxt}>Today</Text></View>}
          {item.payment_method ? (
            <View style={m.payBadge}><Text style={m.payTxt}>{item.payment_method.toUpperCase()}</Text></View>
          ) : null}
          <View style={m.qtyBadge}><Text style={m.qtyTxt}>×{qty} qty</Text></View>
          <Text style={m.priceTxt}>₹{price.toLocaleString('en-IN')}</Text>
        </View>
      </View>
    );
  };

  const emptySold = () => (
    <View style={m.emptyBox}>
      <Text style={m.emptyIcon}>🛒</Text>
      <Text style={m.emptyTitle}>No sales yet</Text>
      <Text style={m.emptySub}>Sold products for this brand will appear here</Text>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={m.backdrop} activeOpacity={1} onPress={onClose} />
      <Animated.View style={[m.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <View style={m.handle} />
        <View style={m.sheetHeader}>
          <View>
            <Text style={m.sheetTitle}>Sold Products</Text>
            <Text style={m.sheetSub}>{brandName}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={m.closeBtn}><CloseIcon /></TouchableOpacity>
        </View>
        {loading ? (
          <View style={m.center}>
            <ActivityIndicator size="large" color="#EF4444" />
            <Text style={m.loadTxt}>Loading sales...</Text>
          </View>
        ) : (
          <>
            <View style={m.miniSummary}>
              <View style={m.miniCard}>
                <Text style={[m.miniVal, { color: '#EF4444' }]}>{soldData.length}</Text>
                <Text style={m.miniLbl}>Total Sales</Text>
              </View>
              <View style={m.miniCard}>
                <Text style={[m.miniVal, { color: '#F59E0B' }]}>{totalQty}</Text>
                <Text style={m.miniLbl}>Units Sold</Text>
              </View>
              <View style={m.miniCard}>
                <Text style={[m.miniVal, { color: '#10B981' }]}>₹{totalRevenue.toLocaleString('en-IN')}</Text>
                <Text style={m.miniLbl}>Revenue</Text>
              </View>
              <View style={m.miniCard}>
                <Text style={[m.miniVal, { color: '#2D2F8E' }]}>{todayQty}</Text>
                <Text style={m.miniLbl}>Today</Text>
              </View>
            </View>
            <FlatList
              data={soldData}
              keyExtractor={item => String(item.id)}
              renderItem={renderSoldRow}
              ListEmptyComponent={emptySold}
              contentContainerStyle={m.listContent}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}
      </Animated.View>
    </Modal>
  );
}

// ─── Product Card with expandable timeline ────────────────────────────────────

function ProductHistoryCard({ product }) {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(v => !v);
  };

  const lastUpdated = product.entries[0]?.created_at;
  const isUpdatedToday = isToday(lastUpdated);

  return (
    <View style={s.productCard}>
      <TouchableOpacity style={s.productHeader} onPress={toggle} activeOpacity={0.75}>
        <View style={s.productLeft}>
          <View style={s.productNameRow}>
            <Text style={s.productName} numberOfLines={1}>{product.name}</Text>
          </View>
          <Text style={s.productMeta}>
            {product.entries.length} update{product.entries.length !== 1 ? 's' : ''}
            {'  ·  '}Last: {formatDateLabel(lastUpdated)}
          </Text>
        </View>
        <View style={s.productRight}>
          <Text style={s.totalQty}>{product.currentQty}</Text>
          <Text style={s.totalQtyLbl}>in stock</Text>
          <ChevronIcon expanded={expanded} />
        </View>
      </TouchableOpacity>

      {/* Expandable timeline */}
      {expanded && (
        <View style={s.timeline}>
          {product.entries.map((entry, idx) => {
            const isLast   = idx === product.entries.length - 1;
            const todayEntry = isToday(entry.created_at);
            return (
              <View key={idx} style={s.timelineRow}>
                <View style={s.track}>
                  <View style={s.dot} />
                  {!isLast && <View style={s.line} />}
                </View>
                <View style={s.entryCard}>
                  <View style={s.entryRow}>
                    <View>
                      <Text style={s.entryDate}>{formatDateLabel(entry.created_at)}</Text>
                      <Text style={s.entryTime}>{formatTime(entry.created_at)}</Text>
                    </View>
                    <View style={s.entryQtyBadge}>
                      <Text style={s.entryQtyTxt}>
                        +{entry.qty} qty
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function BrandHistoryScreen() {
  const navigation = useNavigation();
  const route      = useRoute();
  const { brandId, brandName, categoryName, categoryIcon } = route.params || {};

  const [products, setProducts]          = useState([]);
  const [loading, setLoading]            = useState(true);
  const [soldModalVisible, setSoldModal] = useState(false);

  useFocusEffect(useCallback(() => { loadAll(); }, [brandId]));

  const loadAll = async () => {
    setLoading(true);
    try {
      // Fetch stock_history + current stockQty from products in parallel
      const [histRes, prodRes] = await Promise.all([
        supabase
          .from('stock_history')
          .select('id, product_id, product_name, qty_change, stock_after, event_type, created_at')
          .eq('brand_id', brandId)
          .order('created_at', { ascending: false }),
        supabase
          .from('products')
          .select('id, stockQty')
          .eq('brand_id', brandId),
      ]);
      if (histRes.error) throw histRes.error;

      // Build product_id -> current stockQty map
      const qtyMap = {};
      (prodRes.data || []).forEach(p => { qtyMap[p.id] = Number(p.stockQty) || 0; });

      setProducts(groupByProduct(histRes.data || [], qtyMap));
    } catch (e) {
      console.error('History load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const totalQtyAdded  = products.reduce((s, p) => s + p.totalQty, 0);
  const totalEntries   = products.reduce((s, p) => s + p.entries.length, 0);

  const emptyStock = () => (
    <View style={s.emptyBox}>
      <Text style={s.emptyIcon}>📦</Text>
      <Text style={s.emptyTitle}>No stock data</Text>
      <Text style={s.emptySub}>Each time you add or update qty, it will appear here</Text>
    </View>
  );

  return (
    <SafeAreaView style={s.container}>

      {/* HEADER */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <BackIcon />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>{brandName}</Text>
          <Text style={s.headerSub}>{categoryIcon} {categoryName} · History</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color="#2D2F8E" />
          <Text style={s.loadTxt}>Loading history...</Text>
        </View>
      ) : (
        <>
          {/* SUMMARY CARDS */}
          <View style={s.summaryRow}>
            <TouchableOpacity
              style={[s.summaryCard, { borderLeftColor: '#EF4444' }]}
              onPress={() => setSoldModal(true)}
              activeOpacity={0.75}
            >
              <Text style={[s.summaryVal, { color: '#EF4444' }]}>Sold</Text>
              <Text style={s.summaryLbl}>Tap to View</Text>
              <View style={s.soldArrow}><Text style={s.soldArrowTxt}>›</Text></View>
            </TouchableOpacity>

            <View style={[s.summaryCard, { borderLeftColor: '#2D2F8E' }]}>
              <Text style={[s.summaryVal, { color: '#2D2F8E' }]}>{products.length}</Text>
              <Text style={s.summaryLbl}>Products</Text>
            </View>

            <View style={[s.summaryCard, { borderLeftColor: '#10B981' }]}>
              <Text style={[s.summaryVal, { color: '#10B981' }]}>{totalQtyAdded}</Text>
              <Text style={s.summaryLbl}>Total Qty</Text>
            </View>
          </View>

          {/* LIST HEADER */}
          <View style={s.listHeader}>
            <BoxIcon />
            <Text style={s.listHeaderTxt}>Qty History · {products.length} products · {totalEntries} updates</Text>
          </View>

          {/* PRODUCT CARDS */}
          <FlatList
            data={products}
            keyExtractor={item => item.name}
            renderItem={({ item }) => <ProductHistoryCard product={item} />}
            ListEmptyComponent={emptyStock}
            contentContainerStyle={s.listContent}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}

      {/* SOLD MODAL */}
      <SoldModal
        visible={soldModalVisible}
        onClose={() => setSoldModal(false)}
        brandId={brandId}
        brandName={brandName}
      />

    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA' },

  header: {
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomWidth: 1, borderBottomColor: '#eee', elevation: 2,
  },
  backBtn:      { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle:  { fontSize: 17, fontWeight: '800', color: '#1E293B' },
  headerSub:    { fontSize: 11, color: '#94A3B8', marginTop: 1 },

  summaryRow: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 14, paddingVertical: 14,
    backgroundColor: '#F0F2FF',
    borderBottomWidth: 1, borderBottomColor: '#DDE0FF',
  },
  summaryCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12,
    paddingVertical: 10, paddingHorizontal: 10,
    borderLeftWidth: 4, elevation: 2,
  },
  summaryVal:   { fontSize: 22, fontWeight: '900' },
  summaryLbl:   { fontSize: 10, color: '#64748B', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.6 },
  soldArrow:    { position: 'absolute', right: 6, top: 6 },
  soldArrowTxt: { fontSize: 18, color: '#EF4444', fontWeight: '900' },

  listHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#EEF0FF',
  },
  listHeaderTxt: { fontSize: 13, fontWeight: '800', color: '#1E293B' },

  listContent: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 40 },

  // ── Product Card ─────────────────────────────────────────────────────────
  productCard: {
    backgroundColor: '#fff', borderRadius: 14, marginBottom: 10,
    elevation: 1, overflow: 'hidden',
  },
  productHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 12,
  },
  productLeft:   { flex: 1, marginRight: 10 },
  productNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  productName:   { fontSize: 14, fontWeight: '900', color: '#1E293B' },
  productMeta:   { fontSize: 11, color: '#94A3B8', marginTop: 3 },
  productRight:  { alignItems: 'center' },
  totalQty:      { fontSize: 20, fontWeight: '900', color: '#10B981' },
  totalQtyLbl:   { fontSize: 9, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 },

  todayBadge: {
    backgroundColor: '#FEF3C7', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20,
  },
  todayTxt: { fontSize: 9, fontWeight: '800', color: '#92400E', letterSpacing: 0.5 },

  // ── Timeline inside card ──────────────────────────────────────────────────
  timeline: {
    paddingHorizontal: 14, paddingBottom: 12,
    borderTopWidth: 1, borderTopColor: '#F1F5F9',
    backgroundColor: '#FAFBFF',
  },
  timelineRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 10 },
  track:       { width: 20, alignItems: 'center', paddingTop: 4 },
  dot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#CBD5E1', borderWidth: 2, borderColor: '#E2E8F0',
  },
  dotToday: { backgroundColor: '#2D2F8E', borderColor: '#C7CAFF' },
  line:     { width: 2, flex: 1, minHeight: 20, backgroundColor: '#E2E8F0', marginTop: 2 },

  entryCard: { flex: 1, marginLeft: 10 },
  entryRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  entryDate: { fontSize: 12, fontWeight: '700', color: '#334155' },
  entryTime: { fontSize: 10, color: '#94A3B8', marginTop: 1 },

  entryQtyBadge: {
    backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  entryQtyBadgeToday: { backgroundColor: '#EEF2FF' },
  entryQtyTxt:        { fontSize: 12, fontWeight: '800', color: '#10B981' },
  entryQtyTxtToday:   { color: '#2D2F8E' },

  emptyBox:   { alignItems: 'center', paddingTop: 60 },
  emptyIcon:  { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 6 },
  emptySub:   { fontSize: 12, color: '#94A3B8', textAlign: 'center', paddingHorizontal: 30 },

  center:  { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadTxt: { color: '#94A3B8', fontSize: 14 },
});

// ─── Modal Styles ─────────────────────────────────────────────────────────────

const m = StyleSheet.create({
  backdrop: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: SCREEN_HEIGHT * 0.80,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1',
    alignSelf: 'center', marginTop: 10, marginBottom: 2,
  },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  sheetTitle: { fontSize: 17, fontWeight: '900', color: '#1E293B' },
  sheetSub:   { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center',
  },
  miniSummary: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 14, paddingVertical: 12,
    backgroundColor: '#FFF5F5', borderBottomWidth: 1, borderBottomColor: '#FFE4E4',
  },
  miniCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 10,
    paddingVertical: 8, paddingHorizontal: 6,
    alignItems: 'center', elevation: 1,
  },
  miniVal: { fontSize: 15, fontWeight: '900' },
  miniLbl: { fontSize: 9, color: '#64748B', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.4 },
  listContent: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 40 },
  row: {
    backgroundColor: '#fff', borderRadius: 12, marginBottom: 8,
    paddingHorizontal: 14, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    elevation: 1,
  },
  rowAlt:   { backgroundColor: '#FFF8F8' },
  rowLeft:  { flex: 1, marginRight: 10 },
  rowRight: { alignItems: 'flex-end', gap: 4 },
  rowName:  { fontSize: 13, fontWeight: '800', color: '#1E293B' },
  rowCat:   { fontSize: 10, color: '#94A3B8', marginTop: 1 },
  rowCust:  { fontSize: 10, color: '#6366F1', marginTop: 1 },
  rowSub:   { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  payBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
  payTxt:   { fontSize: 9, fontWeight: '800', color: '#3B82F6', letterSpacing: 0.5 },
  todayBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
  todayTxt:   { fontSize: 9, fontWeight: '800', color: '#92400E', letterSpacing: 0.5 },
  qtyBadge: { backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  qtyTxt:   { fontSize: 12, fontWeight: '800', color: '#EF4444' },
  priceTxt: { fontSize: 12, fontWeight: '900', color: '#10B981' },
  emptyBox:   { alignItems: 'center', paddingTop: 60 },
  emptyIcon:  { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 6 },
  emptySub:   { fontSize: 12, color: '#94A3B8', textAlign: 'center', paddingHorizontal: 30 },
  center:  { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadTxt: { color: '#94A3B8', fontSize: 14 },
});