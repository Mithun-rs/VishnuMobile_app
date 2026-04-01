import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
  Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Svg2, { Path, Circle, Polyline, Line } from 'react-native-svg';

const ProfileIcon = ({ size = 18, color = '#fff' }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" />
  </Svg2>
);

const SettingsIcon = ({ size = 18, color = '#2D2F8E' }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
    <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg2>
);

const LogoutIcon = ({ size = 18, color = '#ef4444' }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="16 17 21 12 16 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="21" y1="12" x2="9" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg2>
);

// Default categories always shown
const DEFAULT_CATEGORIES = [
  { id: "default_1", name: "Smartphones", productCount: 124, icon: "📱" },
  { id: "default_2", name: "Accessories", productCount: 482, icon: "🎧" },
];

export default function InventoryScreen() {
  const navigation = useNavigation();
  const [savedCategories, setSavedCategories] = useState([]);
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);

  const handleLogout = () => {
    setProfileMenuVisible(false);
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout', style: 'destructive',
          onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }),
        },
      ]
    );
  };

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
                <Text style={styles.dropdownAvatarText}>VM</Text>
              </View>
              <View>
                <Text style={styles.dropdownName}>Vishnu Mobile Shop</Text>
                <Text style={styles.dropdownRole}>Administrator</Text>
              </View>
            </View>
            <View style={styles.dropdownSep} />
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => { setProfileMenuVisible(false); navigation.navigate('Settings'); }}
            >
              <View style={styles.dropdownItemIcon}>
                <SettingsIcon size={18} color="#2D2F8E" />
              </View>
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

      <ScrollView>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerTitle}>
            <View style={styles.dot} />
            <Text style={styles.headerTitleText}>Vishnu Mobile Shop</Text>
          </View>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setProfileMenuVisible(true)}
          >
            <ProfileIcon size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* PAGE TITLE */}
        <View style={styles.section}>
          <Text style={styles.subTitle}>CATALOG CONTROL</Text>
          <Text style={styles.mainTitle}>Inventory</Text>
        </View>

        {/* ADD NEW PRODUCT BUTTON */}
     <TouchableOpacity
  style={styles.addBtn}
  onPress={() => navigation.navigate("AddProduct")}
>
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
  <TouchableOpacity
    key={cat.id}
    style={styles.card}
    onPress={() => navigation.navigate("Products", { categoryId: cat.id })}
    activeOpacity={0.8}
  >
    <View style={styles.iconBox}>
      <Text style={styles.icon}>{cat.icon || "🗂️"}</Text>
    </View>
    <Text style={styles.cardTitle} numberOfLines={1}>{cat.name}</Text>
    <Text style={styles.cardSub}>{cat.productCount} Products</Text>
  </TouchableOpacity>
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
  },

  // Profile Dropdown
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
    backgroundColor: '#2D2F8E', alignItems: 'center', justifyContent: 'center',
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
    backgroundColor: '#EEF0FF', alignItems: 'center', justifyContent: 'center',
  },
  dropdownItemIconDanger: { backgroundColor: '#FEE2E2' },
  dropdownItemText: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  dropdownItemTextDanger: { color: '#ef4444' },
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
    backgroundColor: '#2D2F8E',
    margin: 16,
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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