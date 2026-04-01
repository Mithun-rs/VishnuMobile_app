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
} from "react-native";
import Person from '../../../asset/person.svg';
import BackArrow from '../../../asset/back-arrow.svg';
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { launchImageLibrary } from "react-native-image-picker";

const DEFAULT_CATEGORIES = [
  { id: "default_1", name: "Smartphones" },
  { id: "default_2", name: "Accessories" },
];

const CURRENCIES = [
  { symbol: "₹", label: "INR - Indian Rupee" },
  { symbol: "$", label: "USD - US Dollar" },
  { symbol: "€", label: "EUR - Euro" },
  { symbol: "£", label: "GBP - British Pound" },
];

export default function AddProductScreen() {
  const navigation = useNavigation();

  const [productName, setProductName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sku, setSku] = useState("");
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [marketPrice, setMarketPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [stockQty, setStockQty] = useState("");
  const [color, setColor] = useState("");
  const [storage, setStorage] = useState("");
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [isAvailable, setIsAvailable] = useState(true);

  const [categories, setCategories] = useState([]);
  const [showCatModal, setShowCatModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const existing = await AsyncStorage.getItem("categories");
        const saved = existing ? JSON.parse(existing) : [];
        setCategories([...DEFAULT_CATEGORIES, ...saved]);
      } catch (e) {
        setCategories(DEFAULT_CATEGORIES);
      }
    };
    loadCategories();
  }, []);

  const handlePickImage = () => {
    launchImageLibrary(
      { mediaType: "photo", quality: 0.8, includeBase64: false },
      (response) => {
        if (response.didCancel || response.errorCode) return;
        if (response.assets && response.assets.length > 0) {
          setImageUri(response.assets[0].uri);
        }
      }
    );
  };

  const handleSave = async () => {
    if (!productName.trim()) { Alert.alert("Validation", "Product name is required."); return; }
    if (!selectedCategory) { Alert.alert("Validation", "Please select a category."); return; }
    if (!sku.trim()) { Alert.alert("Validation", "Barcode / SKU is required."); return; }
    if (!sellingPrice.trim()) { Alert.alert("Validation", "Selling price is required."); return; }

    const qty = parseInt(stockQty) || 0;
    const newProduct = {
      id: sku.trim() || `PROD-${Date.now()}`,
      name: productName.trim(),
      sku: sku.trim(),
      currency: currency.symbol,
      price: parseFloat(sellingPrice) || 0,
      marketPrice: parseFloat(marketPrice) || 0,
      discount: parseFloat(discount) || 0,
      status: qty > 5 ? "IN STOCK" : qty > 0 ? "LOW STOCK" : "OUT OF STOCK",
      statusColor: qty > 5 ? "#3d5af1" : qty > 0 ? "#ef4444" : "#999",
      category: selectedCategory.name,
      image: imageUri || null,
      description: description.trim(),
      color: color.trim(),
      storage: storage.trim(),
      stockQty: qty,
      available: isAvailable,
    };

    try {
      const existing = await AsyncStorage.getItem("products");
      const products = existing ? JSON.parse(existing) : [];
      products.unshift(newProduct);
      await AsyncStorage.setItem("products", JSON.stringify(products));
      Alert.alert("Success", "Product saved successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert("Error", "Failed to save product.");
    }
  };

  const handleReset = () => {
    setProductName(""); setSelectedCategory(null); setSku("");
    setCurrency(CURRENCIES[0]); setMarketPrice(""); setSellingPrice("");
    setDiscount(""); setStockQty(""); setColor(""); setStorage("");
    setDescription(""); setImageUri(null); setIsAvailable(true);
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <BackArrow width={20} height={20} fill="#2D2F8E" stroke="#2D2F8E" />
        </TouchableOpacity>
        <Text style={styles.title}>Shop Manager</Text>
        <View style={styles.profile}>
          <Person width={20} height={20} fill="#fff" />
        </View>
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
            placeholder="e.g. iPhone 15 Pro Max"
            placeholderTextColor="#bbb"
            value={productName}
            onChangeText={setProductName}
          />

          <Text style={styles.label}>CATEGORY</Text>
          <TouchableOpacity style={styles.dropdown} onPress={() => setShowCatModal(true)} activeOpacity={0.8}>
            <Text style={selectedCategory ? styles.dropdownSelected : styles.dropdownPlaceholder}>
              {selectedCategory ? selectedCategory.name : "Select a category"}
            </Text>
            <Text style={styles.dropdownArrow}>▾</Text>
          </TouchableOpacity>

          <Text style={styles.label}>BARCODE / SKU</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="UPC-12345678"
              placeholderTextColor="#bbb"
              value={sku}
              onChangeText={setSku}
            />
            <View style={styles.qrBox}><Text style={styles.qrIcon}>▦</Text></View>
          </View>

          <Text style={[styles.label, { marginTop: 14 }]}>CURRENCY</Text>
          <TouchableOpacity style={styles.dropdown} onPress={() => setShowCurrencyModal(true)} activeOpacity={0.8}>
            <Text style={styles.dropdownSelected}>{currency.symbol}  {currency.label}</Text>
            <Text style={styles.dropdownArrow}>▾</Text>
          </TouchableOpacity>

          <Text style={styles.label}>MARKET PRICE</Text>
          <View style={styles.priceInputBox}>
            <Text style={styles.currencySymbol}>{currency.symbol}</Text>
            <TextInput
              style={styles.priceInput}
              placeholder="0.00"
              placeholderTextColor="#bbb"
              keyboardType="decimal-pad"
              value={marketPrice}
              onChangeText={setMarketPrice}
            />
          </View>

          <Text style={styles.label}>SELLING PRICE</Text>
          <View style={[styles.priceInputBox, styles.priceInputBoxActive]}>
            <Text style={[styles.currencySymbol, { color: "#3d5af1" }]}>{currency.symbol}</Text>
            <TextInput
              style={[styles.priceInput, { color: "#3d5af1" }]}
              placeholder="0.00"
              placeholderTextColor="#bbb"
              keyboardType="decimal-pad"
              value={sellingPrice}
              onChangeText={setSellingPrice}
            />
          </View>

          <Text style={styles.label}>DISCOUNT (%)</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor="#bbb"
            keyboardType="decimal-pad"
            value={discount}
            onChangeText={setDiscount}
          />

          <Text style={styles.label}>STOCK QUANTITY</Text>
          <TextInput
            style={styles.input}
            placeholder="Units in hand"
            placeholderTextColor="#bbb"
            keyboardType="number-pad"
            value={stockQty}
            onChangeText={setStockQty}
          />
        </View>

        {/* ── PRODUCT VARIANTS ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🎨</Text>
            <Text style={styles.cardTitle}>Product Variants</Text>
          </View>

          <Text style={styles.label}>COLOR</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Obsidian Black, Blue Titanium"
            placeholderTextColor="#bbb"
            value={color}
            onChangeText={setColor}
          />

          <Text style={styles.label}>STORAGE</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 128 GB, 256 GB"
            placeholderTextColor="#bbb"
            value={storage}
            onChangeText={setStorage}
          />
        </View>

        {/* ── VISUAL ASSETS ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🖼️</Text>
            <Text style={styles.cardTitle}>Visual Assets</Text>
          </View>

          <TouchableOpacity style={styles.uploadBox} onPress={handlePickImage} activeOpacity={0.8}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Text style={styles.uploadIcon}>☁️</Text>
                <Text style={styles.uploadText}>Drag & drop or <Text style={styles.uploadBrowse}>browse</Text></Text>
                <Text style={styles.uploadHint}>PNG, JPG UP TO 10MB</Text>
              </View>
            )}
          </TouchableOpacity>
          {imageUri && (
            <TouchableOpacity onPress={() => setImageUri(null)} style={styles.removeImageBtn}>
              <Text style={styles.removeImageText}>✕ Remove Image</Text>
            </TouchableOpacity>
          )}

          <Text style={[styles.label, { marginTop: 14 }]}>PRODUCT DESCRIPTION</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter detailed technical specifications and features..."
            placeholderTextColor="#bbb"
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />

          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>Availability Status</Text>
              <Text style={styles.toggleSub}>Toggle product visibility in store</Text>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={setIsAvailable}
              trackColor={{ false: "#ddd", true: "#3d5af1" }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* BUTTONS */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
          <Text style={styles.saveBtnText}>💾  Save Product</Text>
        </TouchableOpacity>
        <View style={styles.bottomRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>✕  Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
            <Text style={styles.resetText}>↺  Reset</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* CATEGORY MODAL */}
      <Modal visible={showCatModal} transparent animationType="slide" onRequestClose={() => setShowCatModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowCatModal(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, selectedCategory?.id === item.id && styles.modalItemActive]}
                  onPress={() => { setSelectedCategory(item); setShowCatModal(false); }}
                >
                  <Text style={[styles.modalItemText, selectedCategory?.id === item.id && styles.modalItemTextActive]}>
                    {item.icon ? `${item.icon}  ` : ""}{item.name}
                  </Text>
                  {selectedCategory?.id === item.id && <Text style={styles.checkMark}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* CURRENCY MODAL */}
      <Modal visible={showCurrencyModal} transparent animationType="slide" onRequestClose={() => setShowCurrencyModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowCurrencyModal(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Select Currency</Text>
            <FlatList
              data={CURRENCIES}
              keyExtractor={(item) => item.symbol}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, currency.symbol === item.symbol && styles.modalItemActive]}
                  onPress={() => { setCurrency(item); setShowCurrencyModal(false); }}
                >
                  <Text style={[styles.modalItemText, currency.symbol === item.symbol && styles.modalItemTextActive]}>
                    {item.symbol}  {item.label}
                  </Text>
                  {currency.symbol === item.symbol && <Text style={styles.checkMark}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  header: {
    backgroundColor: "#FFFFFF", paddingHorizontal: 20, paddingVertical: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  backBtn: { padding: 4 },
  title: { fontSize: 16, fontWeight: "bold", color: "#2D2F8E" },
  profile: {
    width: 36, height: 36, backgroundColor: "#2D2F8E",
    borderRadius: 10, alignItems: "center", justifyContent: "center",
  },
  section: { paddingHorizontal: 16, marginTop: 12, marginBottom: 4 },
  subTitle: { fontSize: 10, color: "#999", letterSpacing: 2 },
  mainTitle: { fontSize: 28, fontWeight: "bold", marginTop: 5 },
  card: {
    backgroundColor: "#fff", marginHorizontal: 16, marginTop: 16,
    borderRadius: 14, padding: 16, elevation: 2,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  cardIcon: { fontSize: 18 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#3d5af1" },
  label: {
    fontSize: 10, color: "#999", letterSpacing: 1.2,
    fontWeight: "600", marginBottom: 6, marginTop: 12,
  },
  input: {
    backgroundColor: "#F5F6FA", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 11,
    fontSize: 14, color: "#222", marginBottom: 2,
    borderWidth: 1, borderColor: "#eaecf4",
  },
  textArea: { height: 90, textAlignVertical: "top" },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  qrBox: {
    width: 44, height: 44, backgroundColor: "#F5F6FA",
    borderRadius: 10, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "#eaecf4",
  },
  qrIcon: { fontSize: 20, color: "#aaa" },
  dropdown: {
    backgroundColor: "#F5F6FA", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 11,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    borderWidth: 1, borderColor: "#eaecf4",
  },
  dropdownPlaceholder: { fontSize: 14, color: "#bbb" },
  dropdownSelected: { fontSize: 14, color: "#222", fontWeight: "600" },
  dropdownArrow: { fontSize: 14, color: "#aaa" },
  priceInputBox: {
    backgroundColor: "#F5F6FA", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 11,
    flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderColor: "#eaecf4", gap: 6, marginBottom: 2,
  },
  priceInputBoxActive: { borderColor: "#3d5af1", backgroundColor: "#f0f2ff" },
  currencySymbol: { fontSize: 14, color: "#aaa", fontWeight: "700" },
  priceInput: { flex: 1, fontSize: 14, color: "#222" },
  uploadBox: {
    borderWidth: 2, borderColor: "#d0d5f5", borderStyle: "dashed",
    borderRadius: 12, overflow: "hidden", minHeight: 120,
    alignItems: "center", justifyContent: "center",
  },
  uploadPlaceholder: { alignItems: "center", paddingVertical: 24, gap: 6 },
  uploadIcon: { fontSize: 28 },
  uploadText: { fontSize: 13, color: "#888" },
  uploadBrowse: { color: "#3d5af1", fontWeight: "700" },
  uploadHint: { fontSize: 11, color: "#bbb" },
  previewImage: { width: "100%", height: 180 },
  removeImageBtn: { alignSelf: "center", marginTop: 8 },
  removeImageText: { color: "#ef4444", fontSize: 12, fontWeight: "600" },
  toggleRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: "#f0f2f8",
  },
  toggleLabel: { fontSize: 14, fontWeight: "600", color: "#222" },
  toggleSub: { fontSize: 11, color: "#aaa", marginTop: 2 },
  saveBtn: {
    backgroundColor: "#2D2F8E", margin: 16, marginBottom: 10,
    padding: 15, borderRadius: 12, alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  bottomRow: { flexDirection: "row", marginHorizontal: 16, gap: 12 },
  cancelBtn: {
    flex: 1, padding: 13, borderRadius: 12, alignItems: "center",
    borderWidth: 1, borderColor: "#ddd", backgroundColor: "#fff",
  },
  cancelText: { color: "#888", fontWeight: "600", fontSize: 13 },
  resetBtn: {
    flex: 1, padding: 13, borderRadius: 12, alignItems: "center",
    borderWidth: 1, borderColor: "#ddd", backgroundColor: "#fff",
  },
  resetText: { color: "#888", fontWeight: "600", fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalSheet: {
    backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingHorizontal: 16, paddingTop: 20, paddingBottom: 34, maxHeight: "60%",
  },
  modalTitle: {
    fontSize: 16, fontWeight: "800", color: "#1a2e6c",
    marginBottom: 16, textAlign: "center",
  },
  modalItem: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 14, paddingHorizontal: 12, borderRadius: 10, marginBottom: 4,
  },
  modalItemActive: { backgroundColor: "#EEF0FF" },
  modalItemText: { fontSize: 15, color: "#444" },
  modalItemTextActive: { color: "#3d5af1", fontWeight: "700" },
  checkMark: { color: "#3d5af1", fontSize: 16, fontWeight: "800" },
});