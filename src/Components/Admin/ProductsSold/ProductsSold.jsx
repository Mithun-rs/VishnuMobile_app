import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, ScrollView, ActivityIndicator, Image
} from 'react-native';
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
    <Rect x="5" y="2" width="14" height="20" rx="2" ry="2" stroke={color} strokeWidth="2" />
    <Line x1="12" y1="18" x2="12.01" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export default function ProductsSoldScreen() {
  const navigation = useNavigation();
  const [tab, setTab] = useState('TODAY');
  const [loading, setLoading] = useState(true);
  const [soldList, setSoldList] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const now = new Date();
      let startDate = new Date();

      if (tab === 'TODAY') {
        startDate.setHours(0, 0, 0, 0);
      } else if (tab === 'WEEKLY') {
        startDate.setDate(now.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
      } else if (tab === 'MONTHLY') {
        startDate.setMonth(now.getMonth() - 1);
        startDate.setHours(0, 0, 0, 0);
      }

      const { data, error } = await supabase
        .from('sold_products')
        .select('*')
        .gte('sold_at', startDate.toISOString())
        .order('sold_at', { ascending: false });

      if (error) throw error;
      setSoldList(data || []);
    } catch (err) {
      console.error('ProductsSoldScreen error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { loadData(); }, [tab]));

  const formatINR = (v) => '₹' + Number(v || 0).toLocaleString('en-IN');
  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <BackIcon size={24} color="#2D2F8E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Products Sold</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Tabs */}
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

      {/* Summary pill */}
      {!loading && soldList.length > 0 && (
        <View style={styles.summaryPill}>
          <Text style={styles.summaryText}>
            {soldList.length} product{soldList.length > 1 ? 's' : ''} sold ·{' '}
            Total: {formatINR(soldList.reduce((s, i) => s + Number(i.price || 0), 0))}
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color="#2D2F8E" style={{ marginTop: 40 }} />
        ) : soldList.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>No products sold in this period.</Text>
          </View>
        ) : (
          soldList.map((item, i) => (
            <View key={item.id} style={styles.card}>
              {/* Image or placeholder */}
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.cardImg} resizeMode="cover" />
              ) : (
                <View style={[styles.cardImg, styles.cardImgPlaceholder]}>
                  <SmartphoneIcon size={26} color="#7986cb" />
                </View>
              )}

              {/* Info */}
              <View style={styles.cardInfo}>
                <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.cardSub}>
                  IMEI: {item.imei || item.sku || '—'}
                </Text>
                <Text style={styles.cardSub}>
                  {item.color ? `${item.color} · ` : ''}{item.category || ''}
                </Text>
                <Text style={styles.cardDate}>{formatDate(item.sold_at)}</Text>
              </View>

              {/* Price + customer */}
              <View style={styles.cardRight}>
               <Text style={styles.cardCustomer} numberOfLines={1}>
  {item.customer_name || 'Walk-in'}
</Text>
{item.sold_by_name ? (
  <Text style={styles.cardSoldBy} numberOfLines={1}>
     🧑‍💼 {item.sold_by_name}
  </Text>
) : null}
                <View style={[styles.payBadge,
                  item.payment_method === 'cash' && styles.payBadgeCash,
                  item.payment_method === 'card' && styles.payBadgeCard,
                ]}>
                  <Text style={styles.payBadgeText}>
                    {item.payment_method?.toUpperCase() || 'UPI'}
                  </Text>
                </View>
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
    paddingHorizontal: 20, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#2D2F8E' },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center', justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row', padding: 16, gap: 8, backgroundColor: '#fff',
  },
  tab: {
    flex: 1, paddingVertical: 10, borderRadius: 8,
    backgroundColor: '#F1F5F9', alignItems: 'center',
  },
  tabActive: { backgroundColor: '#2D2F8E' },
  tabText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  tabTextActive: { color: '#fff' },
  summaryPill: {
    marginHorizontal: 16, marginTop: 12,
    backgroundColor: '#EEF0FF', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  summaryText: { fontSize: 13, fontWeight: '700', color: '#2D2F8E', textAlign: 'center' },
  body: { padding: 16, paddingBottom: 40 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#94A3B8', fontSize: 14, fontWeight: '600' },

  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 16,
    marginBottom: 12, padding: 12,
    elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8,
  },
  cardImg: {
    width: 60, height: 60, borderRadius: 12,
    backgroundColor: '#EEF0FF', marginRight: 12,
  },
  cardImgPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 13, fontWeight: '800', color: '#1E293B', marginBottom: 2 },
  cardSub: { fontSize: 11, color: '#64748B', marginBottom: 1 },
  cardDate: { fontSize: 10, color: '#94A3B8', marginTop: 3 },
  cardRight: { alignItems: 'flex-end', marginLeft: 8 },
  cardPrice: { fontSize: 15, fontWeight: '900', color: '#2D2F8E', marginBottom: 2 },
  cardCustomer: { fontSize: 10, color: '#64748B', marginBottom: 4, maxWidth: 80 },
  cardSoldBy: { fontSize: 10, color: '#2D2F8E', fontWeight: '700', marginBottom: 4, maxWidth: 80 },
  payBadge: {
    backgroundColor: '#EEF0FF', borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  payBadgeCash: { backgroundColor: '#DCFCE7' },
  payBadgeCard: { backgroundColor: '#FEF9C3' },
  payBadgeText: { fontSize: 9, fontWeight: '800', color: '#2D2F8E' },
});