// src/Components/Admin/ProductsSold/ProductsSold.jsx
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../../lib/supabase';
import Svg, { Polyline, Line, Rect } from 'react-native-svg';

const BackIcon = ({ size = 24, color = "#2D2F8E" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline points="15 18 9 12 15 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SmartphoneIcon = ({ size = 24, color = "#2D2F8E" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="5" y="2" width="14" height="20" rx="2" ry="2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="12" y1="18" x2="12.01" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function ProductsSoldScreen() {
  const navigation = useNavigation();
  const [tab, setTab] = useState('TODAY');
  const [loading, setLoading] = useState(true);
  const [rawOrders, setRawOrders] = useState([]);
  const [rawItems, setRawItems] = useState([]);
  const [rawProducts, setRawProducts] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Get all orders from the last month up to now to cover all tabs
      let monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      monthAgo.setHours(0,0,0,0);

      const [ordersRes, itemsRes, productsRes] = await Promise.all([
        supabase.from('orders').select('id, created_at').gte('created_at', monthAgo.toISOString()),
        supabase.from('order_items').select('order_id, product_id, qty'),
        supabase.from('products').select('id, name, storage, color')
      ]);

      setRawOrders(ordersRes.data || []);
      setRawItems(itemsRes.data || []);
      setRawProducts(productsRes.data || []);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const { productsList } = React.useMemo(() => {
    if (!rawOrders.length || !rawItems.length || !rawProducts.length) return { productsList: [] };

    const now = new Date();
    let startDate = new Date();
    
    if (tab === 'TODAY') {
      startDate.setHours(0,0,0,0);
    } else if (tab === 'WEEKLY') {
      startDate.setDate(now.getDate() - 6);
      startDate.setHours(0,0,0,0);
    } else if (tab === 'MONTHLY') {
      startDate.setMonth(now.getMonth() - 1);
      startDate.setHours(0,0,0,0);
    }

    const validOrderIds = new Set(rawOrders.filter(o => new Date(o.created_at) >= startDate).map(o => o.id));
    
    const qtyMap = {};
    rawItems.filter(i => validOrderIds.has(i.order_id)).forEach(i => {
      qtyMap[i.product_id] = (qtyMap[i.product_id] || 0) + (i.qty || 0);
    });

    const list = Object.keys(qtyMap).map(pId => {
      const prod = rawProducts.find(p => p.id === pId);
      return {
        id: pId,
        name: prod?.name || 'Unknown Product',
        sub: (prod?.storage || prod?.color) ? `${prod?.storage || ''} ${prod?.color || ''}`.trim() : 'Standard Edition',
        sold: qtyMap[pId]
      };
    }).sort((a,b) => b.sold - a.sold);

    return { productsList: list };
  }, [rawOrders, rawItems, rawProducts, tab]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <BackIcon size={24} color="#2D2F8E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Products Sold</Text>
        <View style={{width: 36}} />
      </View>

      <View style={styles.tabContainer}>
        {['TODAY', 'WEEKLY', 'MONTHLY'].map((t) => (
          <TouchableOpacity 
            key={t} 
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'TODAY' ? 'Today' : t === 'WEEKLY' ? 'This Week' : 'This Month'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color="#2D2F8E" style={{marginTop: 40}} />
        ) : productsList.length === 0 ? (
          <Text style={{textAlign: 'center', color: '#94A3B8', marginTop: 40}}>No products sold in this period.</Text>
        ) : (
          productsList.map((p, i) => (
            <View key={p.id} style={styles.productCard}>
              <View style={styles.rankBox}>
                <Text style={styles.rankText}>#{i + 1}</Text>
              </View>
              <View style={styles.productIconBox}>
                <SmartphoneIcon size={26} color="#7986cb" />
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={1}>{p.name}</Text>
                <Text style={styles.productSub}>{p.sub}</Text>
              </View>
              <View style={styles.soldBox}>
                <Text style={styles.soldNumber}>{p.sold}</Text>
                <Text style={styles.soldUnit}>Units</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FF' },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#2D2F8E' },
  backBtn: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center', justifyContent: 'center'
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    backgroundColor: '#fff'
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center'
  },
  tabActive: { backgroundColor: '#2D2F8E' },
  tabText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  tabTextActive: { color: '#fff' },
  body: { padding: 16, paddingBottom: 40 },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8
  },
  rankBox: { width: 28 },
  rankText: { fontSize: 14, fontWeight: '800', color: '#94A3B8' },
  productIconBox: {
    width: 48, height: 48,
    backgroundColor: '#EEF0FF',
    borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12
  },
  productInfo: { flex: 1 },
  productName: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
  productSub: { fontSize: 11, color: '#64748B' },
  soldBox: { alignItems: 'flex-end', marginLeft: 12 },
  soldNumber: { fontSize: 18, fontWeight: '800', color: '#22c55e' },
  soldUnit: { fontSize: 10, fontWeight: '600', color: '#64748B' }
});
