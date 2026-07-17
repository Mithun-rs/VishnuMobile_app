import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, Modal, TextInput, Alert, ActivityIndicator, Image, Share, Platform,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../../../lib/supabase';
import Svg2, { Path } from 'react-native-svg';
import RNPrint from 'react-native-print';

// ─── Icons ──────────────────────────────────────────────────────────────────

const BackIcon = () => (
  <Svg2 width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M12 5l-7 7 7 7" stroke="#2D2F8E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg2>
);

const DownloadIcon = () => (
  <Svg2 width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M12 3v12M8 11l4 4 4-4M3 18h18" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg2>
);

const HistoryIcon = () => (
  <Svg2 width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M12 8v4l3 3" stroke="#2D2F8E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M3.05 11a9 9 0 1018.9 0 9 9 0 00-18.9 0z" stroke="#2D2F8E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg2>
);

// ─── Constants ───────────────────────────────────────────────────────────────

const AVATAR_COLORS = ['#2D2F8E','#3d5af1','#8B5CF6','#06B6D4','#10B981','#F59E0B','#EF4444','#EC4899'];

// ─── PDF HTML Builder ────────────────────────────────────────────────────────

const buildPdfHtml = (categoryName, categoryIcon, brands, allProducts) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const totalProducts = allProducts.length;
  const totalStock = allProducts.reduce((s, p) => s + (Number(p.stockQty) || 0), 0);

  let brandSections = '';

  brands.forEach(brand => {
    const products = allProducts.filter(p => p.brand_id === brand.id);
    if (products.length === 0) return;

    const rows = products.map((p, idx) => `
      <tr style="background:${idx % 2 === 0 ? '#F8F9FF' : '#ffffff'}">
<td>${p.name || '—'}</td>
<td>${p.imei || '—'}</td>
<td>${p.category || '—'}</td>
<td>₹${p.price != null ? Number(p.price).toLocaleString('en-IN') : '—'}</td>
<td>${p.stockQty != null ? p.stockQty : '—'}</td>
      </tr>
    `).join('');

    brandSections += `
      <div class="brand-section">
        <div class="brand-header">
          <span class="brand-dot" style="background:${AVATAR_COLORS[brands.indexOf(brand) % AVATAR_COLORS.length]}">
            ${brand.name.charAt(0).toUpperCase()}
          </span>
          <div>
            <div class="brand-title">${brand.name}</div>
            <div class="brand-sub">${products.length} product${products.length !== 1 ? 's' : ''}</div>
          </div>
        </div>
        <table>
          <thead>
            <tr>
             <th>Product Name</th>
<th>IMEI</th>
<th>Category</th>
<th>Price</th>
<th>Stock Qty</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8"/>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; color: #1E293B; background: #fff; font-size: 12px; }

        /* ── Cover Header ── */
        .cover {
          background: linear-gradient(135deg, #2D2F8E 0%, #3d5af1 100%);
          color: #fff;
          padding: 32px 36px 28px;
        }
        .cover-badge {
          display: inline-block;
          background: rgba(255,255,255,0.18);
          border-radius: 20px;
          padding: 4px 14px;
          font-size: 10px;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          margin-bottom: 12px;
        }
        .cover-title { font-size: 26px; font-weight: 900; letter-spacing: 0.5px; }
        .cover-sub { font-size: 13px; opacity: 0.82; margin-top: 4px; }
        .cover-meta {
          display: flex;
          gap: 32px;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.25);
          font-size: 11px;
          opacity: 0.88;
        }
        .cover-meta div { display: flex; flex-direction: column; gap: 2px; }
        .cover-meta strong { font-size: 18px; font-weight: 900; }

        /* ── Summary ── */
        .summary {
          display: flex;
          gap: 14px;
          padding: 18px 36px;
          background: #F0F2FF;
          border-bottom: 2px solid #DDE0FF;
        }
        .summary-card {
          background: #fff;
          border-radius: 10px;
          padding: 10px 20px;
          flex: 1;
          border-left: 4px solid #2D2F8E;
        }
        .summary-card .val { font-size: 22px; font-weight: 900; color: #2D2F8E; }
        .summary-card .lbl { font-size: 10px; color: #64748B; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.8px; }

        /* ── Brand sections ── */
        .content { padding: 24px 36px; }
        .brand-section { margin-bottom: 32px; }
        .brand-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
          padding-bottom: 10px;
          border-bottom: 2px solid #EEF0FF;
        }
        .brand-dot {
          width: 36px; height: 36px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: #fff;
          font-size: 15px;
          font-weight: 900;
          flex-shrink: 0;
          text-align: center;
          line-height: 36px;
        }
        .brand-title { font-size: 15px; font-weight: 800; color: #1E293B; }
        .brand-sub { font-size: 11px; color: #94A3B8; margin-top: 1px; }

        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        thead tr { background: #2D2F8E; color: #fff; }
        thead th { padding: 9px 10px; text-align: left; font-weight: 700; letter-spacing: 0.4px; white-space: nowrap; }
        tbody td { padding: 8px 10px; border-bottom: 1px solid #EEF0FF; }
        tbody tr:last-child td { border-bottom: none; }

        /* ── Footer ── */
        .footer {
          margin-top: 32px;
          padding-top: 16px;
          border-top: 1px solid #E2E8F0;
          font-size: 10px;
          color: #94A3B8;
          display: flex;
          justify-content: space-between;
        }

        .no-products { color: #94A3B8; font-style: italic; padding: 10px 0; }
      </style>
    </head>
    <body>

      <!-- Cover -->
      <div class="cover">
        <div class="cover-badge">Stock Report</div>
        <div class="cover-title">${categoryIcon} ${categoryName}</div>
        <div class="cover-sub">All Brands · Product Inventory</div>
        <div class="cover-meta">
          <div><strong>${brands.length}</strong><span>Brands</span></div>
          <div><strong>${totalProducts}</strong><span>Products</span></div>
          <div><strong>${totalStock}</strong><span>Total Stock</span></div>
          <div><strong>${dateStr}</strong><span>${timeStr}</span></div>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="summary">
        <div class="summary-card">
          <div class="val">${brands.length}</div>
          <div class="lbl">Total Brands</div>
        </div>
        <div class="summary-card">
          <div class="val">${totalProducts}</div>
          <div class="lbl">Total Products</div>
        </div>
        <div class="summary-card">
          <div class="val">${totalStock.toLocaleString('en-IN')}</div>
          <div class="lbl">Total Stock Units</div>
        </div>
      </div>

      <!-- Brand Sections -->
      <div class="content">
        ${brandSections || '<p class="no-products">No products found for any brand.</p>'}
        <div class="footer">
          <span>Generated on ${dateStr} at ${timeStr}</span>
          <span>Inventory Management System</span>
        </div>
      </div>

    </body>
    </html>
  `;
};

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function BrandsScreen() {
  const navigation = useNavigation();
  const route      = useRoute();
  const { categoryId, categoryName, categoryIcon } = route.params || {};

// Replace your existing state with this
  const [brands, setBrands] = useState([]);
  const [productCounts, setProductCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [brandName, setBrandName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [editingBrand, setEditingBrand] = useState(null); // New
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [selectedShop, setSelectedShop]   = useState('Shop 1');

  useFocusEffect(
    useCallback(() => {
      const getActiveShop = async () => {
        try {
          const savedShop = await AsyncStorage.getItem('selectedShop');
          if (savedShop) {
            setSelectedShop(savedShop);
          }
        } catch (e) {
          console.warn('Failed to load selected shop:', e.message);
        }
      };
      getActiveShop();
      loadAll();
    }, [categoryId])
  );

  const handleShopChange = async (shop) => {
    setSelectedShop(shop);
    try {
      await AsyncStorage.setItem('selectedShop', shop);
      loadAll(); // Reload product counts when shop toggles
    } catch (e) {
      console.warn('Failed to save selected shop:', e.message);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const savedShop = await AsyncStorage.getItem('selectedShop');
      const dbShopVal = savedShop ? savedShop.toLowerCase().replace(/\s+/g, '') : 'shop1';

      const { data: brandsData, error: brandsErr } = await supabase
        .from('brands')
        .select('*')
        .eq('category_id', categoryId)
        .eq('shop', dbShopVal)
        .order('name');
      if (brandsErr) throw brandsErr;

      const { data: products, error: prodErr } = await supabase
        .from('products').select('brand_id').eq('shop', dbShopVal);
      if (prodErr) throw prodErr;

      const countMap = {};
      (products || []).forEach(p => {
        if (p.brand_id) countMap[p.brand_id] = (countMap[p.brand_id] || 0) + 1;
      });
      setBrands(brandsData || []);
      setProductCounts(countMap);
    } catch (e) {
      Alert.alert('Error', 'Failed to load brands.');
    } finally {
      setLoading(false);
    }
  };

  // ── Download PDF ────────────────────────────────────────────────────────────
  const handleDownloadPDF = async () => {
    if (brands.length === 0) {
      Alert.alert('No Brands', 'There are no brands to export.');
      return;
    }

    setDownloading(true);
    try {
      // Fetch all products for every brand in this category at once
      const brand_id = brands.map(b => b.id);

      const savedShop = await AsyncStorage.getItem('selectedShop');
      const dbShopVal = savedShop ? savedShop.toLowerCase().replace(/\s+/g, '') : 'shop1';

      const { data: allProducts, error: prodErr } = await supabase
        .from('products')
        .select('id, name, sku, imei, category, price, "stockQty", brand_id')
        .in('brand_id', brand_id)
        .eq('shop', dbShopVal);

      if (prodErr) throw prodErr;

      const html = buildPdfHtml(categoryName, categoryIcon, brands, allProducts || []);

     

   

    await RNPrint.print({ html });
    } catch (e) {
      console.error('PDF Error:', e);
      Alert.alert('Download Failed', e.message || 'Could not generate the PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  // ── Add Brand ───────────────────────────────────────────────────────────────
// ── Modal Controls ──
  const openEditModal = (brand) => {
    setEditingBrand(brand);
    setBrandName(brand.name);
    setLogoUrl(brand.logo_url || '');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingBrand(null);
    setBrandName('');
    setLogoUrl('');
  };

  // ── Combined Save Logic ──
  const handleSaveBrand = async () => {
    if (!brandName.trim()) { Alert.alert('Validation', 'Brand name is required.'); return; }
    setSaving(true);
    try {
      if (editingBrand) {
        // UPDATE existing brand
        const { error } = await supabase
          .from('brands')
          .update({ name: brandName.trim(), logo_url: logoUrl.trim() || null })
          .eq('id', editingBrand.id);
        if (error) throw error;
      } else {
        const savedShop = await AsyncStorage.getItem('selectedShop');
        const dbShopVal = savedShop ? savedShop.toLowerCase().replace(/\s+/g, '') : 'shop1';

        const { error } = await supabase.from('brands').insert({
          category_id: categoryId, 
          name: brandName.trim(), 
          logo_url: logoUrl.trim() || null,
          shop: dbShopVal,
        });
        if (error) throw error;

        // Log the activity
        await supabase.from('activity_logs').insert({
          action_type: 'ADD',
          entity_type: 'BRAND',
          entity_name: brandName.trim(),
          details: `Added new brand: ${brandName.trim()}`
        });
      }
      closeModal();
      loadAll();
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setSaving(false); }
  };

  // ── Options Menu ──
// ── 1. The Options Menu ──
  const handleLongPress = (brand) => {
    Alert.alert(
      'Manage Brand', 
      `Options for "${brand.name}"`, 
      [
        { text: 'Edit Brand', onPress: () => openEditModal(brand) },
        { 
          text: 'Delete Brand', 
          style: 'destructive', 
          onPress: () => confirmDeleteAlert(brand) // Calls the next alert
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  // ── 2. The Final Confirmation Popup ──
  const confirmDeleteAlert = (brand) => {
    Alert.alert(
      '⚠️ Delete Brand',
      `Are you sure you want to delete "${brand.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Yes, Delete', 
          style: 'destructive', 
          onPress: () => confirmDelete(brand) // Now calls the Supabase delete function
        },
      ]
    );
  };
  // ── 3. The Actual Deletion ──
  const executeDelete = async (brand) => {
    try {
      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', brand.id);

      if (error) throw error;

      // Update the UI list immediately
      setBrands(prev => prev.filter(b => b.id !== brand.id));
      
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const confirmDelete = async (brand) => {
    try {
      const { error } = await supabase.from('brands').delete().eq('id', brand.id);
      if (error) throw error;
      setBrands(prev => prev.filter(b => b.id !== brand.id));

      // Log the activity
      await supabase.from('activity_logs').insert({
        action_type: 'DELETE',
        entity_type: 'BRAND',
        entity_name: brand.name,
        details: `Deleted brand: ${brand.name}`
      });
    } catch (e) { Alert.alert('Error', e.message); }
  };
  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.container}>

      {/* ADD BRAND MODAL */}
    {/* ADD/EDIT MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={closeModal}>
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={closeModal}>
          <TouchableOpacity activeOpacity={1} style={s.sheet}>
            <View style={s.handle} />
            {/* Dynamic Title */}
            <Text style={s.sheetTitle}>{editingBrand ? 'Edit Brand' : 'Add New Brand'}</Text>
            <Text style={s.sheetSub}>Category: {categoryIcon} {categoryName}</Text>
            
            <Text style={s.lbl}>BRAND NAME *</Text>
            <TextInput style={s.inp} placeholder="e.g. Samsung..." placeholderTextColor="#bbb" value={brandName} onChangeText={setBrandName} autoFocus />
            
            <Text style={s.lbl}>LOGO URL (optional)</Text>
            <TextInput style={s.inp} placeholder="https://..." placeholderTextColor="#bbb" value={logoUrl} onChangeText={setLogoUrl} autoCapitalize="none" keyboardType="url" />
            
            <View style={s.btnRow}>
              <TouchableOpacity style={s.cancelBtn} onPress={closeModal}>
                <Text style={s.cancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.7 }]} onPress={handleSaveBrand} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" size="small" /> : (
                  /* Dynamic Button Text */
                  <Text style={s.saveTxt}>{editingBrand ? 'Update Brand' : 'Save Brand'}</Text>
                )}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* HEADER */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <BackIcon />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Brands</Text>
          <Text style={s.headerSub}>{categoryIcon} {categoryName}</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={s.addBtnTxt}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* BREADCRUMB */}
      <View style={s.breadcrumb}>
        <Text style={s.bc}>
          <Text style={s.bcLink}>Stock</Text>
          <Text style={s.bcSep}> › </Text>
          <Text style={s.bcActive}>{categoryName}</Text>
        </Text>
      </View>

      {/* SHOP TOGGLE BAR */}
      <View style={s.toggleContainer}>
        <TouchableOpacity
          style={[s.toggleBtn, selectedShop === 'Shop 1' && s.toggleBtnActive]}
          onPress={() => handleShopChange('Shop 1')}
          activeOpacity={0.8}
        >
          <Text style={[s.toggleBtnText, selectedShop === 'Shop 1' && s.toggleBtnTextActive]}>Shop 1</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.toggleBtn, selectedShop === 'Shop 2' && s.toggleBtnActive]}
          onPress={() => handleShopChange('Shop 2')}
          activeOpacity={0.8}
        >
          <Text style={[s.toggleBtnText, selectedShop === 'Shop 2' && s.toggleBtnTextActive]}>Shop 2</Text>
        </TouchableOpacity>
      </View>

      {/* ── DOWNLOAD BANNER ─────────────────────────────────────────────── */}
      {!loading && brands.length > 0 && (
        <View style={s.downloadBanner}>
          <View>
            <Text style={s.dlBannerTitle}>Download All Products</Text>
            <Text style={s.dlBannerSub}>
              {brands.length} brand{brands.length !== 1 ? 's' : ''} · PDF report
            </Text>
          </View>
          <TouchableOpacity
            style={[s.dlBtn, downloading && { opacity: 0.7 }]}
            onPress={handleDownloadPDF}
            disabled={downloading}
          >
            {downloading
              ? <ActivityIndicator color="#fff" size="small" />
              : (
                <View style={s.dlBtnInner}>
                  <DownloadIcon />
                  <Text style={s.dlBtnTxt}>Download PDF</Text>
                </View>
              )
            }
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color="#2D2F8E" />
          <Text style={s.loadTxt}>Loading brands...</Text>
        </View>
      ) : brands.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyIcon}>🏷️</Text>
          <Text style={s.emptyTitle}>No brands yet</Text>
          <Text style={s.emptySub}>Tap "+ Add" to get started</Text>
          <TouchableOpacity style={s.emptyBtn} onPress={() => setModalVisible(true)}>
            <Text style={s.emptyBtnTxt}>+ Add Brand</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={s.grid}>
            {brands.map((brand, i) => {
              const count  = productCounts[brand.id] || 0;
              const color  = AVATAR_COLORS[i % AVATAR_COLORS.length];
              const letter = brand.name.charAt(0).toUpperCase();
              return (
                <TouchableOpacity
                  key={brand.id}
                  style={s.card}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('AdminProducts', {
                    brandId: brand.id, brandName: brand.name,
                    categoryId, categoryName, categoryIcon,
                  })}
                 onLongPress={() => handleLongPress(brand)} 
                  delayLongPress={500}
                >
                  {brand.logo_url ? (
                    <Image source={{ uri: brand.logo_url }} style={s.logo} resizeMode="contain" />
                  ) : (
                    <View style={[s.avatar, { backgroundColor: color }]}>
                      <Text style={s.avatarLetter}>{letter}</Text>
                    </View>
                  )}
                  <Text style={s.brandName} numberOfLines={1}>{brand.name}</Text>
                  <View style={s.countBadge}>
                    <Text style={s.countTxt}>{count} product{count !== 1 ? 's' : ''}</Text>
                  </View>
                  {categoryName !== 'Mobiles' && (
                    <TouchableOpacity
                      style={s.historyBtn}
                      onPress={() => navigation.navigate('StockHistory', {
                        brandId: brand.id,
                        brandName: brand.name,
                        categoryName: categoryName,
                        categoryIcon: categoryIcon,
                      })}
                    >
                      <HistoryIcon />
                      <Text style={s.historyBtnTxt}>History</Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={s.hint}>Long press a brand to delete or edit</Text>
          <View style={{ height: 30 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA' },

  // Header
  header: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#eee', elevation: 2 },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#1E293B' },
  headerSub: { fontSize: 11, color: '#94A3B8', marginTop: 1 },
  addBtn: { backgroundColor: '#2D2F8E', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  addBtnTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },

  // Breadcrumb
  breadcrumb: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#F8F9FF', borderBottomWidth: 1, borderBottomColor: '#EEF0FF' },
  bc: { fontSize: 12 },
  bcLink: { color: '#94A3B8', fontWeight: '600' },
  bcSep: { color: '#CBD5E1' },
  bcActive: { color: '#2D2F8E', fontWeight: '700' },

  // ── Download Banner ──────────────────────────────────────────────────────
  downloadBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 14, marginBottom: 2,
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12,
    elevation: 3,
    borderLeftWidth: 4, borderLeftColor: '#2D2F8E',
    shadowColor: '#2D2F8E', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
  },
  dlBannerTitle: { fontSize: 13, fontWeight: '800', color: '#1E293B' },
  dlBannerSub:   { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  dlBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#2D2F8E', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    minWidth: 44, justifyContent: 'center',
  },
  dlBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dlBtnTxt:   { color: '#fff', fontWeight: '700', fontSize: 12 },

  // States
  center:   { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadTxt:  { color: '#94A3B8', fontSize: 14 },
  empty:    { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingHorizontal: 32 },
  emptyIcon:  { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
  emptySub:   { fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 24 },
  emptyBtn:   { backgroundColor: '#2D2F8E', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  emptyBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, paddingTop: 16, gap: 12 },
  card: { backgroundColor: '#fff', width: '46%', padding: 18, borderRadius: 16, alignItems: 'center', elevation: 3 },
  avatar: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarLetter: { color: '#fff', fontSize: 26, fontWeight: '900' },
  logo: { width: 60, height: 60, borderRadius: 30, marginBottom: 12, backgroundColor: '#F8F9FF' },
  brandName:  { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 6, textAlign: 'center' },
  countBadge: { backgroundColor: '#EEF0FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  countTxt:   { fontSize: 11, color: '#2D2F8E', fontWeight: '700' },
  hint: { textAlign: 'center', color: '#CBD5E1', fontSize: 11, marginTop: 16 },
  
  // History Button
  historyBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4, 
    marginTop: 10, 
    backgroundColor: '#F0F2FF', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20 
  },
  historyBtnTxt: { fontSize: 11, color: '#2D2F8E', fontWeight: '700' },

  // Modal
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet:      { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36 },
  handle:     { width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 20, fontWeight: '900', color: '#1E293B', marginBottom: 4 },
  sheetSub:   { fontSize: 13, color: '#94A3B8', marginBottom: 20 },
  lbl: { fontSize: 10, color: '#94A3B8', fontWeight: '700', letterSpacing: 1.2, marginBottom: 6, marginTop: 12 },
  inp: { backgroundColor: '#F8F9FF', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#1E293B', borderWidth: 1, borderColor: '#E2E8F0' },
  btnRow:    { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  cancelTxt: { color: '#64748B', fontWeight: '700', fontSize: 14 },
  saveBtn:   { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', backgroundColor: '#2D2F8E' },
  saveTxt:   { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Toggle Bar Styles
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#EEF0FF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#D2D6F6',
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: '#2D2F8E',
    elevation: 2,
    shadowColor: '#2D2F8E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  toggleBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  toggleBtnTextActive: {
    color: '#fff',
  },
});