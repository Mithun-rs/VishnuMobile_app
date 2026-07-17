import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Image,
  Switch,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import Person from '../../../../assets/person.svg';
import BackArrow from '../../../../assets/back-arrow.svg';
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from "react-native-image-picker";
import { supabase } from "../../../../lib/supabase";
import { uploadToCloudinary } from "../../../../lib/cloudinary";
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Svg2, { Path, Circle, Polyline, Line } from 'react-native-svg';
import Qrcode from '../../../../assets/qr.svg';
import DownArrow from '../../../../assets/down-arrow.svg';
import Upload from '../../../../assets/upload.svg';
import Save from '../../../../assets/save.svg'
const CURRENCIES = [
  { symbol: "₹", label: "INR - Indian Rupee" },
  { symbol: "$", label: "USD - US Dollar" },
  { symbol: "€", label: "EUR - Euro" },
  { symbol: "£", label: "GBP - British Pound" },
];

export default function AddProductScreen() {
  const navigation = useNavigation();

  const [productName, setProductName]     = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sku, setSku]                     = useState("");
  const [currency, setCurrency]           = useState(CURRENCIES[0]);
  const [marketPrice, setMarketPrice]     = useState("");
  const [sellingPrice, setSellingPrice]   = useState("");
  const [discount, setDiscount]           = useState("");
  const [stockQty, setStockQty]           = useState("");
  const [color, setColor]                 = useState("");
  const [storage, setStorage]             = useState("");
  const [description, setDescription]     = useState("");
  const [imageUri, setImageUri]           = useState(null);   // local URI
  const [isAvailable, setIsAvailable]     = useState(true);
  const [shop, setShop]                   = useState("shop1");
  const [showShopDropdown, setShowShopDropdown] = useState(false);

  const [categories, setCategories]       = useState([]);
  const [showCatModal, setShowCatModal]   = useState(false);
  const [showScanner, setShowScanner]     = useState(false);
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [uploading, setUploading]         = useState(false); // image uploading
  const [saving, setSaving]               = useState(false);  // saving to Supabase
  const handleLogout = () => {
      setProfileMenuVisible(false);
      Alert.alert('Logout', 'Are you sure you want to logout?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => signOut() },
      ]);
    };
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
  // ── Load categories from Supabase ──────────────────────────────────
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const savedShop = await AsyncStorage.getItem('selectedShop');
        const dbShopVal = savedShop ? savedShop.toLowerCase().replace(/\s+/g, '') : 'shop1';

        const { data, error } = await supabase
          .from('categories')
          .select('id, name, icon')
          .eq('shop', dbShopVal)
          .order('name');

        if (error) throw error;
        setCategories(data || []);
      } catch (e) {
        console.warn('loadCategories error:', e.message);
        // Fallback
        setCategories([
          { id: 'default_1', name: 'Smartphones', icon: '📱' },
          { id: 'default_2', name: 'Accessories', icon: '🎧' },
        ]);
      }
    };
    loadCategories();
  }, []);

  // ── Set default shop from AsyncStorage selected shop ─────────────────
  useEffect(() => {
    const getActiveShop = async () => {
      try {
        const savedShop = await AsyncStorage.getItem('selectedShop');
        if (savedShop) {
          setShop(savedShop.toLowerCase().replace(/\s+/g, ''));
        }
      } catch (e) {}
    };
    getActiveShop();
  }, []);

  // ── Pick image from gallery ────────────────────────────────────────
  const handlePickImage = () => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.8, includeBase64: false },
      (response) => {
        if (response.didCancel || response.errorCode) return;
        if (response.assets && response.assets.length > 0) {
          setImageUri(response.assets[0].uri);
        }
      }
    );
  };

  // ── Save product to Supabase ───────────────────────────────────────
  const handleSave = async () => {
      if (!productName.trim())  { Alert.alert('Validation', 'Product name is required.'); return; }
      if (!sku.trim())           { Alert.alert('Validation', 'IMEI / SKU is required.'); return; }
      if (!sellingPrice.trim()) { Alert.alert('Validation', 'Selling price is required.'); return; }

    // ── Check for duplicate SKU ───────────────────────────────────────
    try {
      const { data: existing, error: checkError } = await supabase
        .from('products')
        .select('id, name')
        .or(`sku.eq.${sku.trim()},imei.eq.${sku.trim()}`)
        .limit(1);

      if (checkError) throw checkError;

      if (existing && existing.length > 0) {
        Alert.alert('Duplicate SKU', `This IMEI/SKU "${sku.trim()}" already exists for product "${existing[0].name}".\n\nPlease use a different IMEI/SKU.`);
        return;
      }
    } catch (e) {
      console.warn('SKU check error:', e.message);
    }

    setSaving(true);
    try {
      // ── Step 1: Upload image to Cloudinary if selected ─────────────
      let imageUrl = null;
      if (imageUri) {
        setUploading(true);
        try {
          imageUrl = await uploadToCloudinary(imageUri);
        } catch (e) {
          Alert.alert('Image Upload Failed', e.message + '\n\nProduct will be saved without image.');
        } finally {
          setUploading(false);
        }
      }

      // ── Step 2: Insert product into Supabase ───────────────────────
      const qty = parseInt(stockQty) || 0;

      const { error } = await supabase.from('products').insert({
        name:          productName.trim(),
        sku:           sku.trim(),
        imei:          sku.trim(),
        currency:      currency.symbol,
        price:         parseFloat(sellingPrice) || 0,
        marketPrice:   parseFloat(marketPrice)  || 0,
        discount:      parseFloat(discount)      || 0,
        image:         imageUrl,
        description:   description.trim(),
        color:         color.trim(),
        storage:       storage.trim(),
        stockQty:      qty,
        available:     isAvailable,
        shop:          (shop || 'shop1').trim(),
        // status is auto-set by the DB trigger based on stockQty
      });

      if (error) throw error;

      Alert.alert('✅ Success', 'Product saved successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);

    } catch (e) {
      console.error('handleSave error:', e.message);
      Alert.alert('Error', e.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setProductName(''); setSelectedCategory(null); setSku('');
    setCurrency(CURRENCIES[0]); setMarketPrice(''); setSellingPrice('');
    setDiscount(''); setStockQty(''); setColor(''); setStorage('');
    setDescription(''); setImageUri(null); setIsAvailable(true);
    setShop('shop1');
  };

  const handleScannerSuccess = (e) => {
    setSku(e.data);
    setShowScanner(false);
  };

  const isBusy = saving || uploading;

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
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <BackArrow width={20} height={20} fill="#2D2F8E" stroke="#2D2F8E" />
        </TouchableOpacity>
        <Text style={styles.title}>Shop Manager</Text>
       <TouchableOpacity style={styles.iconBtn} onPress={() => setProfileMenuVisible(true)}>
                   <ProfileIcon size={18} color="#fff" />
                 </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.section}>
          <Text style={styles.subTitle}>CATALOG CONTROL</Text>
          <Text style={styles.mainTitle}>Add Product</Text>
        </View>

        {/* ── PRODUCT SPECIFICATIONS ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🏷️</Text>
            <Text style={styles.cardTitle}>Product Specifications</Text>
          </View>

          <Text style={styles.label}>PRODUCT NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Product Name"
            placeholderTextColor="#cdcdcdff"
            value={productName}
            onChangeText={setProductName}
            editable={!isBusy}
          />

          <Text style={styles.label}>IMEI / SKU</Text>

          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="UPC-12345678"
              placeholderTextColor="#cdcdcdff"
              value={sku}
              onChangeText={setSku}
              editable={!isBusy}
            />
            <TouchableOpacity style={styles.qrBox} onPress={() => setShowScanner(true)}>
              <Qrcode width={22} height={22} fill="#000000ff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>MARKET PRICE</Text>
          <View style={styles.priceInputBox}>
            <Text style={styles.currencySymbol}>{currency.symbol}</Text>
            <TextInput
              style={styles.priceInput}
              placeholder="0.00"
              placeholderTextColor="#cdcdcdff"
              keyboardType="decimal-pad"
              value={marketPrice}
              onChangeText={setMarketPrice}
              editable={!isBusy}
            />
          </View>

          <Text style={styles.label}>SELLING PRICE</Text>
          <View style={[styles.priceInputBox, styles.priceInputBoxActive]}>
            <Text style={[styles.currencySymbol, { color: '#000' }]}>{currency.symbol}</Text>
            <TextInput
              style={[styles.priceInput, { color: '#000' }]}
              placeholder="0.00"
              placeholderTextColor="#cdcdcdff"
              keyboardType="decimal-pad"
              value={sellingPrice}
              onChangeText={setSellingPrice}
              editable={!isBusy}
            />
          </View>

          <Text style={styles.label}>DISCOUNT (%)</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor="#000"
            keyboardType="decimal-pad"
            value={discount}
            onChangeText={setDiscount}
            editable={!isBusy}
          />

          <Text style={styles.label}>STOCK QUANTITY</Text>
          <TextInput
            style={styles.input}
            placeholder="Units in hand"
            placeholderTextColor="#cdcdcdff"
            keyboardType="number-pad"
            value={stockQty}
            onChangeText={setStockQty}
            editable={!isBusy}
          />
        </View>

        {/* ── PRODUCT VARIANTS ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
           
            <Text style={styles.cardTitle}>Product Variants</Text>
          </View>

          <Text style={styles.label}>COLOR</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Product Color"
            placeholderTextColor="#cdcdcdff"
            value={color}
            onChangeText={setColor}
            editable={!isBusy}
          />

          <Text style={styles.label}>SHOP NUMBER</Text>
          <TouchableOpacity
            style={[styles.dropdown, showShopDropdown && styles.dropdownOpen]}
            onPress={() => setShowShopDropdown(!showShopDropdown)}
            disabled={isBusy}
            activeOpacity={0.8}
          >
            <Text style={styles.dropdownSelected}>
              {shop === 'shop1' ? 'Shop 1' : shop === 'shop2' ? 'Shop 2' : 'Select Shop'}
            </Text>
            <DownArrow width={14} height={14} fill="#888" />
          </TouchableOpacity>

          {showShopDropdown && (
            <View style={styles.dropdownList}>
              <TouchableOpacity
                style={[styles.dropdownItem, shop === 'shop1' && styles.dropdownItemActive]}
                onPress={() => {
                  setShop('shop1');
                  setShowShopDropdown(false);
                }}
              >
                <Text style={[styles.dropdownItemText, shop === 'shop1' && styles.dropdownItemTextActive]}>
                  Shop 1
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dropdownItem, shop === 'shop2' && styles.dropdownItemActive]}
                onPress={() => {
                  setShop('shop2');
                  setShowShopDropdown(false);
                }}
              >
                <Text style={[styles.dropdownItemText, shop === 'shop2' && styles.dropdownItemTextActive]}>
                  Shop 2
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.label}>DESCRIPTION</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter product specifications"
            placeholderTextColor="#cdcdcdff"
            value={storage}
            onChangeText={setStorage}
            editable={!isBusy}
          />
        </View>

        {/* ── VISUAL ASSETS ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            
            <Text style={styles.cardTitle}>Visual Assets</Text>
          </View>

          <TouchableOpacity style={styles.uploadBox} onPress={handlePickImage} activeOpacity={0.8} disabled={isBusy}>
            {uploading ? (
              <View style={styles.uploadPlaceholder}>
                <ActivityIndicator size="large" color="#3d5af1" />
                <Text style={styles.uploadText}>Uploading to Cloudinary...</Text>
              </View>
            ) : imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Upload width={32} height={32} fill="#888" />
                <Text style={styles.uploadText}>Tap to pick image</Text>
                <Text style={styles.uploadHint}>PNG, JPG UP TO 10MB · Uploaded to Cloudinary</Text>
              </View>
            )}
          </TouchableOpacity>

          {imageUri && !uploading && (
            <TouchableOpacity onPress={() => setImageUri(null)} style={styles.removeImageBtn}>
              <Text style={styles.removeImageText}>✕ Remove Image</Text>
            </TouchableOpacity>
          )}

          <Text style={[styles.label, { marginTop: 14 }]}>PRODUCT DESCRIPTION</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter detailed technical specifications and features..."
            placeholderTextColor="#cdcdcdff"
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
            editable={!isBusy}
          />

          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>Availability Status</Text>
              <Text style={styles.toggleSub}>Toggle product visibility in store</Text>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={setIsAvailable}
              trackColor={{ false: '#ddd', true: '#3d5af1' }}
              thumbColor="#fff"
              disabled={isBusy}
            />
          </View>
        </View>

        {/* BUTTONS */}
        <TouchableOpacity style={[styles.saveBtn, isBusy && { opacity: 0.7 }]} onPress={handleSave} activeOpacity={0.85} disabled={isBusy}>
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Save width={20} height={20} fill="#fff" />
              <Text style={styles.saveBtnText}>Save Product</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.bottomRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()} disabled={isBusy}>
            <Text style={styles.cancelText}>✕  Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resetBtn} onPress={handleReset} disabled={isBusy}>
            <Text style={styles.resetText}>↺  Reset</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* SCANNER MODAL */}
      <Modal visible={showScanner} transparent animationType="slide" onRequestClose={() => setShowScanner(false)}>
        <View style={styles.scannerContainer}>
          <View style={styles.scannerHeader}>
            <TouchableOpacity onPress={() => setShowScanner(false)}>
              <Text style={styles.closeScannerText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.scannerTitle}>Scan Barcode/SKU</Text>
            <View style={{ width: 50 }} />
          </View>
          <QRCodeScanner
            onRead={handleScannerSuccess}
            vibrate={false}
            flashMode={RNCamera.Constants.FlashMode.auto}
            showMarker={true}
            topContent={
              <Text style={styles.scannerInstruction}>
                Point camera at barcode to scan
              </Text>
            }
            cameraStyle={{ height: '100%' }}
            cameraProps={{
              barCodeTypes: [
                RNCamera.Constants.BarCodeType.qr,
                RNCamera.Constants.BarCodeType.ean13,
                RNCamera.Constants.BarCodeType.ean8,
                RNCamera.Constants.BarCodeType.code128,
                RNCamera.Constants.BarCodeType.code39,
                RNCamera.Constants.BarCodeType.upc_e
              ]
            }}
          />
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scannerContainer: { flex: 1, backgroundColor: '#000' },
  scannerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111', padding: 20, paddingTop: 40 },
  closeScannerText: { color: '#fff', fontSize: 16 },
  scannerTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  scannerInstruction: { fontSize: 16, color: '#fff', padding: 20, textAlign: 'center' },
  container: { flex: 1, backgroundColor: '#F5F6FA' },
  header: {
    backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  backBtn: { padding: 4 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  profile: {
    width: 36, height: 36, backgroundColor: '#2D2F8E',
    borderRadius: 10, alignItems: 'center', justifyContent: 'center',
  },
  section: { paddingHorizontal: 16, marginTop: 12, marginBottom: 4 },
  subTitle: { fontSize: 10, color: '#000', letterSpacing: 2 },
  mainTitle: { fontSize: 28, fontWeight: 'bold', marginTop: 5, color: '#000' },
  card: {
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16,
    borderRadius: 14, padding: 16, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  cardIcon: { fontSize: 18 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#000' },
  label: {
    fontSize: 10, color: '#000', letterSpacing: 1.2,
    fontWeight: '600', marginBottom: 6, marginTop: 12,
  },
  input: {
    backgroundColor: '#F5F6FA', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 11,
    fontSize: 14, color: '#000', marginBottom: 2,
    borderWidth: 1, borderColor: '#eaecf4',
  },
  textArea: { height: 90, textAlignVertical: 'top' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qrBox: {
    width: 44, height: 44, backgroundColor: '#F5F6FA',
    borderRadius: 10, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#eaecf4',
  },
  dropdown: {
    backgroundColor: '#F5F6FA', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 11,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: '#eaecf4',
  },
  dropdownPlaceholder: { fontSize: 14, color: '#000' },
  dropdownSelected: { fontSize: 14, color: '#000', fontWeight: '600' },
  dropdownOpen: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dropdownList: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eaecf4',
    borderTopWidth: 0,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    overflow: 'hidden',
    marginBottom: 2,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemActive: { backgroundColor: '#EDE9FE' },
  dropdownItemText: { fontSize: 14, color: '#444' },
  dropdownItemTextActive: { color: '#000', fontWeight: '700' },
  priceInputBox: {
    backgroundColor: '#F5F6FA', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 11,
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#eaecf4', gap: 6, marginBottom: 2,
  },
  priceInputBoxActive: { borderColor: '#3d5af1', backgroundColor: '#f0f2ff' },
  currencySymbol: { fontSize: 14, color: '#000', fontWeight: '700' },
  priceInput: { flex: 1, fontSize: 14, color: '#000' },
  uploadBox: {
    borderWidth: 2, borderColor: '#d0d5f5', borderStyle: 'dashed',
    borderRadius: 12, overflow: 'hidden', minHeight: 120,
    alignItems: 'center', justifyContent: 'center',
  },
  uploadPlaceholder: { alignItems: 'center', paddingVertical: 24, gap: 6 },
  uploadText: { fontSize: 13, color: '#cdcdcdff' },
  uploadBrowse: { color: '#000', fontWeight: '700' },
  uploadHint: { fontSize: 11, color: '#cdcdcdff', textAlign: 'center' },
  previewImage: { width: '100%', height: 180 },
  removeImageBtn: { alignSelf: 'center', marginTop: 8 },
  removeImageText: { color: '#000', fontSize: 12, fontWeight: '600' },
  toggleRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#f0f2f8',
  },
  toggleLabel: { fontSize: 14, fontWeight: '600', color: '#000' },
  toggleSub: { fontSize: 11, color: '#000', marginTop: 2 },
  saveBtn: {
    backgroundColor: '#2D2F8E', margin: 16, marginBottom: 10,
    padding: 15, borderRadius: 12, alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  bottomRow: { flexDirection: 'row', marginHorizontal: 16, gap: 12 },
  cancelBtn: {
    flex: 1, padding: 13, borderRadius: 12, alignItems: 'center',
    borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff',
  },
  cancelText: { color: '#000', fontWeight: '600', fontSize: 13 },
  resetBtn: {
    flex: 1, padding: 13, borderRadius: 12, alignItems: 'center',
    borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff',
  },
  resetText: { color: '#000', fontWeight: '600', fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
});