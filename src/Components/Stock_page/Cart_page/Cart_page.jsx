import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Image,
} from "react-native";
import BackArrow from '../../../asset/back-arrow.svg';
import DeleteIcon from '../../../asset/delete.svg'
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CartScreen() {
  const navigation = useNavigation();
  const [cart, setCart] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [])
  );

  const loadCart = async () => {
    try {
      const data = await AsyncStorage.getItem("cart");
      setCart(data ? JSON.parse(data) : []);
    } catch (e) {}
  };

  const saveCart = async (updatedCart) => {
    try {
      await AsyncStorage.setItem("cart", JSON.stringify(updatedCart));
      setCart(updatedCart);
    } catch (e) {}
  };

  // Decrease qty by 1, remove item when qty reaches 0
  const decrease = async (id) => {
    const updated = cart
      .map((item) => item.id === id ? { ...item, qty: item.qty - 1 } : item)
      .filter((item) => item.qty > 0);
    await saveCart(updated);
  };

  // Increase qty by 1
  const increase = async (id) => {
    const updated = cart.map((item) =>
      item.id === id ? { ...item, qty: item.qty + 1 } : item
    );
    await saveCart(updated);
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <SafeAreaView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <BackArrow width={20} height={20} fill="#2D2F8E" stroke="#2D2F8E" />
                  </TouchableOpacity>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cart</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{totalItems}</Text>
        </View>
      </View>

      {cart.length === 0 ? (
        /* EMPTY STATE */
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Add products from the shop</Text>
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.shopBtnText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.card}>

                {/* Product Image */}
                <Image
                  source={{ uri: item.image }}
                  style={styles.image}
                  resizeMode="cover"
                />

                {/* Product Info */}
                <View style={styles.info}>
                  <Text style={styles.sku}>{item.sku}</Text>
                  <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.unitPrice}>${item.price.toFixed(2)} each</Text>
                </View>

                {/* Qty Stepper + subtotal */}
                <View style={styles.rightCol}>
                  <Text style={styles.subtotal}>
                    ${(item.price * item.qty).toFixed(2)}
                  </Text>
                  <View style={styles.stepper}>
                    {/* Minus — removes item when qty hits 0 */}
                    <TouchableOpacity
                      onPress={() => decrease(item.id)}
                      style={[
                        styles.stepBtn,
                        item.qty === 1 && styles.stepBtnDanger,
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.stepText,
                        item.qty === 1 && styles.stepTextDanger,
                      ]}>
                        {item.qty === 1 ? "-" : "−"}
                      </Text>
                    </TouchableOpacity>

                    <Text style={styles.qty}>{item.qty}</Text>

                    {/* Plus */}
                    <TouchableOpacity
                      onPress={() => increase(item.id)}
                      style={styles.stepBtn}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.stepText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

              </View>
            )}
          />

          {/* FOOTER */}
          <View style={styles.footer}>
            <View>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Billing')}
            >
              <Text style={styles.checkoutText}>Checkout →</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },

  // Header
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backBtn: {
    width: 36,
    height: 36,
    backgroundColor: "#EEF0FF",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: {
    fontSize: 18,
    color: "#1a2e6c",
    fontWeight: "bold",
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    color: "#1a2e6c",
  },
  badge: {
    backgroundColor: "#3d5af1",
    borderRadius: 10,
    minWidth: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
  },

  // Empty state
  emptyBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 60,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#aaa",
    marginBottom: 24,
  },
  shopBtn: {
    backgroundColor: "#1a2e6c",
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
  },
  shopBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  // List
  list: {
    padding: 16,
    gap: 12,
  },

  // Card
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    elevation: 3,
  },
  image: {
    width: 85,
    height: 85,
  },
  info: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: "center",
  },
  sku: {
    fontSize: 9,
    color: "#bbb",
    marginBottom: 3,
  },
  name: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1a1a2e",
    lineHeight: 17,
    marginBottom: 5,
  },
  unitPrice: {
    fontSize: 11,
    color: "#888",
  },

  // Right column
  rightCol: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  subtotal: {
    fontSize: 14,
    fontWeight: "800",
    color: "#3d5af1",
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  stepBtn: {
    width: 28,
    height: 28,
    backgroundColor: "#EEF0FF",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnDanger: {
    backgroundColor: "#FEE2E2",
  },
  stepText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a2e6c",
    lineHeight: 20,
  },
  stepTextDanger: {
    color: "#ef4444",
    fontSize: 13,
  },
  qty: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1a1a2e",
    minWidth: 22,
    textAlign: "center",
  },

  // Footer
  footer: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    elevation: 10,
  },
  totalLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 2,
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1a2e6c",
  },
  checkoutBtn: {
    backgroundColor: "#1a2e6c",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  checkoutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});