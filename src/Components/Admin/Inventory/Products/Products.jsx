import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../../../../lib/supabase";
import Filter from '../../../../assets/filter_icon.svg';
import Cart from '../../../../assets/cart.svg';
import BackArrow from '../../../../assets/back-arrow.svg';
import Search from '../../../../assets/search-icon.svg';

// Derive status color from status string
const statusColor = (status) => {
  if (status === 'IN STOCK')     return '#3d5af1';
  if (status === 'LOW STOCK')    return '#ef4444';
  return '#999';
};

export default function ProductsScreen() {
  const navigation = useNavigation();
  const [search, setSearch]               = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [cartCount, setCartCount]         = useState(0);
  const [addedIds, setAddedIds]           = useState({});
  const [allProducts, setAllProducts]     = useState([]);
  const [categories, setCategories]       = useState(["All"]);
  const [loading, setLoading]             = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [])
  );

  const loadAll = async () => {
    setLoading(true);
    try {
      // ── Fetch products from Supabase ─────────────────────────────
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllProducts(products || []);

      // ── Build category list from products ─────────────────────────
      const cats = ['All', ...new Set((products || []).map(p => p.category).filter(Boolean))];
      setCategories(cats);

      // ── Cart count from AsyncStorage ──────────────────────────────
      const cartData = await AsyncStorage.getItem('cart');
      const cart = cartData ? JSON.parse(cartData) : [];
      setCartCount(cart.reduce((sum, item) => sum + item.qty, 0));

    } catch (e) {
      console.error('loadAll error:', e.message);
      Alert.alert('Error', 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      const data = await AsyncStorage.getItem('cart');
      const cart = data ? JSON.parse(data) : [];
      const existing = cart.findIndex((i) => i.id === product.id);
      if (existing >= 0) { cart[existing].qty += 1; }
      else { cart.push({ ...product, qty: 1 }); }
      await AsyncStorage.setItem('cart', JSON.stringify(cart));
      setCartCount(cart.reduce((sum, item) => sum + item.qty, 0));
      setAddedIds((prev) => ({ ...prev, [product.id]: true }));
      setTimeout(() => setAddedIds((prev) => ({ ...prev, [product.id]: false })), 600);
    } catch (e) {}
  };

  const handleDelete = (product) => {
    Alert.alert(
      'Delete Product',
      `Delete "${product.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', product.id);

              if (error) throw error;
              setAllProducts(prev => prev.filter(p => p.id !== product.id));

              // Also remove from cart
              const cartData = await AsyncStorage.getItem('cart');
              const cart = cartData ? JSON.parse(cartData) : [];
              const updatedCart = cart.filter(i => i.id !== product.id);
              await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
              setCartCount(updatedCart.reduce((sum, i) => sum + i.qty, 0));
            } catch (e) {
              Alert.alert('Error', 'Failed to delete product.');
            }
          },
        },
      ]
    );
  };

  const filtered = allProducts.filter((p) => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <SafeAreaView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <BackArrow width={20} height={20} fill="#2D2F8E" stroke="#2D2F8E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vishnu Shop</Text>
        </View>
        <TouchableOpacity style={styles.cartBtn} onPress={() => navigation.navigate('Cart')}>
          <Cart width={24} height={24} fill="#1a2e6c" stroke="#1a2e6c" />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2D2F8E" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* SEARCH + FILTER */}
          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Search width={20} height={20} fill="#2D2F8E" stroke="#2D2F8E" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search models..."
                placeholderTextColor="#aaa"
                value={search}
                onChangeText={setSearch}
              />
            </View>
            <TouchableOpacity style={styles.filterBtn}>
              <Filter width={20} height={20} fill="#1a2e6c" stroke="#1a2e6c" />
            </TouchableOpacity>
          </View>

          {/* CATEGORY TABS */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.catChip, activeCategory === cat && styles.catChipActive]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={[styles.catChipText, activeCategory === cat && styles.catChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* PRODUCT GRID */}
          <View style={styles.grid}>
            {filtered.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📦</Text>
                <Text style={styles.emptyText}>No products found</Text>
                <Text style={styles.emptySub}>Add products using the Add Product screen</Text>
              </View>
            ) : (
              filtered.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.card}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('ProductDetails', { product })}
                  onLongPress={() => handleDelete(product)}
                  delayLongPress={400}
                >
                  {/* Status badge */}
                  <View style={[styles.statusBadge, { backgroundColor: statusColor(product.status) }]}>
                    <Text style={styles.statusText}>{product.status}</Text>
                  </View>

                  {/* Product image */}
                  {product.image ? (
                    <Image source={{ uri: product.image }} style={styles.productImage} resizeMode="cover" />
                  ) : (
                    <View style={[styles.productImage, styles.noImage]}>
                      <Text style={styles.noImageIcon}>🖼️</Text>
                    </View>
                  )}

                  {/* Info */}
                  <View style={styles.cardBody}>
                    <Text style={styles.skuText}>{product.sku}</Text>
                    <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                    <View style={styles.priceRow}>
                      <View>
                        <Text style={styles.retailLabel}>Retail Price</Text>
                        <Text style={styles.priceText}>
                          {product.currency || '₹'}{Number(product.price).toFixed(2)}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.addBtn, addedIds[product.id] && styles.addBtnAdded]}
                        onPress={(e) => { e.stopPropagation?.(); handleAddToCart(product); }}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.addBtnText}>{addedIds[product.id] ? '✓' : '+'}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>

        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA' },
  header: {
    backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backBtn: {},
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1a2e6c' },
  cartBtn: {
    width: 42, height: 42, backgroundColor: '#EEF0FF',
    borderRadius: 12, alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  cartBadge: {
    position: 'absolute', top: -4, right: -4, backgroundColor: '#3d5af1',
    borderRadius: 10, minWidth: 18, height: 18,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3, borderWidth: 1.5, borderColor: '#fff',
  },
  cartBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#64748B', fontSize: 14 },
  searchRow: {
    flexDirection: 'row', paddingHorizontal: 16, paddingTop: 14, gap: 10, alignItems: 'center',
  },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: '#e8ecf4', gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#333' },
  filterBtn: {
    width: 44, height: 44, backgroundColor: '#fff', borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e8ecf4',
  },
  catRow: { paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
  catChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e8ecf4',
  },
  catChipActive: { backgroundColor: '#1a2e6c', borderColor: '#1a2e6c' },
  catChipText: { fontSize: 13, fontWeight: '600', color: '#666' },
  catChipTextActive: { color: '#fff' },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 12, gap: 12, paddingBottom: 24,
  },
  emptyState: { flex: 1, width: '100%', alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '700', color: '#333' },
  emptySub: { fontSize: 13, color: '#aaa', marginTop: 4 },
  card: {
    width: '47%', backgroundColor: '#fff',
    borderRadius: 14, overflow: 'hidden', elevation: 3, position: 'relative',
  },
  statusBadge: {
    position: 'absolute', top: 8, left: 8,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, zIndex: 1,
  },
  statusText: { color: '#fff', fontSize: 8, fontWeight: '800', letterSpacing: 0.5 },
  productImage: { width: '100%', height: 130, backgroundColor: '#1a1a2e' },
  noImage: { alignItems: 'center', justifyContent: 'center' },
  noImageIcon: { fontSize: 36 },
  cardBody: { padding: 10 },
  skuText: { fontSize: 9, color: '#aaa', marginBottom: 3 },
  productName: { fontSize: 12, fontWeight: '700', color: '#1a1a2e', marginBottom: 8, lineHeight: 17 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  retailLabel: { fontSize: 9, color: '#aaa', marginBottom: 2 },
  priceText: { fontSize: 14, fontWeight: '800', color: '#3d5af1' },
  addBtn: {
    width: 30, height: 30, backgroundColor: '#3d5af1',
    borderRadius: 8, alignItems: 'center', justifyContent: 'center',
  },
  addBtnAdded: { backgroundColor: '#22c55e' },
  addBtnText: { color: '#fff', fontSize: 18, fontWeight: '700', lineHeight: 22 },
});