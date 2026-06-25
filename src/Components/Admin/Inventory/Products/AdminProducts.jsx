import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, Modal, TextInput, Alert, ActivityIndicator,
  Image, Switch,
} from 'react-native';
import { CachedImage } from '../../../../lib/imageUtils';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../../../lib/supabase';
import { uploadToCloudinary } from '../../../../lib/cloudinary';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import Svg2, { Path } from 'react-native-svg';
import Qrcode from '../../../../assets/qr.svg';
import Edit from '../../../../assets/edit.svg';
import Delete from '../../../../assets/delete.svg'
import { Platform, PermissionsAndroid } from 'react-native';
const BackIcon = () => (
  <Svg2 width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M12 5l-7 7 7 7" stroke="#2D2F8E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg2>
);



const EMPTY_FORM = { name: '', sku: '', price: '', marketPrice: '', description: '', color: '',qty:'1' };


export default function AdminProductsScreen() {
  const navigation = useNavigation();
  const route      = useRoute();
  const { brandId, brandName, categoryId, categoryName, categoryIcon } = route.params || {};
  const isMobile = categoryName === 'Mobiles';
  const [products, setProducts]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [imageUri, setImageUri]         = useState(null);
  const [isAvailable, setIsAvailable]   = useState(true);
  const [saving, setSaving]             = useState(false);
  const [uploading, setUploading]       = useState(false);
  const [showScanner, setShowScanner]   = useState(false);


  useFocusEffect(useCallback(() => { loadProducts(); }, [brandId]));

  // Helper: DEBUG version — shows Alert with exact error so we can diagnose
  const logActivity = async (action_type, entity_type, entity_name, details) => {
    try {
      let userId = null;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id || null;
      } catch (authErr) {
        Alert.alert('[DEBUG] Auth Error', authErr?.message || 'Could not get user');
      }

      // Try without user_id first (safest — avoids column-not-found issues)
      const payload = { action_type, entity_type, entity_name, details };

      const { error } = await supabase.from('activity_logs').insert(payload);
      if (error) {
        // Show the real error so we can fix it
        Alert.alert(
          '[DEBUG] Activity Log Failed',
          `Code: ${error.code}\nMessage: ${error.message}\nHint: ${error.hint || 'none'}\nDetails: ${error.details || 'none'}`
        );
      } else {
        Alert.alert('[DEBUG] Activity Log ✅', `Successfully logged: ${action_type} ${entity_name}`);
      }
    } catch (e) {
      Alert.alert('[DEBUG] Unexpected Error', e?.message || 'Unknown error');
    }
  };

  // Upsert qty change into stock_history (inside component to access brandId):
  // Same IST calendar day → accumulate into existing row
  // New IST day           → insert a fresh row
  const upsertStockHistory = async (productId, productName, diff, newQty) => {
    const now    = new Date();
    // IST = UTC + 5h30m. Compute start/end of today in IST expressed as UTC.
    // IST day start in UTC = istDate T00:00 IST = istDate-1 T18:30 UTC
    const IST_MS = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + IST_MS);
    const istDateStr = istNow.toISOString().slice(0, 10); // "YYYY-MM-DD" (IST)

    // Convert IST midnight and IST end-of-day to true UTC for the DB query
    const istDayStartUTC = new Date(`${istDateStr}T00:00:00.000+05:30`).toISOString();
    const istDayEndUTC   = new Date(`${istDateStr}T23:59:59.999+05:30`).toISOString();

    const { data: existing, error: fetchErr } = await supabase
      .from('stock_history')
      .select('id, qty_change')
      .eq('product_id', productId)
      .gte('created_at', istDayStartUTC)
      .lte('created_at', istDayEndUTC)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchErr) { console.warn('upsertStockHistory fetch error:', fetchErr.message); }

    if (existing) {
      // Same IST day — accumulate qty_change
      const accumulated = existing.qty_change + diff;
      await supabase
        .from('stock_history')
        .update({
          qty_change:  accumulated,
          stock_after: newQty,
          event_type:  accumulated > 0 ? 'increased' : 'adjusted',
          notes:       accumulated > 0
            ? `Qty increased by ${accumulated}`
            : `Qty reduced by ${Math.abs(accumulated)}`,
        })
        .eq('id', existing.id);
    } else {
      // New IST day — fresh row; store current UTC timestamp
      await supabase.from('stock_history').insert({
        brand_id:     brandId,
        product_id:   productId,
        product_name: productName,
        qty_change:   diff,
        stock_after:  newQty,
        event_type:   diff > 0 ? 'increased' : 'adjusted',
        notes:        diff > 0
          ? `Qty increased by ${diff}`
          : `Qty reduced by ${Math.abs(diff)}`,
      });
    }

    // Fire-and-forget: log stock change to activity feed (non-blocking)
    const detail = diff > 0
      ? `Stock increased by ${diff} for ${productName}`
      : `Stock reduced by ${Math.abs(diff)} for ${productName}`;
    logActivity('UPDATE', 'STOCK', productName, detail);
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products').select('*').eq('brand_id', brandId).order('created_at', { ascending: false });
      if (error) throw error;
      setProducts(data || []);
    } catch (e) {
      Alert.alert('Error', 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setImageUri(null);
    setIsAvailable(true);
    setModalVisible(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || '',
      sku: product.sku || '',
      price: String(product.price || ''),
      marketPrice: String(product.marketPrice || ''),
      description: product.description || '',
      color: product.color || '',
      qty: String(product.stockQty ?? 1),
    });

    setImageUri(product.image || null);
    setIsAvailable(product.available !== false);
    setModalVisible(true);
  };

  const handlePickImage = (useCamera) => {
    const opts = {
      mediaType: 'photo',
      quality: 0.7,       // 0.7 → ~40% smaller file, still looks great
      maxWidth: 1080,     // pre-shrink on device before upload
      maxHeight: 1080,
      includeBase64: false,
    };
    const fn = useCamera ? launchCamera : launchImageLibrary;
    fn(opts, (res) => {
      if (res.didCancel || res.errorCode) return;
      if (res.assets && res.assets.length > 0) setImageUri(res.assets[0].uri);
    });
  };

 const isValidIMEI = (value) => {
  if (!/^\d{15}$/.test(value)) return false;
  // Luhn algorithm check
  let sum = 0;
  for (let i = 0; i < 15; i++) {
    let digit = parseInt(value[i]);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
};

const handleScannerSuccess = (e) => {
  if (!e?.data) return;
  const scanned = e.data.trim();

  // ✅ Only accept if it passes IMEI validation
  if (isValidIMEI(scanned)) {
    setForm(f => ({ ...f, sku: scanned }));
    setShowScanner(false);
  }
  // else: ignore — scanner will reactivate and try again
};



const handleSave = async () => {
  if (!form.name.trim()) { Alert.alert('Validation', 'Product name is required.'); return; }
  if (isMobile && !form.sku.trim()) { Alert.alert('Validation', 'IMEI / SKU is required.'); return; }
  if (!form.price.trim()) { Alert.alert('Validation', 'Price is required.'); return; }


  // Check duplicate in products table (mobiles only)
  if (isMobile) {
    try {
      let query = supabase.from('products').select('id, name').eq('sku', form.sku.trim());
      if (editingProduct) query = query.neq('id', editingProduct.id);
      const { data: activeCheck, error: activeError } = await query.maybeSingle();
      if (activeError) throw activeError;
      if (activeCheck) {
        Alert.alert('⚠️ IMEI Already Listed', `This IMEI is already added as "${activeCheck.name}".`);
        return;
      }
    } catch (e) {
      Alert.alert('Error', 'Could not verify IMEI in products. Please try again.');
      return;
    }
  }

  setSaving(true);
  try {
    let imageUrl = editingProduct?.image || null;
    if (imageUri && imageUri !== editingProduct?.image) {
      setUploading(true);
      try { imageUrl = await uploadToCloudinary(imageUri); }
      catch (e) { Alert.alert('Image Upload Failed', e.message + '\n\nSaving without image.'); }
      finally { setUploading(false); }
    }

    const uniqueSku = isMobile
      ? form.sku.trim()
      : `ACC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const payload = {
      name:        form.name.trim(),
      sku:         uniqueSku,
      imei:        isMobile ? form.sku.trim() : null,
      price:       parseFloat(form.price) || 0,
      marketPrice: parseFloat(form.marketPrice) || 0,
      stockQty:    isMobile ? 1 : (parseInt(form.qty) || 1),
      description: form.description.trim(),
      color:       form.color.trim(),
      image:       imageUrl,
      available:   isAvailable,
      brand_id:    brandId,
      category:    categoryName,
      currency:    '₹',
    };

    if (editingProduct) {
      // ── UPDATE ──────────────────────────────────────────────
      const { error } = await supabase.from('products').update(payload).eq('id', editingProduct.id);
      if (error) throw error;

      // Log qty change only if qty actually changed
      const oldQty = Number(editingProduct.stockQty) || 0;
      const newQty = isMobile ? 1 : (parseInt(form.qty) || 1);
      const diff   = newQty - oldQty;

      if (diff !== 0) {
        await upsertStockHistory(editingProduct.id, form.name.trim(), diff, newQty);
      }

    } else {
      // ── INSERT ──────────────────────────────────────────────
      const { data: inserted, error } = await supabase
        .from('products').insert(payload).select().single();
      if (error) throw error;

      await supabase.from('stock_history').insert({
        brand_id:     brandId,
        product_id:   inserted.id,
        product_name: form.name.trim(),
        qty_change:   isMobile ? 1 : (parseInt(form.qty) || 1),
        stock_after:  isMobile ? 1 : (parseInt(form.qty) || 1),
        event_type:   'added',
        notes:        'Product first added to inventory',
      });

      // Fire-and-forget: log product add to activity feed (non-blocking)
      logActivity('ADD', 'PRODUCT', form.name.trim(), `Added new product: ${form.name.trim()}`);
    }

    setModalVisible(false);
    loadProducts();
    Alert.alert('✅ Success', `Product ${editingProduct ? 'updated' : 'added'} successfully!`);
  } catch (e) {
    Alert.alert('Error', e.message || 'Failed to save product.');
  } finally {
    setSaving(false);
  }
};

  const handleDelete = (product) => {
  Alert.alert('Delete Product', `Delete "${product.name}"?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => {
      try {
        // Delete stock_history rows for this product first
        const { error: histError } = await supabase
          .from('stock_history')
          .delete()
          .eq('product_id', product.id);

        if (histError) throw histError;

        // Then delete the product itself
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', product.id);

        if (error) throw error;

        // Clean up ALL activity_logs entries for this product
        // (removes ADD/UPDATE entries so it vanishes from the home feed)
        try {
          await supabase
            .from('activity_logs')
            .delete()
            .eq('entity_type', 'PRODUCT')
            .eq('entity_name', product.name);
        } catch (logCleanErr) {
          console.warn('[ActivityLog] Cleanup failed:', logCleanErr?.message);
        }

        setProducts(prev => prev.filter(p => p.id !== product.id));
        Alert.alert('✅ Deleted', `"${product.name}" has been removed.`);
      } catch (e) {
        console.log('DELETE ERROR:', JSON.stringify(e, null, 2));
        Alert.alert('Error', e.message || JSON.stringify(e));
      }
    }},
  ]);
};

  const isBusy = saving || uploading;

  return (
    <SafeAreaView style={s.container}>

      {/* ADD/EDIT PRODUCT MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={s.overlay}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => !isBusy && setModalVisible(false)} />
          <View style={s.sheet}>
            <View style={s.handle} />
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={s.sheetTitle}>{editingProduct ? 'Edit Product' : 'Add Product'}</Text>
              <Text style={s.sheetSub}>{categoryIcon} {categoryName} › {brandName}</Text>

              <Text style={s.lbl}>PRODUCT NAME *</Text>
              <TextInput style={s.inp} placeholder="e.g. iPhone 15 Pro Max" placeholderTextColor="#bbb" value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} editable={!isBusy} />

              {isMobile ? (
  <>
    <Text style={s.lbl}>IMEI / SKU *</Text>
    <View style={s.skuRow}>
      <TextInput
        style={[s.inp, { flex: 1, marginBottom: 0 }]}
        placeholder="IMEI or barcode number"
        placeholderTextColor="#bbb"
        value={form.sku}
        onChangeText={v => setForm(f => ({ ...f, sku: v }))}
        editable={!isBusy}
        keyboardType="numeric"
      />
      <TouchableOpacity
        style={s.qrBtn}
        onPress={() => setShowScanner(true)}
        disabled={isBusy}
      >
        <Qrcode width={22} height={22} fill="#000000ff" />
      </TouchableOpacity>
    </View>
  </>
) : (
<>
  <Text style={s.lbl}>QUANTITY *</Text>
  <View style={s.stepperRow}>
    <TouchableOpacity
      style={s.stepperBtn}
      onPress={() => setForm(f => ({ ...f, qty: String(Math.max(1, (parseInt(f.qty) || 1) - 1) ) }))}
      disabled={isBusy}
    >
      <Text style={s.stepperBtnTxt}>−</Text>
    </TouchableOpacity>

    <TextInput
      style={s.stepperInput}
      keyboardType="number-pad"
      value={form.qty}
      onChangeText={v => {
        const n = parseInt(v);
        setForm(f => ({ ...f, qty: isNaN(n) ? '1' : String(Math.max(1, n)) }));
      }}
      editable={!isBusy}
      textAlign="center"
    />

    <TouchableOpacity
      style={s.stepperBtn}
      onPress={() => setForm(f => ({ ...f, qty: String((parseInt(f.qty) || 1) + 1) }))}
      disabled={isBusy}
    >
      <Text style={s.stepperBtnTxt}>+</Text>
    </TouchableOpacity>
  </View>
</>
)}

              <Text style={s.lbl}>SELLING PRICE (₹) *</Text>
              <TextInput style={s.inp} placeholder="0.00" placeholderTextColor="#bbb" keyboardType="decimal-pad" value={form.price} onChangeText={v => setForm(f => ({ ...f, price: v }))} editable={!isBusy} />

              <Text style={s.lbl}>MARKET PRICE (₹)</Text>
              <TextInput style={s.inp} placeholder="0.00" placeholderTextColor="#bbb" keyboardType="decimal-pad" value={form.marketPrice} onChangeText={v => setForm(f => ({ ...f, marketPrice: v }))} editable={!isBusy} />

             

              <Text style={s.lbl}>COLOR / VARIANT</Text>
              <TextInput style={s.inp} placeholder="e.g. Black 256GB" placeholderTextColor="#bbb" value={form.color} onChangeText={v => setForm(f => ({ ...f, color: v }))} editable={!isBusy} />

              <Text style={s.lbl}>DESCRIPTION</Text>
              <TextInput style={[s.inp, s.textarea]} placeholder="Product details..." placeholderTextColor="#bbb" multiline numberOfLines={3} value={form.description} onChangeText={v => setForm(f => ({ ...f, description: v }))} editable={!isBusy} />

              <Text style={s.lbl}>PRODUCT IMAGE</Text>
              <View style={s.imgRow}>
                <TouchableOpacity style={s.imgBtn} onPress={() => handlePickImage(true)} disabled={isBusy}>
                  <Text style={s.imgBtnIcon}>📷</Text>
                  <Text style={s.imgBtnTxt}>Camera</Text>
                  <Text style={{ color: 'black', fontSize: 12 }}> Take Photo</Text>
                </TouchableOpacity>
                <Text style={{ color: 'black', fontSize: 12, marginLeft: 8 }}>OR</Text>
                <TouchableOpacity style={s.imgBtn} onPress={() => handlePickImage(false)} disabled={isBusy}>
                  <Text style={s.imgBtnIcon}>🖼️</Text>
                  <Text style={s.imgBtnTxt}>Gallery</Text>
                  <Text style={{ color: 'black', fontSize: 12 }}> Upload</Text>
                </TouchableOpacity>
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={s.imgPreview} resizeMode="cover" />
                ) : null}
              </View>
              {uploading && <ActivityIndicator color="#2D2F8E" style={{ marginTop: 8 }} />}

              <View style={s.toggleRow}>
                <Text style={s.toggleLbl}>Available in Store</Text>
                <Switch value={isAvailable} onValueChange={setIsAvailable} trackColor={{ false: '#ddd', true: '#2D2F8E' }} thumbColor="#fff" disabled={isBusy} />
              </View>

              <View style={s.btnRow}>
                <TouchableOpacity style={s.cancelBtn} onPress={() => setModalVisible(false)} disabled={isBusy}>
                  <Text style={s.cancelTxt}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.saveBtn, isBusy && { opacity: 0.7 }]} onPress={handleSave} disabled={isBusy}>
                  {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.saveTxt}>{editingProduct ? 'Update' : 'Save Product'}</Text>}
                </TouchableOpacity>
              </View>
              <View style={{ height: 24 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* BARCODE SCANNER MODAL */}
{/* BARCODE SCANNER MODAL */}
{isMobile && (
  <Modal
    visible={showScanner}
    transparent={false}
    animationType="slide"
    onRequestClose={() => setShowScanner(false)}
  >
    <View style={s.scannerContainer}>
      <View style={s.scannerHeader}>
        <TouchableOpacity onPress={() => setShowScanner(false)}>
          <Text style={s.scannerClose}>Cancel</Text>
        </TouchableOpacity>
        <Text style={s.scannerTitle}>Scan IMEI / Barcode</Text>
        <View style={{ width: 60 }} />
      </View>
      <QRCodeScanner
        onRead={handleScannerSuccess}
        vibrate={false}
        reactivate={true}
        reactivateTimeout={2000}
        flashMode={RNCamera.Constants.FlashMode.auto}
        showMarker={true}
        topContent={
          <Text style={s.scannerInstruction}>Point camera at the IMEI barcode</Text>
        }
        cameraStyle={{ height: '100%' }}
        cameraProps={{
          barCodeTypes: [
            RNCamera.Constants.BarCodeType.code128,
            RNCamera.Constants.BarCodeType.interleaved2of5,
          ],
        }}
      />
    </View>
  </Modal>
)}

      {/* HEADER */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <BackIcon />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Products</Text>
          <Text style={s.headerSub}>{brandName}</Text>
        </View>
        <TouchableOpacity style={s.addProdBtn} onPress={openAddModal}>
          <Text style={s.addProdBtnTxt}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* BREADCRUMB */}
      <View style={s.breadcrumb}>
        <Text style={s.bc}>
          <Text style={s.bcLink}>Stock</Text>
          <Text style={s.bcSep}> › </Text>
          <Text style={s.bcLink}>{categoryName}</Text>
          <Text style={s.bcSep}> › </Text>
          <Text style={s.bcActive}>{brandName}</Text>
        </Text>
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color="#2D2F8E" />
          <Text style={s.loadTxt}>Loading products...</Text>
        </View>
      ) : products.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyIcon}>📦</Text>
          <Text style={s.emptyTitle}>No products yet</Text>
          <Text style={s.emptySub}>Tap "+ Add" to add the first product under {brandName}</Text>
          <TouchableOpacity style={s.emptyBtn} onPress={openAddModal}>
            <Text style={s.emptyBtnTxt}>+ Add Product</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          <View style={{ paddingHorizontal: 16, paddingTop: 14 }}>
          {products.map(product => (
  <View key={product.id} style={s.productCard}>
    
    {/* Image */}
    <CachedImage
      uri={product.image}
      style={s.productImg}
      resizeMode="cover"
      thumbWidth={200}
      thumbHeight={200}
      fallback={<Text style={{ fontSize: 30 }}>📱</Text>}
    />

    {/* Info */}
    <View style={s.productInfo}>
      {/* Availability badge */}
      

      <Text style={s.productName} numberOfLines={2}>{product.name}</Text>

      {/* Color / variant */}
      {product.color ? (
        <Text style={s.productVariant}>· {product.color}</Text>
      ) : null}

      {/* IMEI */}
      <Text style={s.productSku}>IMEI: {product.imei || product.sku || '—'}</Text>

      {/* Price row */}
      <View style={s.priceRow}>
        <Text style={s.productPrice}>₹{Number(product.price).toLocaleString('en-IN')}</Text>
        {product.marketPrice ? (
          <Text style={s.productMrp}>₹{Number(product.marketPrice).toLocaleString('en-IN')}</Text>
        ) : null}
      </View>
    </View>

    {/* Actions */}
    <View style={s.actions}>
      <TouchableOpacity style={s.editBtn} onPress={() => openEditModal(product)}>
        <Edit width={16} height={16} fill="#2D2F8E" stroke="#2D2F8E" />
      </TouchableOpacity>
      <TouchableOpacity style={s.deleteBtn} onPress={() => handleDelete(product)}>
        <Delete width={16} height={16} />
      </TouchableOpacity>
    </View>

  </View>
))}
          </View>
        </ScrollView>
      )}

      {/* FAB */}
      {products.length > 0 && (
        <TouchableOpacity style={s.fab} onPress={openAddModal} activeOpacity={0.85}>
          <Text style={s.fabTxt}>+</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  stepperRow: {
  flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#E2E8F0',
  borderRadius: 12,
  overflow: 'hidden',
  backgroundColor: '#F8F9FF',
  alignSelf: 'flex-start',
},
stepperBtn: {
  width: 44,
  height: 44,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#F8F9FF',
},
stepperBtnTxt: {
  fontSize: 22,
  color: '#2D2F8E',
  fontWeight: '600',
  lineHeight: 26,
},
stepperInput: {
  width: 56,
  height: 44,
  fontSize: 16,
  fontWeight: '700',
  color: '#1E293B',
  textAlign: 'center',
  borderLeftWidth: 0.5,
  borderRightWidth: 0.5,
  borderColor: '#E2E8F0',
  backgroundColor: '#fff',
  padding: 0,
},
  container: { flex: 1, backgroundColor: '#F5F6FA' },
  header: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#eee', elevation: 2 },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#1E293B' },
  headerSub: { fontSize: 11, color: '#94A3B8', marginTop: 1 },
  addProdBtn: { backgroundColor: '#2D2F8E', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  addProdBtnTxt: { color: '#fff', fontSize: 13, fontWeight: '700' },
  breadcrumb: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#F8F9FF', borderBottomWidth: 1, borderBottomColor: '#EEF0FF' },
  bc: { fontSize: 12 },
  bcLink: { color: '#94A3B8', fontWeight: '600' },
  bcSep: { color: '#CBD5E1' },
  bcActive: { color: '#2D2F8E', fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadTxt: { color: '#94A3B8', fontSize: 14 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
  emptySub: { fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 24 },
  emptyBtn: { backgroundColor: '#2D2F8E', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  emptyBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Product cards
productCard: {
  backgroundColor: '#fff',
  borderRadius: 16,
  marginBottom: 12,
  flexDirection: 'row',
  overflow: 'hidden',
  borderWidth: 0.5,
  borderColor: '#E4E7F2',
  elevation: 2,
  alignItems: 'stretch',
},
productImg: {
  width: 90,
  backgroundColor: '#E8ECFF',
  alignSelf: 'stretch',
},
noImg: {
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 110,
},
productInfo: {
  flex: 1,
  padding: 12,
  gap: 3,
  justifyContent: 'center',
},
badge: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 5,
  alignSelf: 'flex-start',
  paddingHorizontal: 8,
  paddingVertical: 3,
  borderRadius: 6,
  marginBottom: 4,
},
badgeGreen:  { backgroundColor: '#DCFCE7' },
badgeOrange: { backgroundColor: '#FEF3C7' },
badgeDot: { width: 5, height: 5, borderRadius: 3 },
badgeDotGreen:  { backgroundColor: '#16A34A' },
badgeDotOrange: { backgroundColor: '#D97706' },
badgeTxt: { fontSize: 10, fontWeight: '600' },
badgeTxtGreen:  { color: '#16A34A' },
badgeTxtOrange: { color: '#D97706' },
productName: {
  fontSize: 14,
  fontWeight: '700',
  color: '#111827',
  lineHeight: 19,
},
productVariant: {
  fontSize: 11,
  color: '#6B7280',
  fontWeight: '500',
},
productSku: {
  fontSize: 10,
  color: '#9CA3AF',
  fontFamily: 'monospace',
  letterSpacing: 0.3,
},
priceRow: {
  flexDirection: 'row',
  alignItems: 'baseline',
  gap: 8,
  marginTop: 4,
},
productPrice: {
  fontSize: 16,
  fontWeight: '800',
  color: '#1A1D6E',
},
productMrp: {
  fontSize: 11,
  color: '#9CA3AF',
  textDecorationLine: 'line-through',
},
actions: {
  justifyContent: 'center',
  paddingHorizontal: 10,
  gap: 10,
  borderLeftWidth: 0.5,
  borderLeftColor: '#E4E7F2',
},
editBtn: {
  width: 36, height: 36,
  backgroundColor: '#EEF0FF',
  borderRadius: 10,
  alignItems: 'center',
  justifyContent: 'center',
},
deleteBtn: {
  width: 36, height: 36,
  backgroundColor: '#FEE2E2',
  borderRadius: 10,
  alignItems: 'center',
  justifyContent: 'center',
},

  // FAB
  fab: { position: 'absolute', bottom: 24, right: 20, backgroundColor: '#2D2F8E', width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 6 },
  fabTxt: { color: '#fff', fontSize: 28, fontWeight: '700', lineHeight: 32 },

  // Modal / Sheet
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  handle: { width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 20, fontWeight: '900', color: '#1E293B', marginBottom: 4 },
  sheetSub: { fontSize: 13, color: '#94A3B8', marginBottom: 8 },
  lbl: { fontSize: 10, color: '#94A3B8', fontWeight: '700', letterSpacing: 1.2, marginBottom: 6, marginTop: 14 },
  inp: { backgroundColor: '#F8F9FF', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#1E293B', borderWidth: 1, borderColor: '#E2E8F0' },
  textarea: { height: 80, textAlignVertical: 'top' },
  imgRow: { flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 4 },
  imgBtn: { backgroundColor: '#F8F9FF', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', gap: 4 },
  imgBtnIcon: { fontSize: 22 },
  imgBtnTxt: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  imgPreview: { width: 60, height: 60, borderRadius: 10 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  toggleLbl: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  cancelTxt: { color: '#64748B', fontWeight: '700', fontSize: 14 },
  saveBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', backgroundColor: '#2D2F8E' },
  saveTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // IMEI scanner row
  skuRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qrBtn: {
    width: 46, height: 46, backgroundColor: '#F8F9FF', borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  qrBtnIcon: { fontSize: 22, color: '#2D2F8E' },

  // Barcode scanner screen
  scannerContainer: { flex: 1, backgroundColor: '#000' },
  scannerHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#111', padding: 20, paddingTop: 48,
  },
  scannerClose: { color: '#fff', fontSize: 16, fontWeight: '600' },
  scannerTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  scannerInstruction: { fontSize: 15, color: '#fff', padding: 20, textAlign: 'center' },
});
