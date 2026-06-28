import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import { CachedImage } from "../../../../lib/imageUtils";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Cart from '../../../../assets/cart.svg';
import BackArrow from '../../../../assets/back-arrow.svg';

export default function ProductDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { product } = route.params;

  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const currency = product.currency || "₹";

  const handleDecrease = () => setQty((prev) => (prev > 1 ? prev - 1 : 1));
  const handleIncrease = () => setQty((prev) => prev + 1);

  const handleAddToTransaction = async () => {
    try {
      const data = await AsyncStorage.getItem("cart");
      const cart = data ? JSON.parse(data) : [];
      const existingIndex = cart.findIndex((i) => i.id === product.id);
      
      if (existingIndex >= 0) {
        cart[existingIndex].qty += qty;
      } else {
        cart.push({ ...product, qty: qty });
      }
      await AsyncStorage.setItem("cart", JSON.stringify(cart));
      setAdded(true);
      Alert.alert(
        "Added to Cart",
        `${qty}x ${product.name} added to transaction.`,
        [{ text: "Continue Shopping", onPress: () => navigation.goBack() },
         { text: "View Cart", onPress: () => navigation.navigate("Cart") }]
      );
    } catch (e) {
      Alert.alert("Error", "Could not add to cart.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <BackArrow width={20} height={20} fill="#2D2F8E" stroke="#2D2F8E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vishnu Mobile Shop</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* PRODUCT IMAGE */}
       

 <ScrollView showsVerticalScrollIndicator={false}>

  {/* IMAGE */}
  <View style={styles.imageContainer}>
    <CachedImage
      uri={product.image}
      style={styles.productImage}
      resizeMode="contain"
      thumbWidth={600}
      thumbHeight={600}
      fallback={<Text style={styles.noImageIcon}>📱</Text>}
    />
  </View>

  <View style={styles.content}>

    {/* AVAILABILITY */}
    <View style={styles.availBadge}>
      <View style={[styles.availDot, { backgroundColor: product.available === false ? '#CC0C39' : '#067D62' }]} />
      <Text style={[styles.availBadgeText, { color: product.available === false ? '#CC0C39' : '#067D62' }]}>
        {product.available === false ? 'Currently Unavailable' : 'In Stock'}
      </Text>
    </View>

    {/* NAME */}
    <Text style={styles.productName}>{product.name}</Text>
    <View style={styles.divider} />

    {/* PRICE */}
    <Text style={styles.priceLabel}>Deal Price</Text>
    <Text style={styles.price}>
      {currency}{Number(product.price).toLocaleString('en-IN')}
    </Text>
    {product.marketPrice ? (
      <View style={styles.mrpRow}>
        <Text style={styles.mrpText}>
          M.R.P.: <Text style={styles.mrpStrike}>
            {currency}{Number(product.marketPrice).toLocaleString('en-IN')}
          </Text>
        </Text>
        <Text style={styles.savingsText}>
          Save {currency}{(Number(product.marketPrice) - Number(product.price)).toLocaleString('en-IN')}
        </Text>
      </View>
    ) : null}

    <View style={styles.divider} />

    {/* STOCK QTY — for restocking reference */}
    {(() => {
      const qty = Number(product.stockQty) || 0;
      const isOut  = qty <= 0;
      const isLow  = qty > 0 && qty <= 3;
      const color  = isOut ? '#CC0C39' : isLow ? '#D97706' : '#067D62';
      const bgColor = isOut ? '#FEF2F2' : isLow ? '#FEF3C7' : '#ECFDF5';
      const label  = isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock';
      const icon   = isOut ? '🔴' : isLow ? '🟡' : '🟢';
      return (
        <View style={styles.stockSection}>
          <Text style={styles.stockTitle}>📦  Stock Information</Text>
          <View style={styles.stockRow}>
            <View style={styles.stockQtyBox}>
              <Text style={styles.stockQtyLabel}>Available Qty</Text>
              <Text style={[styles.stockQtyValue, { color }]}>{qty} units</Text>
            </View>
            <View style={[styles.stockStatusBadge, { backgroundColor: bgColor, borderColor: color }]}>
              <Text style={{ fontSize: 12 }}>{icon}</Text>
              <Text style={[styles.stockStatusText, { color }]}>{label}</Text>
            </View>
          </View>
          {isOut && (
            <View style={styles.restockAlert}>
              <Text style={styles.restockAlertText}>⚠️  Restock needed — 0 units remaining</Text>
            </View>
          )}
          {isLow && (
            <View style={[styles.restockAlert, { backgroundColor: '#FFFBEB', borderColor: '#FCD34D' }]}>
              <Text style={[styles.restockAlertText, { color: '#92400E' }]}>⚡  Only {qty} unit{qty > 1 ? 's' : ''} left — consider restocking soon</Text>
            </View>
          )}
        </View>
      );
    })()}

    <View style={styles.divider} />

    {/* SPECS */}
    {(product.color || product.storage) && (
      <>
        <Text style={styles.specsTitle}>Product Details</Text>
        <View style={styles.specsRow}>
          {product.color ? (
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Color</Text>
              <Text style={styles.specValue}>{product.color}</Text>
            </View>
          ) : null}
          {product.storage ? (
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Storage</Text>
              <Text style={styles.specValue}>{product.storage}</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.divider} />
      </>
    )}

    {/* IMEI */}
    {(product.imei || product.sku) ? (
      <View style={styles.imeiBox}>
        <Text style={styles.imeiLabel}>IMEI Number</Text>
        <Text style={styles.imeiText}>{product.imei || product.sku}</Text>
      </View>
    ) : null}

    {/* Shop Location */}
    <View style={styles.imeiBox}>
      <Text style={styles.imeiLabel}>Shop Location</Text>
      <Text style={styles.imeiText}>{product.shop || 'shop1'}</Text>
    </View>

    {/* BUTTON */}
    <TouchableOpacity
      style={[styles.addBtn, added && styles.addBtnAdded]}
      onPress={handleAddToTransaction}
    >
      <Text style={styles.addBtnText}>
        {added ? '✓  Added to Cart' : '🛒  Add to Cart'}
      </Text>
    </TouchableOpacity>
  </View>


  {/* DESCRIPTION */}
  {product.description ? (
    <View style={styles.descBox}>
      <Text style={styles.descLabel}>About this item</Text>
      <Text style={styles.descText}>{product.description}</Text>
    </View>
  ) : null}

  <View style={{ height: 40 }} />
</ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F2' },

  // ── Header (Amazon dark nav) ──────────────────────────────────────────────
  header: {
    backgroundColor: '#ffffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backBtn: {
    width: 34, height: 34,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16, fontWeight: '800',
    color: '#1a2e6c', letterSpacing: 0.2,
  },
  cartBtn: {
    width: 38, height: 38,
    backgroundColor: '#d6d6d6ff',
    borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },

  // ── Product Image ─────────────────────────────────────────────────────────
  imageContainer: {
    backgroundColor: '#FFFFFF',
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E7E7E7',
  },
  productImage: { width: '100%', height: '100%' },
  noImageBox: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  noImageIcon: { fontSize: 72 },

  // ── Content card ──────────────────────────────────────────────────────────
  content: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    borderTopWidth: 4,
    borderTopColor: '#1a2e6c',
  },

  // ── Availability badge ────────────────────────────────────────────────────
  availBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: 'transparent',
    borderRadius: 0,
    alignSelf: 'flex-start',
  },
  availDot: {
    width: 8, height: 8, borderRadius: 4,
  },
  availBadgeText: {
    fontSize: 13, fontWeight: '700', letterSpacing: 0.2,
  },

  // ── Name ─────────────────────────────────────────────────────────────────
  productName: {
    fontSize: 18, fontWeight: '700',
    color: '#0F1111', lineHeight: 26, marginBottom: 10,
  },

  // ── Divider ───────────────────────────────────────────────────────────────
  divider: {
    height: 1, backgroundColor: '#E7E7E7', marginVertical: 14,
  },

  // ── Price block ───────────────────────────────────────────────────────────
  priceLabel: { fontSize: 11, color: '#565959', marginBottom: 3 },
  price: {
    fontSize: 30, fontWeight: '800',
    color: '#0F1111', letterSpacing: -0.5,
  },
  mrpRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  mrpText: { fontSize: 12, color: '#565959' },
  mrpStrike: { textDecorationLine: 'line-through' },
  savingsText: { fontSize: 12, fontWeight: '700', color: '#CC0C39' },

  // ── SKU / IMEI ────────────────────────────────────────────────────────────
  skuText: { fontSize: 11, color: '#888', marginBottom: 2 },
  imeiBox: {
    backgroundColor: '#F0F2F2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E7E7E7',
    padding: 12,
    marginBottom: 16,
  },
  imeiLabel: {
    fontSize: 9, fontWeight: '800',
    color: '#565959', letterSpacing: 1.2,
    textTransform: 'uppercase', marginBottom: 4,
  },
  imeiText: {
    fontSize: 13, color: '#0F1111',
    fontFamily: 'monospace', letterSpacing: 0.5,
  },

  // ── Specs ─────────────────────────────────────────────────────────────────
  specsTitle: {
    fontSize: 11, fontWeight: '800',
    color: '#000000ff', letterSpacing: 0.8,
    textTransform: 'uppercase', marginBottom: 10,
  },
  specsRow: { gap: 6, marginBottom: 14 },
  specRow: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  specBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 0, padding: 0,
    borderWidth: 0, flex: 0,
  },
  specLabel: {
    fontSize: 13, color: '#565959',
    width: 90, flexShrink: 0,
  },
  specValue: {
    fontSize: 13, fontWeight: '700', color: '#0F1111', flex: 1,
  },

  // ── Description ───────────────────────────────────────────────────────────
  descBox: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    paddingHorizontal: 16, paddingVertical: 16,
    borderTopWidth: 1, borderTopColor: '#E7E7E7',
  },
  descLabel: {
    fontSize: 16, fontWeight: '800',
    color: '#0F1111', marginBottom: 10,
    paddingBottom: 10, borderBottomWidth: 1,
    borderBottomColor: '#E7E7E7',
  },
  descText: { fontSize: 13, color: '#333', lineHeight: 22 },

  // ── Buttons ───────────────────────────────────────────────────────────────
  addBtn: {
    backgroundColor: '#1a2e6c',
    paddingVertical: 15,
    borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E6870A',
  },
  addBtnAdded: { backgroundColor: '#067D62', borderColor: '#067D62' },
  addBtnText: {
    color: '#ffffffff', fontSize: 15, fontWeight: '800', letterSpacing: 0.3,
  },

  // ── Stock Information ──────────────────────────────────────────────────────
  stockSection: {
    marginBottom: 4,
  },
  stockTitle: {
    fontSize: 11, fontWeight: '800',
    color: '#0F1111', letterSpacing: 0.8,
    textTransform: 'uppercase', marginBottom: 10,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  stockQtyBox: {
    flex: 1,
  },
  stockQtyLabel: {
    fontSize: 11, color: '#565959', marginBottom: 3,
  },
  stockQtyValue: {
    fontSize: 26, fontWeight: '900', letterSpacing: -0.5,
  },
  stockStatusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1,
  },
  stockStatusText: {
    fontSize: 12, fontWeight: '800',
  },
  restockAlert: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 2,
  },
  restockAlertText: {
    fontSize: 12, fontWeight: '700', color: '#991B1B', lineHeight: 18,
  },
});