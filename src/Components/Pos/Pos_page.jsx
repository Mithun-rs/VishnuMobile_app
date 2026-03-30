import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from "react-native";

// ─── SAMPLE PRODUCTS ─────────────────
const products = [
  {
    id: "1",
    name: "iPhone 15 Pro - Blue Titanium",
    price: "$999.00",
    stock: "IN STOCK",
    image: "https://via.placeholder.com/120",
  },
  {
    id: "2",
    name: "Samsung S24 Ultra - Titanium Gray",
    price: "$1,299.00",
    stock: "LOW STOCK",
    image: "https://via.placeholder.com/120",
  },
  {
    id: "3",
    name: "iPhone 15 - Pink 128GB",
    price: "$799.00",
    stock: "IN STOCK",
    image: "https://via.placeholder.com/120",
  },
  {
    id: "4",
    name: "Google Pixel 8 Pro",
    price: "$899.00",
    stock: "IN STOCK",
    image: "https://via.placeholder.com/120",
  },
];

const categories = ["All", "iPhone", "Samsung", "Pixel", "Watch"];

// ─── COMPONENT ───────────────────────
export default function POSScreen() {
  const [active, setActive] = useState("All");

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text
        style={[
          styles.stockBadge,
          { backgroundColor: item.stock === "LOW STOCK" ? "#ff4d4d" : "#4caf50" },
        ]}
      >
        {item.stock}
      </Text>

      <Image source={{ uri: item.image }} style={styles.image} />

      <Text style={styles.name}>{item.name}</Text>

      <Text style={styles.price}>{item.price}</Text>

      <TouchableOpacity style={styles.addBtn}>
        <Text style={{ color: "#fff" }}>＋</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Vishnu Shop</Text>
        <Text style={styles.user}>👤</Text>
      </View>

      {/* SEARCH */}
      <View style={styles.searchRow}>
        <TextInput
          placeholder="Search models..."
          style={styles.search}
        />
        <TouchableOpacity style={styles.filter}>
          <Text>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* CATEGORIES */}
      <View style={styles.tabs}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setActive(cat)}
            style={[
              styles.tab,
              active === cat && styles.activeTab,
            ]}
          >
            <Text
              style={active === cat ? styles.activeText : styles.tabText}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* PRODUCT GRID */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={{ padding: 10 }}
      />

      {/* BOTTOM NAV */}
      <View style={styles.nav}>
        <Text style={styles.navItem}>🏠</Text>
        <Text style={styles.navItem}>📦</Text>
        <Text style={styles.navActive}>💳</Text>
        <Text style={styles.navItem}>👥</Text>
        <Text style={styles.navItem}>⋯</Text>
      </View>

    </SafeAreaView>
  );
}

// ─── STYLES ─────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },

  title: { fontSize: 18, fontWeight: "bold" },
  user: { fontSize: 18 },

  searchRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  search: {
    flex: 1,
    backgroundColor: "#eee",
    borderRadius: 10,
    padding: 10,
  },

  filter: {
    marginLeft: 10,
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 10,
  },

  tabs: {
    flexDirection: "row",
    paddingHorizontal: 10,
    marginBottom: 10,
  },

  tab: {
    backgroundColor: "#ddd",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },

  activeTab: {
    backgroundColor: "#3D5AF1",
  },

  tabText: { color: "#555" },
  activeText: { color: "#fff" },

  card: {
    flex: 1,
    backgroundColor: "#fff",
    margin: 6,
    padding: 10,
    borderRadius: 12,
  },

  stockBadge: {
    color: "#fff",
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
  },

  image: {
    width: "100%",
    height: 100,
    borderRadius: 10,
    marginVertical: 6,
  },

  name: {
    fontSize: 12,
    fontWeight: "600",
  },

  price: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 4,
  },

  addBtn: {
    backgroundColor: "#3D5AF1",
    padding: 6,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 6,
  },

  nav: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },

  navItem: { fontSize: 18, color: "#888" },
  navActive: { fontSize: 18, color: "#3D5AF1" },
});