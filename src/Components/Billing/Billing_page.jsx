import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackArrow from '../../asset/back-arrow.svg';

const GST_RATE = 0.18;

const PAYMENT_METHODS = [
  { key: 'upi', label: 'UPI/QR', icon: '📱' },
  { key: 'cash', label: 'Cash', icon: '💵' },
  { key: 'card', label: 'Card', icon: '💳' },
];

export default function BillingScreen() {
  const navigation = useNavigation();

  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [generating, setGenerating] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [])
  );

  const loadCart = async () => {
    try {
      const data = await AsyncStorage.getItem('cart');
      setCart(data ? JSON.parse(data) : []);
    } catch (e) {}
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const gstAmount = subtotal * GST_RATE;
  const totalPayable = subtotal + gstAmount;
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  const formatINR = (amount) =>
    '₹' + Math.round(amount).toLocaleString('en-IN');

  const buildHTML = () => {
    const itemsHTML = cart
      .map(
        (item) => `
      <tr>
        <td style="padding:10px 8px;border-bottom:1px solid #f0f0f0;">
          <div style="font-weight:700;color:#1a1a2e;font-size:13px;">${item.name}</div>
          <div style="color:#aaa;font-size:11px;margin-top:2px;">${item.sku}</div>
        </td>
        <td style="padding:10px 8px;border-bottom:1px solid #f0f0f0;text-align:center;color:#555;font-size:13px;">${item.qty}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #f0f0f0;text-align:right;color:#555;font-size:13px;">₹${Number(item.price).toLocaleString('en-IN')}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:700;color:#3d5af1;font-size:13px;">₹${Math.round(item.price * item.qty).toLocaleString('en-IN')}</td>
      </tr>`
      )
      .join('');

    const payLabel = PAYMENT_METHODS.find((m) => m.key === paymentMethod)?.label || paymentMethod;
    const dateStr = new Date().toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
    const timeStr = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit',
    });

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: Arial, sans-serif; background:#f5f6fa; padding:20px; }
    .card { background:#fff; border-radius:16px; max-width:480px; margin:0 auto; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.10); }
    .header { background:linear-gradient(135deg,#1a2e6c,#3d5af1); padding:28px 24px; text-align:center; }
    .header h1 { color:#fff; font-size:22px; font-weight:800; letter-spacing:1px; }
    .header p { color:rgba(255,255,255,0.75); font-size:12px; margin-top:4px; }
    .section { padding:20px 24px; border-bottom:1px solid #f0f0f0; }
    .section-title { font-size:11px; font-weight:800; color:#3d5af1; text-transform:uppercase; letter-spacing:1px; margin-bottom:12px; }
    .info-row { display:flex; justify-content:space-between; margin-bottom:6px; }
    .info-label { color:#888; font-size:12px; }
    .info-value { color:#1a1a2e; font-size:12px; font-weight:700; }
    table { width:100%; border-collapse:collapse; }
    th { padding:8px; background:#f8f9ff; color:#888; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; }
    th:last-child, td:last-child { text-align:right; }
    th:nth-child(2), td:nth-child(2) { text-align:center; }
    .totals { padding:20px 24px; }
    .total-row { display:flex; justify-content:space-between; margin-bottom:8px; }
    .total-label { color:#888; font-size:13px; }
    .total-value { color:#333; font-size:13px; font-weight:600; }
    .grand-total { background:#f0f3ff; border-radius:10px; padding:14px 16px; margin-top:12px; display:flex; justify-content:space-between; align-items:center; }
    .grand-label { color:#1a2e6c; font-size:14px; font-weight:800; }
    .grand-value { color:#3d5af1; font-size:20px; font-weight:900; }
    .footer { text-align:center; padding:16px 24px; color:#aaa; font-size:11px; }
    .badge { display:inline-block; background:#eef0ff; color:#3d5af1; border-radius:6px; padding:3px 10px; font-size:11px; font-weight:700; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>🛍️ Vishnu Mobile Shop</h1>
      <p>${dateStr} &nbsp;·&nbsp; ${timeStr}</p>
    </div>

    <div class="section">
      <div class="section-title">Customer Details</div>
      <div class="info-row"><span class="info-label">Name</span><span class="info-value">${customerName || '—'}</span></div>
      <div class="info-row"><span class="info-label">Phone</span><span class="info-value">${phoneNumber || '—'}</span></div>
      <div class="info-row"><span class="info-label">Payment</span><span class="badge">${payLabel}</span></div>
    </div>

    <div class="section">
      <div class="section-title">Items (${totalItems})</div>
      <table>
        <tr>
          <th>Item</th><th>Qty</th><th>Price</th><th>Total</th>
        </tr>
        ${itemsHTML}
      </table>
    </div>

    <div class="totals">
      <div class="total-row"><span class="total-label">Subtotal</span><span class="total-value">${formatINR(subtotal)}</span></div>
      <div class="total-row"><span class="total-label">GST (18%)</span><span class="total-value">${formatINR(gstAmount)}</span></div>
      <div class="grand-total">
        <span class="grand-label">Total Payable</span>
        <span class="grand-value">${formatINR(totalPayable)}</span>
      </div>
    </div>

    <div class="footer">Thank you for shopping with Vishnu Mobile Shop!<br/>This is a computer-generated invoice.</div>
  </div>
</body>
</html>`;
  };

  const buildTextBill = () => {
    const payLabel = PAYMENT_METHODS.find((m) => m.key === paymentMethod)?.label || paymentMethod;
    const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    let lines = [];
    lines.push('================================');
    lines.push('      🛍️ VISHNU MOBILE SHOP');
    lines.push('================================');
    lines.push(`Date   : ${dateStr}  ${timeStr}`);
    lines.push(`Name   : ${customerName || '—'}`);
    lines.push(`Phone  : ${phoneNumber ? '+91 ' + phoneNumber : '—'}`);
    lines.push(`Payment: ${payLabel}`);
    lines.push('--------------------------------');
    lines.push('ITEMS:');
    cart.forEach((item) => {
      lines.push(`• ${item.name}`);
      lines.push(`  Qty: ${item.qty}  x  ₹${Number(item.price).toLocaleString('en-IN')}  =  ${formatINR(item.price * item.qty)}`);
    });
    lines.push('--------------------------------');
    lines.push(`Subtotal    : ${formatINR(subtotal)}`);
    lines.push(`GST (18%)   : ${formatINR(gstAmount)}`);
    lines.push('--------------------------------');
    lines.push(`TOTAL PAYABLE: ${formatINR(totalPayable)}`);
    lines.push('================================');
    lines.push('Thank you for shopping with us!');
    return lines.join('\n');
  };

  const handleGenerateBill = async () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to cart before generating a bill.');
      return;
    }
    setGenerating(true);
    try {
      const textBill = buildTextBill();
      setGenerating(false);
      await Share.share({
        title: `Bill - ${customerName || 'Customer'} | Vishnu Mobile Shop`,
        message: textBill,
      });
    } catch (error) {
      setGenerating(false);
      if (error.message !== 'User did not share') {
        Alert.alert('Error', 'Failed to share bill.\n' + error.message);
      }
    }
  };

  const clearCartAndGoBack = async () => {
    try {
      await AsyncStorage.setItem('cart', JSON.stringify([]));
    } catch (e) {}
    navigation.navigate('POS');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <BackArrow width={20} height={20} fill="#2D2F8E" stroke="#2D2F8E" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Billing</Text>
          <Text style={styles.headerSubtitle}>Vishnu Mobile Shop</Text>
        </View>
        <View style={styles.itemsBadge}>
          <Text style={styles.itemsBadgeText}>{totalItems}</Text>
          <Text style={styles.itemsBadgeLabel}> {totalItems === 1 ? 'item' : 'items'}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* CUSTOMER INFO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>

          <Text style={styles.fieldLabel}>FULL NAME</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="Enter customer name"
              placeholderTextColor="#bbb"
              value={customerName}
              onChangeText={setCustomerName}
            />
          </View>

          <Text style={styles.fieldLabel}>PHONE NUMBER</Text>
          <View style={styles.inputBox}>
            <Text style={styles.isd}>+91</Text>
            <View style={styles.divider} />
            <TextInput
              style={styles.input}
              placeholder="00000 00000"
              placeholderTextColor="#bbb"
              keyboardType="phone-pad"
              maxLength={10}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
          </View>
        </View>

        {/* PAYMENT METHOD */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentGrid}>
            {PAYMENT_METHODS.map((m) => (
              <TouchableOpacity
                key={m.key}
                style={[styles.payBtn, paymentMethod === m.key && styles.payBtnActive]}
                onPress={() => setPaymentMethod(m.key)}
                activeOpacity={0.8}
              >
                <Text style={styles.payIcon}>{m.icon}</Text>
                <Text style={[styles.payLabel, paymentMethod === m.key && styles.payLabelActive]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* CART SUMMARY */}
        <View style={styles.section}>
          <View style={styles.summaryHeader}>
            <Text style={styles.sectionTitle}>Cart Summary</Text>
            <View style={styles.countPill}>
              <Text style={styles.countPillText}>{totalItems} {totalItems === 1 ? 'Item' : 'Items'}</Text>
            </View>
          </View>

          {cart.length === 0 ? (
            <View style={styles.emptyCart}>
              <Text style={styles.emptyIcon}>🛒</Text>
              <Text style={styles.emptyText}>Cart is empty</Text>
            </View>
          ) : (
            cart.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.cartImg} resizeMode="cover" />
                ) : (
                  <View style={[styles.cartImg, styles.noImg]}>
                    <Text style={{ fontSize: 22 }}>📦</Text>
                  </View>
                )}
                <View style={styles.cartInfo}>
                  <Text style={styles.cartName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.cartVariant}>Qty: {item.qty}</Text>
                </View>
                <Text style={styles.cartPrice}>{formatINR(item.price * item.qty)}</Text>
              </View>
            ))
          )}

          {/* Totals */}
          {cart.length > 0 && (
            <View style={styles.totalsBox}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalValue}>{formatINR(subtotal)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>GST (18%)</Text>
                <Text style={styles.totalValue}>{formatINR(gstAmount)}</Text>
              </View>
              <View style={styles.dividerLine} />
              <View style={styles.totalRow}>
                <Text style={styles.grandLabel}>Total Payable</Text>
                <Text style={styles.grandValue}>{formatINR(totalPayable)}</Text>
              </View>
            </View>
          )}
        </View>

      </ScrollView>

      {/* GENERATE BILL BUTTON */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.generateBtn, (generating || cart.length === 0) && styles.generateBtnDisabled]}
          onPress={handleGenerateBill}
          activeOpacity={0.85}
          disabled={generating || cart.length === 0}
        >
          {generating ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text style={styles.generateIcon}>🧾</Text>
              <Text style={styles.generateText}>Generate & Send Bill</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA' },

  // Header
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 2,
  },
  backBtn: {
    width: 36, height: 36,
    backgroundColor: '#EEF0FF',
    borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#2D2F8E' },
  headerSubtitle: { fontSize: 11, color: '#aaa', marginTop: 1 },
  itemsBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#EEF0FF', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  itemsBadgeText: { fontSize: 14, fontWeight: '800', color: '#2D2F8E' },
  itemsBadgeLabel: { fontSize: 11, color: '#2D2F8E', fontWeight: '600' },

  scroll: { paddingBottom: 30 },

  // Sections
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 16,
    padding: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: 14,
  },

  // Fields
  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#aaa',
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 10,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e8ecf4',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  isd: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a2e6c',
    marginRight: 8,
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: '#ddd',
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a2e',
    padding: 0,
  },

  // Payment
  paymentGrid: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  payBtn: {
    flex: 1,
    minWidth: 80,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#F5F6FA',
    borderWidth: 2,
    borderColor: '#e8ecf4',
  },
  payBtnActive: {
    borderColor: '#2D2F8E',
    backgroundColor: '#EEF0FF',
  },
  payIcon: { fontSize: 22, marginBottom: 4 },
  payLabel: { fontSize: 12, fontWeight: '700', color: '#666' },
  payLabelActive: { color: '#2D2F8E' },

  // Cart Summary
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  countPill: {
    backgroundColor: '#2D2F8E',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countPillText: { color: '#fff', fontSize: 11, fontWeight: '800' },

  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 10,
  },
  cartImg: {
    width: 52, height: 52,
    borderRadius: 10,
    backgroundColor: '#1a1a2e',
  },
  noImg: { alignItems: 'center', justifyContent: 'center' },
  cartInfo: { flex: 1 },
  cartName: { fontSize: 13, fontWeight: '700', color: '#1a1a2e', lineHeight: 18 },
  cartVariant: { fontSize: 11, color: '#888', marginTop: 3 },
  cartPrice: { fontSize: 14, fontWeight: '800', color: '#2D2F8E' },

  // Totals
  totalsBox: { marginTop: 14, paddingTop: 4 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: { fontSize: 13, color: '#888' },
  totalValue: { fontSize: 13, fontWeight: '700', color: '#333' },
  dividerLine: { height: 1, backgroundColor: '#eee', marginVertical: 8 },
  grandLabel: { fontSize: 16, fontWeight: '800', color: '#2D2F8E' },
  grandValue: { fontSize: 18, fontWeight: '900', color: '#2D2F8E' },

  emptyCart: { alignItems: 'center', paddingVertical: 24 },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  emptyText: { color: '#aaa', fontSize: 13 },

  // Footer
  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    elevation: 10,
  },
  generateBtn: {
    backgroundColor: '#2D2F8E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  generateBtnDisabled: { backgroundColor: '#aaa' },
  generateIcon: { fontSize: 18 },
  generateText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
