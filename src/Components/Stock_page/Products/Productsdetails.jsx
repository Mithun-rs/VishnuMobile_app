import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Cart from '../../../asset/cart.svg';
import BackArrow from '../../../asset/back-arrow.svg';

export default function ProductDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { product } = route.params;

  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const currency = product.currency || "₹";
  const stockQty = product.stockQty ?? product.qty ?? 0;

  const handleDecrease = () => {
    if (qty > 1) setQty(qty - 1);
  };

  const handleIncrease = () => {
    setQty(qty + 1);
  };

  const handleAddToTransaction = async () => {
    try {
      const data = await AsyncStorage.getItem("cart");
      const cart = data ? JSON.parse(data) : [];
      const existing = cart.findIndex((i) => i.id === product.id);
      if (existing >= 0) {
        cart[existing].qty += qty;
      } else {
        cart.push({ ...product, qty });
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

  // Inventory progress: stockQty out of assumed max 100
  const maxStock = Math.max(stockQty, 100);
  const stockPercent = Math.min((stockQty / maxStock) * 100, 100);

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
        <TouchableOpacity style={styles.cartBtn} onPress={() => navigation.navigate("Cart")}>
          <Cart width={24} height={24} fill="#1a2e6c" stroke="#1a2e6c" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* PRODUCT IMAGE */}
        <View style={styles.imageContainer}>
          {product.image ? (
            <Image
              source={{ uri: product.image }}
              style={styles.productImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.noImageBox}>
              <Text style={styles.noImageIcon}>🖼️</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>

          {/* AVAILABILITY BADGE */}
          <View style={[
            styles.availBadge,
            { backgroundColor: product.available === false ? "#ef4444" : "#22c55e" }
          ]}>
            <Text style={styles.availBadgeText}>
              {product.available === false ? "UNAVAILABLE" : "AVAILABLE NOW"}
            </Text>
          </View>

          {/* PRODUCT NAME */}
          <Text style={styles.productName}>{product.name}</Text>

          {/* SKU */}
          <Text style={styles.skuText}>SKU: {product.sku}</Text>

          {/* PRICE */}
          <Text style={styles.price}>
            {currency}{Number(product.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </Text>

          {/* SPECS ROW — Color & Storage */}
          {(product.color || product.storage) && (
            <View style={styles.specsRow}>
              {product.color ? (
                <View style={styles.specBox}>
                  <Text style={styles.specLabel}>COLOR</Text>
                  <Text style={styles.specValue}>{product.color}</Text>
                </View>
              ) : null}
              {product.storage ? (
                <View style={styles.specBox}>
                  <Text style={styles.specLabel}>STORAGE</Text>
                  <Text style={styles.specValue}>{product.storage}</Text>
                </View>
              ) : null}
            </View>
          )}

          {/* DESCRIPTION */}
          {product.description ? (
            <View style={styles.descBox}>
              <Text style={styles.descLabel}>DESCRIPTION</Text>
              <Text style={styles.descText}>{product.description}</Text>
            </View>
          ) : null}

          {/* QUANTITY SELECTOR */}
          <Text style={styles.qtyLabel}>SELECT QUANTITY</Text>
          <View style={styles.qtyRow}>
            <TouchableOpacity
              style={[styles.qtyBtn, qty <= 1 && styles.qtyBtnDisabled]}
              onPress={handleDecrease}
              activeOpacity={0.7}
            >
              <Text style={[styles.qtyBtnText, qty <= 1 && styles.qtyBtnTextDisabled]}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{qty}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={handleIncrease} activeOpacity={0.7}>
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* ADD TO TRANSACTION */}
          <TouchableOpacity
            style={[styles.addBtn, added && styles.addBtnAdded]}
            onPress={handleAddToTransaction}
            activeOpacity={0.85}
          >
            <Text style={styles.addBtnIcon}>🛒</Text>
            <Text style={styles.addBtnText}>ADD TO TRANSACTION</Text>
          </TouchableOpacity>

          {/* INVENTORY PROGRESS */}
          <View style={styles.inventoryRow}>
            <Text style={styles.inventoryLabel}>Current Inventory</Text>
            <Text style={styles.inventoryCount}>{stockQty} units</Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${stockPercent}%` }]} />
          </View>

          <View style={{ height: 30 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },

  // Header
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 20, paddingVertical: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderBottomWidth: 1, borderBottomColor: "#eee",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  backBtn: {},
  headerTitle: { fontSize: 16, fontWeight: "800", color: "#1a2e6c" },
  cartBtn: {
    width: 42, height: 42, backgroundColor: "#EEF0FF",
    borderRadius: 12, alignItems: "center", justifyContent: "center",
  },

  // Back to POS
  backToPosRow: { paddingHorizontal: 20, paddingVertical: 10 },
  backToPosText: { fontSize: 11, color: "#888", fontWeight: "700", letterSpacing: 1 },

  // Image
  imageContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 16,
    height: 220,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    overflow: "hidden",
  },
  productImage: { width: "100%", height: "100%" },
  noImageBox: { alignItems: "center", justifyContent: "center", flex: 1 },
  noImageIcon: { fontSize: 60 },

  // Content
  content: { paddingHorizontal: 16, paddingTop: 20 },

  // Badge
  availBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 6, marginBottom: 12,
  },
  availBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 0.8 },

  // Name & SKU & Price
  productName: { fontSize: 28, fontWeight: "900", color: "#111", lineHeight: 34, marginBottom: 4 },
  skuText: { fontSize: 12, color: "#aaa", marginBottom: 10 },
  price: { fontSize: 26, fontWeight: "900", color: "#2D2F8E", marginBottom: 20 },

  // Specs
  specsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  specBox: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#eaecf4",
  },
  specLabel: { fontSize: 9, color: "#aaa", fontWeight: "700", letterSpacing: 1.2, marginBottom: 4 },
  specValue: { fontSize: 14, fontWeight: "700", color: "#222" },

  // Description
  descBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#eaecf4",
  },
  descLabel: { fontSize: 9, color: "#aaa", fontWeight: "700", letterSpacing: 1.2, marginBottom: 6 },
  descText: { fontSize: 13, color: "#444", lineHeight: 20 },

  // Quantity
  qtyLabel: {
    fontSize: 10, color: "#999", fontWeight: "700",
    letterSpacing: 1.5, marginBottom: 12,
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
    marginBottom: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#eaecf4",
    overflow: "hidden",
    elevation: 1,
  },
  qtyBtn: {
    width: 48, height: 48,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "#fff",
  },
  qtyBtnDisabled: { opacity: 0.3 },
  qtyBtnText: { fontSize: 22, fontWeight: "700", color: "#2D2F8E" },
  qtyBtnTextDisabled: { color: "#ccc" },
  qtyValue: {
    width: 56, textAlign: "center",
    fontSize: 18, fontWeight: "800", color: "#111",
    borderLeftWidth: 1, borderRightWidth: 1, borderColor: "#eaecf4",
    lineHeight: 48,
  },

  // Add to transaction
  addBtn: {
    backgroundColor: "#2D2F8E",
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 24,
    elevation: 3,
  },
  addBtnAdded: { backgroundColor: "#22c55e" },
  addBtnIcon: { fontSize: 18 },
  addBtnText: { color: "#fff", fontSize: 15, fontWeight: "800", letterSpacing: 1 },

  // Inventory progress
  inventoryRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 8,
  },
  inventoryLabel: { fontSize: 12, color: "#888", fontWeight: "600" },
  inventoryCount: { fontSize: 12, fontWeight: "700", color: "#2D2F8E" },
  progressBg: {
    height: 6, backgroundColor: "#e8ecf4",
    borderRadius: 10, overflow: "hidden",
  },
  progressFill: {
    height: "100%", backgroundColor: "#2D2F8E",
    borderRadius: 10,
  },
});