import React, { useState, useCallback } from "react";
import { useAuth } from '../../../../context/AuthContext';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { supabase } from "../../../../lib/supabase";
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

export default function InventoryScreen() {
  const navigation  = useNavigation();
  const { signOut } = useAuth();

  const [categories, setCategories]           = useState([]);
  const [productCounts, setProductCounts]     = useState({});
  const [loading, setLoading]                 = useState(true);
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);

  const handleLogout = () => {
    setProfileMenuVisible(false);
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  // ── Load categories + product counts from Supabase ─────────────────
  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [])
  );

  const loadAll = async () => {
    setLoading(true);
    try {
      // Fetch categories
      const { data: cats, error: catErr } = await supabase
        .from('categories')
        .select('id, name, icon')
        .order('name');
      if (catErr) throw catErr;

      // Fetch product counts grouped by category
      const { data: products, error: prodErr } = await supabase
        .from('products')
        .select('category');
      if (prodErr) throw prodErr;

      // Build count map: { categoryName: count }
      const countMap = {};
      (products || []).forEach(p => {
        if (p.category) countMap[p.category] = (countMap[p.category] || 0) + 1;
      });

      setCategories(cats || []);
      setProductCounts(countMap);
    } catch (e) {
      console.error('loadAll error:', e.message);
      Alert.alert('Error', 'Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (cat) => {
    Alert.alert(
      'Delete Category',
      `Delete "${cat.name}"?\n\nProducts in this category will remain but lose their category link.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', cat.id);
              if (error) throw error;
              setCategories(prev => prev.filter(c => c.id !== cat.id));
            } catch (e) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* Profile Dropdown Modal */}
      <Modal visible={profileMenuVisible} transparent animationType="fade" onRequestClose={() => setProfileMenuVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setProfileMenuVisible(false)}>
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
            <TouchableOpacity style={styles.dropdownItem} onPress={() => { setProfileMenuVisible(false); navigation.navigate('Settings'); }}>
              <View style={styles.dropdownItemIcon}><SettingsIcon size={18} color="#2D2F8E" /></View>
              <Text style={styles.dropdownItemText}>Settings</Text>
            </TouchableOpacity>
            <View style={styles.dropdownSep} />
            <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
              <View style={[styles.dropdownItemIcon, styles.dropdownItemIconDanger]}><LogoutIcon size={18} color="#ef4444" /></View>
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
          <TouchableOpacity style={styles.iconBtn} onPress={() => setProfileMenuVisible(true)}>
            <ProfileIcon size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* PAGE TITLE */}
        <View style={styles.section}>
          <Text style={styles.subTitle}>CATALOG CONTROL</Text>
          <Text style={styles.mainTitle}>Inventory</Text>
        </View>

        {/* ADD NEW PRODUCT BUTTON */}
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddProduct')}>
          <Text style={styles.addIcon}>＋</Text>
          <Text style={styles.addText}>Add New Product</Text>
        </TouchableOpacity>

        {/* CATEGORIES HEADER */}
        <View style={styles.row}>
          <Text style={styles.catTitle}>
            Categories{' '}
            <Text style={styles.catCount}>({categories.length})</Text>
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('AddCategory')}>
            <Text style={styles.addCategory}>＋ Add Category</Text>
          </TouchableOpacity>
        </View>

        {/* CATEGORY CARDS GRID */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#2D2F8E" />
            <Text style={styles.loadingText}>Loading categories...</Text>
          </View>
        ) : categories.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🗂️</Text>
            <Text style={styles.emptyText}>No categories yet</Text>
            <Text style={styles.emptySub}>Tap "+ Add Category" to create one</Text>
          </View>
        ) : (
          <View style={styles.cardGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.card}
                onPress={() => navigation.navigate('Products', { categoryId: cat.id })}
                onLongPress={() => handleDelete(cat)}
                delayLongPress={500}
                activeOpacity={0.8}
              >
                <View style={styles.iconBox}>
                  <Text style={styles.icon}>{cat.icon || '🗂️'}</Text>
                </View>
                <Text style={styles.cardTitle} numberOfLines={1}>{cat.name}</Text>
                <Text style={styles.cardSub}>
                  {productCounts[cat.name] || 0} Products
                </Text>
                {cat.description ? (
                  <Text style={styles.cardDesc} numberOfLines={1}>{cat.description}</Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.hint}>Long press a category to delete it</Text>
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA' },

  // Header
  header: {
    backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 2,
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
    elevation: 12, overflow: 'hidden',
  },
  dropdownHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, backgroundColor: '#F8F9FF' },
  dropdownAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#2D2F8E', alignItems: 'center', justifyContent: 'center' },
  dropdownAvatarText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  dropdownName: { fontSize: 13, fontWeight: '800', color: '#1E293B' },
  dropdownRole: { fontSize: 11, color: '#94A3B8', marginTop: 1 },
  dropdownSep: { height: 1, backgroundColor: '#F1F5F9' },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 14 },
  dropdownItemIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#EEF0FF', alignItems: 'center', justifyContent: 'center' },
  dropdownItemIconDanger: { backgroundColor: '#FEE2E2' },
  dropdownItemText: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  dropdownItemTextDanger: { color: '#ef4444' },

  section: { paddingHorizontal: 16, marginTop: 10 },
  subTitle: { fontSize: 10, color: '#999', letterSpacing: 2 },
  mainTitle: { fontSize: 28, fontWeight: 'bold', marginTop: 5 },

  addBtn: {
    backgroundColor: '#2D2F8E', margin: 16, padding: 14,
    borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  addIcon: { color: '#fff', fontSize: 18 },
  addText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginTop: 10 },
  catTitle: { fontSize: 18, fontWeight: 'bold' },
  catCount: { fontSize: 14, color: '#94A3B8', fontWeight: '500' },
  addCategory: { color: '#2D2F8E', fontSize: 13, fontWeight: '700' },

  loadingBox: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  loadingText: { color: '#94A3B8', fontSize: 14 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '700', color: '#333' },
  emptySub: { fontSize: 13, color: '#aaa', marginTop: 4 },

  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, marginTop: 16, gap: 12 },
  card: { backgroundColor: '#fff', width: '46%', padding: 16, borderRadius: 14, alignItems: 'center', elevation: 3 },
  iconBox: { backgroundColor: '#EEF0FF', padding: 12, borderRadius: 10, marginBottom: 10 },
  icon: { fontSize: 24 },
  cardTitle: { fontWeight: '700', fontSize: 13, marginTop: 4, textAlign: 'center', color: '#1E293B' },
  cardSub: { color: '#2D2F8E', fontSize: 12, marginTop: 3, fontWeight: '600' },
  cardDesc: { color: '#94A3B8', fontSize: 10, marginTop: 2 },

  hint: { textAlign: 'center', color: '#CBD5E1', fontSize: 11, marginTop: 12 },
});