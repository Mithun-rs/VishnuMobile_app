import React, { useState, useCallback, useMemo, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { CachedImage } from "../../lib/imageUtils";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import Filter from '../../assets/filter_icon.svg';
import Cart from '../../assets/cart.svg';
import Search from '../../assets/search-icon.svg';

// Module-level cache — survives tab switches, cleared after 2 minutes
let _posCache = {};
let _posCacheTime = {};
const POS_CACHE_TTL = 2 * 60 * 1000; // 2 minutes


// ── Memoised product card — only re-renders when its own props change ──────────
const ProductCard = memo(({ product, added, onAdd, onPress }) => (
  <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
    <CachedImage
      uri={product.image}
      style={styles.productImage}
      resizeMode="cover"
      thumbWidth={300}
      thumbHeight={300}
      fallback={<Text style={styles.noImageIcon}>🖼️</Text>}
    />
    <View style={styles.cardBody}>
      <Text style={styles.skuText}>{product.sku}</Text>
      <Text style={styles.skuText}>🏪 {product.shop || 'shop1'}</Text>
      <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
      <View style={styles.priceRow}>
        <View>
          <Text style={styles.retailLabel}>Price</Text>
          <Text style={styles.priceText}>
            {product.currency || '₹'}{Number(product.price).toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, added && styles.addBtnAdded]}
          onPress={onAdd}
          activeOpacity={0.8}
        >
          <Text style={styles.addBtnText}>{added ? '✓' : '+'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  </TouchableOpacity>
));

export default function PosScreen() {
  const navigation = useNavigation();
  const { profile } = useAuth();
  const [search, setSearch]                   = useState("");
  const [activeBrand, setActiveBrand]         = useState(null);
  const [showBrandFilter, setShowBrandFilter] = useState(false);
  const [cartCount, setCartCount]             = useState(0);
  const [addedIds, setAddedIds]               = useState({});
  const [allProducts, setAllProducts]         = useState([]);
  const [brands, setBrands]                   = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [selectedShop, setSelectedShop]       = useState('Shop 1');

  const isStaff = profile?.role !== 'admin' && profile?.role !== 'manager';
  const userAssignedShopId = profile?.assigned_shop || 'shop1';

  useFocusEffect(
    useCallback(() => {
      const getActiveShop = async () => {
        if (isStaff) {
          setSelectedShop(userAssignedShopId === 'shop2' ? 'Shop 2' : 'Shop 1');
          return;
        }
        try {
          const savedShop = await AsyncStorage.getItem('selectedShop');
          if (savedShop) {
            setSelectedShop(savedShop);
          }
        } catch (_) {}
      };
      getActiveShop();
      loadAll(); // Always reload on focus so newly added products appear immediately
    }, [profile])
  );

  const handleShopChange = async (shop) => {
    setSelectedShop(shop);
    try {
      await AsyncStorage.setItem('selectedShop', shop);
      loadAll(); // Trigger load when shop changes
    } catch (_) {}
  };

  // Very cheap: reads cart from AsyncStorage only
  const refreshCartCount = async () => {
    try {
      const raw  = await AsyncStorage.getItem('cart');
      const cart = raw ? JSON.parse(raw) : [];
      setCartCount(cart.reduce((s, i) => s + i.qty, 0));
    } catch (_) {}
  };

  // Full data load — runs once on first open, then served from cache
  const loadAll = async () => {
    let savedShop = null;
    if (!isStaff) {
      try {
        savedShop = await AsyncStorage.getItem('selectedShop');
      } catch (_) {}
    }
    const dbShopVal = isStaff ? userAssignedShopId : (savedShop ? savedShop.toLowerCase().replace(/\s+/g, '') : 'shop1');

    // ── Serve from cache if fresh ───────────────────────────────────
    if (_posCache[dbShopVal] && (Date.now() - _posCacheTime[dbShopVal]) < POS_CACHE_TTL) {
      setAllProducts(_posCache[dbShopVal].products);
      setBrands(_posCache[dbShopVal].brands);
      setLoading(false);
      await refreshCartCount();
      return;
    }

    setLoading(true);
    try {
      // All three requests fire in parallel — no sequential waiting
      const [prodRes, brandRes, cartRaw] = await Promise.all([
        supabase
          .from('products')
          // Only the columns POS needs — skips description, imei, metadata, etc.
          .select('id, name, sku, price, currency, "stockQty", image, brand_id, category, shop')
          .eq('available', true)
          .eq('shop', dbShopVal)
          .order('name'),
        supabase
          .from('brands')
          .select('id, name')
          .eq('shop', dbShopVal)
          .order('name'),
        AsyncStorage.getItem('cart'),
      ]);

      if (prodRes.error)  throw prodRes.error;
      if (brandRes.error) throw brandRes.error;

      const products = prodRes.data  || [];
      const brands   = brandRes.data || [];

      // Store in cache
      _posCache[dbShopVal] = { products, brands };
      _posCacheTime[dbShopVal] = Date.now();

      setAllProducts(products);
      setBrands(brands);

      const cart = cartRaw ? JSON.parse(cartRaw) : [];
      setCartCount(cart.reduce((s, i) => s + i.qty, 0));
    } catch (e) {
      console.error('POS loadAll error:', e.message);
    } finally {
      setLoading(false);
    }
  };


  const handleAddToCart = async (product) => {
    try {
      const raw  = await AsyncStorage.getItem('cart');
      const cart = raw ? JSON.parse(raw) : [];
      const idx  = cart.findIndex(i => i.id === product.id);

      const currentQty     = idx >= 0 ? cart[idx].qty : 0;
      const availableStock = product.stockQty ?? 0;

      if (currentQty >= availableStock) {
        Alert.alert('Stock Limit', `Only ${availableStock} in stock.`);
        return;
      }

      if (idx >= 0) { cart[idx].qty += 1; }
      else          { cart.push({ ...product, qty: 1 }); }

      await AsyncStorage.setItem('cart', JSON.stringify(cart));
      setCartCount(cart.reduce((s, i) => s + i.qty, 0));
      setAddedIds(prev => ({ ...prev, [product.id]: true }));
      setTimeout(() => setAddedIds(prev => ({ ...prev, [product.id]: false })), 600);
    } catch (_) {}
  };

  // Recomputes only when allProducts changes
  const stockPerBrand = useMemo(() => {
    const map = {};
    allProducts.forEach(p => {
      if (!p.brand_id) return;
      if (!map[p.brand_id]) map[p.brand_id] = { count: 0, totalStock: 0 };
      map[p.brand_id].count      += 1;
      map[p.brand_id].totalStock += (p.stockQty ?? 0);
    });
    return map;
  }, [allProducts]);

  // Recomputes only when allProducts / activeBrand / search changes
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allProducts.filter(p => {
      const matchBrand  = !activeBrand || p.brand_id === activeBrand;
      const matchSearch = !q || p.name.toLowerCase().includes(q);
      return matchBrand && matchSearch;
    });
  }, [allProducts, activeBrand, search]);

  const activeBrandName = useMemo(
    () => activeBrand ? (brands.find(b => b.id === activeBrand)?.name || '') : '',
    [brands, activeBrand]
  );

  // Rendered once above the product grid — search, filter chips, brand panel
  const ListHeader = (
    <>
      {/* SHOP TOGGLE BAR */}
      {!isStaff && (
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleBtn, selectedShop === 'Shop 1' && styles.toggleBtnActive]}
            onPress={() => handleShopChange('Shop 1')}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleBtnText, selectedShop === 'Shop 1' && styles.toggleBtnTextActive]}>Shop 1</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, selectedShop === 'Shop 2' && styles.toggleBtnActive]}
            onPress={() => handleShopChange('Shop 2')}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleBtnText, selectedShop === 'Shop 2' && styles.toggleBtnTextActive]}>Shop 2</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Search width={20} height={20} fill="#2D2F8E" stroke="#2D2F8E" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="#aaa"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, showBrandFilter && { borderColor: '#2D2F8E', backgroundColor: '#EEF0FF' }]}
          onPress={() => setShowBrandFilter(v => !v)}
        >
          <Filter
            width={20} height={20}
            fill={showBrandFilter ? '#2D2F8E' : '#1a2e6c'}
            stroke={showBrandFilter ? '#2D2F8E' : '#1a2e6c'}
          />
        </TouchableOpacity>
      </View>

      {activeBrand && (
        <View style={styles.activeFilterRow}>
          <TouchableOpacity style={styles.activeFilterChip} onPress={() => setActiveBrand(null)}>
            <Text style={styles.activeFilterTxt}>🏷️ {activeBrandName}  ✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {showBrandFilter && (
        <View style={styles.filterPanel}>
          <Text style={styles.filterSectionLabel}>FILTER BY BRAND</Text>
          <FlatList
            horizontal
            data={[{ id: null, name: 'All Brands' }, ...brands]}
            keyExtractor={b => String(b.id)}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.brandChipRow}
            renderItem={({ item: brand }) => {
              const info     = brand.id ? (stockPerBrand[brand.id] || { count: 0, totalStock: 0 }) : null;
              const isActive = activeBrand === brand.id;
              return (
                <TouchableOpacity
                  style={[styles.brandChip, isActive && styles.brandChipActive]}
                  onPress={() => { setActiveBrand(brand.id); setShowBrandFilter(false); }}
                >
                  {brand.id === null ? (
                    <View>
                      <Text style={[styles.brandChipTxt, isActive && styles.brandChipTxtActive]}>All Brands</Text>
                      <Text style={[styles.brandChipStock, isActive && styles.brandChipStockActive]}>
                        {allProducts.length} models
                      </Text>
                    </View>
                  ) : (
                    <View>
                      <Text style={[styles.brandChipTxt, isActive && styles.brandChipTxtActive]}>{brand.name}</Text>
                      <View style={styles.brandStockRow}>
                        <Text style={[styles.brandChipStock, isActive && styles.brandChipStockActive]}>
                          {info.count} model{info.count !== 1 ? 's' : ''}
                        </Text>
                        <View style={[styles.stockDot, { backgroundColor: info.totalStock > 0 ? '#22c55e' : '#ef4444' }]} />
                        <Text style={[styles.brandChipStock, isActive && styles.brandChipStockActive]}>
                          {info.totalStock} in stock
                        </Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}
    </>
  );

  return (
    <SafeAreaView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <View style={styles.headerDot} />
          <Text style={styles.headerTitleText}>POS — Quick Sale</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Cart')}>
          <Cart width={18} height={18} fill="#fff" stroke="#fff" />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#2D2F8E" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : (
        // FlatList + numColumns virtualises the grid — only visible cards are rendered
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyText}>No products found</Text>
              <Text style={styles.emptySub}>Add products from the Inventory screen</Text>
            </View>
          }
          renderItem={({ item: product }) => (
            <ProductCard
              product={product}
              added={!!addedIds[product.id]}
              onAdd={() => handleAddToCart(product)}
              onPress={() => navigation.navigate('ProductDetails', { product })}
            />
          )}
        />
      )}

      {/* CHECKOUT FOOTER */}
      {cartCount > 0 && (
        <TouchableOpacity
          style={styles.checkoutBar}
          onPress={() => navigation.navigate('Cart')}
          activeOpacity={0.9}
        >
          <View style={styles.checkoutBadge}>
            <Text style={styles.checkoutBadgeText}>{cartCount}</Text>
          </View>
          <Text style={styles.checkoutText}>View Cart & Checkout</Text>
          <Text style={styles.checkoutArrow}>→</Text>
        </TouchableOpacity>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA' },
  header: {
    backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 2,
  },
  headerTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitleText: { fontSize: 16, fontWeight: '800', color: '#2D2F8E' },
  headerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' },
  iconBtn: {
    backgroundColor: '#2D2F8E', borderRadius: 10,
    width: 36, height: 36, alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  cartBadge: {
    position: 'absolute', top: -4, right: -4, backgroundColor: '#ef4444',
    borderRadius: 10, minWidth: 18, height: 18,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3, borderWidth: 1.5, borderColor: '#fff',
  },
  cartBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#94A3B8', fontSize: 14 },

  listContent: { paddingBottom: 100 },
  columnWrapper: { paddingHorizontal: 12, gap: 12, marginTop: 12 },

  searchRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 14, gap: 10, alignItems: 'center' },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12,
    paddingHorizontal: 12, height: 44,
    borderWidth: 1, borderColor: '#e8ecf4', gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#333', padding: 0 },
  filterBtn: {
    width: 44, height: 44, backgroundColor: '#fff', borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e8ecf4',
  },
  activeFilterRow: {
    flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap',
    paddingHorizontal: 16, paddingTop: 8, gap: 8,
  },
  activeFilterChip: {
    backgroundColor: '#EEF0FF', paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1, borderColor: '#C7D2FE',
  },
  activeFilterTxt: { fontSize: 12, color: '#2D2F8E', fontWeight: '700' },
  filterPanel: {
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 10,
    borderRadius: 14, padding: 14, elevation: 3,
    borderWidth: 1, borderColor: '#EEF0FF',
  },
  filterSectionLabel: {
    fontSize: 9, color: '#94A3B8', fontWeight: '800',
    letterSpacing: 1.5, marginBottom: 8, marginTop: 4,
  },
  brandChipRow: { gap: 10, paddingBottom: 4 },
  brandChip: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14,
    backgroundColor: '#F8F9FF', borderWidth: 1, borderColor: '#E2E8F0',
  },
  brandChipActive: { backgroundColor: '#2D2F8E', borderColor: '#2D2F8E' },
  brandChipTxt: { fontSize: 13, fontWeight: '800', color: '#1E293B' },
  brandChipTxtActive: { color: '#fff' },
  brandStockRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  stockDot: { width: 6, height: 6, borderRadius: 3 },
  brandChipStock: { fontSize: 10, color: '#94A3B8', fontWeight: '600' },
  brandChipStockActive: { color: 'rgba(255,255,255,0.75)' },

  card: { flex: 1, backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', elevation: 3 },
  productImage: { width: '100%', height: 130, backgroundColor: '#1a1a2e' },
  noImage: { alignItems: 'center', justifyContent: 'center' },
  noImageIcon: { fontSize: 36 },
  cardBody: { padding: 10 },
  skuText: { fontSize: 9, color: '#aaa', marginBottom: 3 },
  productName: { fontSize: 12, fontWeight: '700', color: '#1a1a2e', marginBottom: 8, lineHeight: 17 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  retailLabel: { fontSize: 9, color: '#aaa', marginBottom: 2 },
  priceText: { fontSize: 14, fontWeight: '800', color: '#2D2F8E' },
  addBtn: { width: 30, height: 30, backgroundColor: '#2D2F8E', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  addBtnAdded: { backgroundColor: '#22c55e' },
  addBtnText: { color: '#fff', fontSize: 18, fontWeight: '700', lineHeight: 22 },

  emptyState: { flex: 1, width: '100%', alignItems: 'center', paddingVertical: 60, paddingHorizontal: 16 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '700', color: '#333' },
  emptySub: { fontSize: 13, color: '#aaa', marginTop: 4, textAlign: 'center' },

  checkoutBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#2D2F8E', flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16, gap: 12,
  },
  checkoutBadge: {
    backgroundColor: '#fff', width: 28, height: 28,
    borderRadius: 14, alignItems: 'center', justifyContent: 'center',
  },
  checkoutBadgeText: { color: '#2D2F8E', fontWeight: '900', fontSize: 13 },
  checkoutText: { flex: 1, color: '#fff', fontSize: 15, fontWeight: '800' },
  checkoutArrow: { color: '#fff', fontSize: 18, fontWeight: '700' },
  
  // Toggle Bar Styles
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#EEF0FF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#D2D6F6',
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: '#2D2F8E',
    elevation: 2,
    shadowColor: '#2D2F8E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  toggleBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  toggleBtnTextActive: {
    color: '#fff',
  },
});