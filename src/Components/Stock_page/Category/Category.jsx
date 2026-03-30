import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import Person from '../../../asset/person.svg';
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Default categories always shown
const DEFAULT_CATEGORIES = [
  { id: "default_1", name: "Smartphones", productCount: 124, icon: "📱" },
  { id: "default_2", name: "Accessories", productCount: 482, icon: "🎧" },
];

export default function InventoryScreen() {
  const navigation = useNavigation();
  const [savedCategories, setSavedCategories] = useState([]);

  // Reload categories every time this screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const loadCategories = async () => {
        try {
          const existing = await AsyncStorage.getItem("categories");
          setSavedCategories(existing ? JSON.parse(existing) : []);
        } catch (e) {
          setSavedCategories([]);
        }
      };
      loadCategories();
    }, [])
  );

  const allCategories = [...DEFAULT_CATEGORIES, ...savedCategories];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.menu}>☰</Text>
          <Text style={styles.title}>Shop Manager</Text>
          <View style={styles.profile}>
            <Person width={20} height={20} fill="#fff" />
          </View>
        </View>

        {/* PAGE TITLE */}
        <View style={styles.section}>
          <Text style={styles.subTitle}>CATALOG CONTROL</Text>
          <Text style={styles.mainTitle}>Inventory</Text>
        </View>

        {/* ADD NEW PRODUCT BUTTON */}
        <TouchableOpacity style={styles.addBtn}>
          <Text style={styles.addIcon}>＋</Text>
          <Text style={styles.addText}>Add New Product</Text>
        </TouchableOpacity>

        {/* CATEGORIES HEADER */}
        <View style={styles.row}>
          <Text style={styles.catTitle}>Categories</Text>
          <View style={styles.row}>
            <TouchableOpacity onPress={() => navigation.navigate("AddCategory")}>
              <Text style={styles.addCategory}>＋ Add Category</Text>
            </TouchableOpacity>
            <Text style={styles.viewAll}>View All</Text>
          </View>
        </View>

        {/* CATEGORY CARDS GRID */}
        <View style={styles.cardGrid}>
          {allCategories.map((cat) => (
            <View key={cat.id} style={styles.card}>
              <View style={styles.iconBox}>
                <Text style={styles.icon}>{cat.icon || "🗂️"}</Text>
              </View>
              <Text style={styles.cardTitle} numberOfLines={1}>{cat.name}</Text>
              <Text style={styles.cardSub}>{cat.productCount} Products</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menu: {
    fontSize: 22,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D2F8E",
  },
  profile: {
    width: 36,
    height: 36,
    backgroundColor: "#2D2F8E",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  subTitle: {
    fontSize: 10,
    color: "#999",
    letterSpacing: 2,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 5,
  },
  addBtn: {
    backgroundColor: "#1E1F8F",
    margin: 16,
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  addIcon: {
    color: "#fff",
    fontSize: 18,
  },
  addText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 10,
  },
  catTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  addCategory: {
    color: "#2D2F8E",
    marginRight: 10,
    fontSize: 12,
  },
  viewAll: {
    color: "#999",
    fontSize: 12,
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    marginTop: 16,
    gap: 12,
  },
  card: {
    backgroundColor: "#fff",
    width: "46%",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    elevation: 3,
  },
  iconBox: {
    backgroundColor: "#EEF0FF",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  icon: {
    fontSize: 20,
  },
  cardTitle: {
    fontWeight: "600",
    marginTop: 5,
    textAlign: "center",
  },
  cardSub: {
    color: "#888",
    fontSize: 12,
    marginTop: 2,
  },
});