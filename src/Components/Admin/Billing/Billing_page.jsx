import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, TextInput, Image, Alert, ActivityIndicator, Platform, Switch,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBlobUtil from 'react-native-blob-util';

import BackArrow from '../../../assets/back-arrow.svg';
import { supabase } from '../../../lib/supabase';
import RNPrint from 'react-native-print';
import Share from 'react-native-share';

const PAYMENT_METHODS = [
  { key: 'upi',  label: 'UPI/QR', icon: '📱' },
  { key: 'cash', label: 'Cash',   icon: '💵' },
  { key: 'card', label: 'Card',   icon: '💳' },
];

// ── Replace this with your real logo base64 later ──
// const LOGO_BASE64 = 'data:image/png;base64,YOUR_BASE64_HERE';

export default function BillingScreen() {
  const navigation = useNavigation();
const [staffList,      setStaffList]      = useState([]);
const [selectedStaff,  setSelectedStaff]  = useState(null);
const [staffDropdown,  setStaffDropdown]  = useState(false);
  const [cart,          setCart]          = useState([]);
  const [customerName,  setCustomerName]  = useState('');
  const [phoneNumber,   setPhoneNumber]   = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [generating,    setGenerating]    = useState(false);
  const [gstEnabled,    setGstEnabled]    = useState(false);
  const [gstRate,       setGstRate]       = useState('18');

  useFocusEffect(useCallback(() => {
  loadCart();
  loadStaff();
}, []));

  const loadCart = async () => {
    try {
      const data = await AsyncStorage.getItem('cart');
      setCart(data ? JSON.parse(data) : []);
    } catch (e) {}
  };
const loadStaff = async () => {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, username, role')
      .in('role', ['staff', 'admin'])
      .eq('is_approved', true)
      .order('full_name', { ascending: true });
    setStaffList(data || []);
  } catch (e) {
    console.log('loadStaff error:', e.message);
  }
};

  const subtotal     = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const gstPercent   = gstEnabled ? (parseFloat(gstRate) || 0) : 0;
  const gstAmount    = subtotal * gstPercent / 100;
  const totalPayable = subtotal + gstAmount;
  const totalItems   = cart.reduce((sum, item) => sum + item.qty, 0);

  const formatINR = (amount) =>
    '₹' + Math.round(amount).toLocaleString('en-IN');

  // ── Invoice number generator ──────────────────────────────────────────────
  const generateInvoiceNo = () => {
    const now = new Date();
    return `VMS-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${Math.floor(1000 + Math.random() * 9000)}`;
  };

  // ── Build PDF HTML ────────────────────────────────────────────────────────
  const buildInvoiceHTML = (invoiceNo) => {
    const payLabel = PAYMENT_METHODS.find(m => m.key === paymentMethod)?.label || paymentMethod;
    const dateStr  = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    const timeStr  = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const itemRows = cart.map((item, i) => `
      <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f9fafe'};">
        <td style="padding:11px 14px; border-bottom:1px solid #eef0fb;">
          <div style="font-weight:700; font-size:13px; color:#1a1a2e;">${item.name}</div>
          <div style="font-size:11px; color:#94a3b8; margin-top:2px;">${item.sku || ''}</div>
        </td>
        <td style="padding:11px 14px; border-bottom:1px solid #eef0fb; text-align:center; font-size:13px; color:#475569;">${item.qty}</td>
        <td style="padding:11px 14px; border-bottom:1px solid #eef0fb; text-align:right; font-size:13px; color:#475569;">₹${Number(item.price).toLocaleString('en-IN')}</td>
        <td style="padding:11px 14px; border-bottom:1px solid #eef0fb; text-align:right; font-size:13px; font-weight:700; color:#2d2f8e;">₹${Math.round(item.price * item.qty).toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: Arial, Helvetica, sans-serif; background:#f0f2f8; padding:24px 16px; }
    .page { background:#fff; max-width:600px; margin:0 auto; border-radius:20px; overflow:hidden; box-shadow:0 8px 32px rgba(45,47,142,0.10); }

    /* ── Header ── */
    .header { background:linear-gradient(135deg, #1a2064 0%, #2d2f8e 60%, #3d5af1 100%); padding:32px 32px 28px; position:relative; }
    .header-top { display:flex; justify-content:space-between; align-items:flex-start; }
    .shop-name { font-size:22px; font-weight:900; color:#ffffff; letter-spacing:-0.5px; }
    .shop-tagline { font-size:11px; color:rgba(255,255,255,0.65); margin-top:4px; letter-spacing:0.5px; }
    .invoice-badge { background:rgba(255,255,255,0.15); border-radius:10px; padding:8px 14px; text-align:right; backdrop-filter:blur(4px); }
    .invoice-label { font-size:9px; font-weight:800; color:rgba(255,255,255,0.7); letter-spacing:1.5px; text-transform:uppercase; }
    .invoice-no { font-size:14px; font-weight:900; color:#ffffff; margin-top:3px; letter-spacing:0.5px; }
    .header-bottom { display:flex; justify-content:space-between; align-items:flex-end; margin-top:24px; padding-top:20px; border-top:1px solid rgba(255,255,255,0.15); }
    .date-text { font-size:12px; color:rgba(255,255,255,0.75); }
    .status-badge { background:#22c55e; border-radius:20px; padding:4px 14px; font-size:11px; font-weight:800; color:#fff; letter-spacing:0.5px; }

    /* ── Customer + Payment ── */
    .info-grid { display:flex; gap:0; border-bottom:1px solid #eef0fb; }
    .info-box { flex:1; padding:20px 24px; }
    .info-box:first-child { border-right:1px solid #eef0fb; }
    .info-section-title { font-size:9px; font-weight:800; color:#2d2f8e; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:12px; }
    .info-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:7px; }
    .info-label { font-size:11px; color:#94a3b8; }
    .info-value { font-size:12px; font-weight:700; color:#1a1a2e; max-width:140px; text-align:right; }
    .pay-badge { background:#eef0ff; color:#2d2f8e; border-radius:6px; padding:3px 10px; font-size:11px; font-weight:800; }

    /* ── Items Table ── */
    .items-section { padding:0; }
    .items-header { padding:14px 24px; background:#f8f9ff; border-bottom:1px solid #eef0fb; display:flex; justify-content:space-between; align-items:center; }
    .items-title { font-size:9px; font-weight:800; color:#2d2f8e; letter-spacing:1.5px; text-transform:uppercase; }
    .items-count { background:#2d2f8e; color:#fff; border-radius:20px; padding:3px 10px; font-size:10px; font-weight:800; }
    table { width:100%; border-collapse:collapse; }
    thead tr { background:#f8f9ff; }
    thead th { padding:10px 14px; font-size:10px; font-weight:800; color:#94a3b8; letter-spacing:0.8px; text-transform:uppercase; border-bottom:2px solid #eef0fb; }
    thead th:nth-child(1) { text-align:left; }
    thead th:nth-child(2) { text-align:center; }
    thead th:nth-child(3), thead th:nth-child(4) { text-align:right; }

    /* ── Totals ── */
    .totals { padding:20px 24px; background:#f8f9ff; border-top:2px solid #eef0fb; }
    .total-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
    .total-label { font-size:13px; color:#64748b; }
    .total-value { font-size:13px; font-weight:600; color:#334155; }
    .total-divider { height:1px; background:#e2e8f0; margin:12px 0; }
    .grand-box { background:linear-gradient(135deg, #2d2f8e, #3d5af1); border-radius:14px; padding:16px 20px; display:flex; justify-content:space-between; align-items:center; margin-top:4px; }
    .grand-label { font-size:13px; font-weight:800; color:rgba(255,255,255,0.85); }
    .grand-value { font-size:22px; font-weight:900; color:#ffffff; letter-spacing:-0.5px; }

    /* ── Payment method icon ── */
    .pay-method-row { display:flex; align-items:center; gap:8px; margin-top:14px; padding:12px 16px; background:#fff; border-radius:10px; border:1px solid #eef0fb; }
    .pay-dot { width:8px; height:8px; border-radius:4px; background:#22c55e; }
    .pay-method-text { font-size:12px; font-weight:700; color:#334155; }

    /* ── Footer ── */
    .footer { padding:20px 24px; text-align:center; border-top:1px solid #eef0fb; }
    .footer-main { font-size:13px; font-weight:700; color:#1a1a2e; margin-bottom:4px; }
    .footer-sub { font-size:10px; color:#94a3b8; line-height:1.6; }
    .footer-line { display:flex; justify-content:center; gap:16px; margin-top:12px; }
    .footer-tag { font-size:10px; color:#2d2f8e; font-weight:700; }
  </style>
</head>
<body>
<div class="page">

  <!-- HEADER -->
  <div class="header">
    <div class="header-top">
      <div>
        <!-- Swap the emoji below with an <img> tag using LOGO_BASE64 when ready -->
        <div style="font-size:28px; margin-bottom:6px;">📱</div>
        <div class="shop-name">Vishnu Mobile Shop</div>
        <div class="shop-tagline">MOBILE · ACCESSORIES · REPAIRS</div>
      </div>
      <div class="invoice-badge">
        <div class="invoice-label">Invoice</div>
        <div class="invoice-no">${invoiceNo}</div>
      </div>
    </div>
    <div class="header-bottom">
      <div class="date-text">${dateStr} &nbsp;·&nbsp; ${timeStr}</div>
      <div class="status-badge">PAID</div>
    </div>
  </div>

  <!-- CUSTOMER + PAYMENT -->
  <div class="info-grid">
    <div class="info-box">
      <div class="info-section-title">Bill To</div>
      <div class="info-row">
        <span class="info-label">Name</span>
        <span class="info-value">${customerName.trim() || 'Walk-in Customer'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Phone</span>
        <span class="info-value">${phoneNumber.trim() ? '+91 ' + phoneNumber.trim() : '—'}</span>
      </div>
    </div>
    <div class="info-box">
      <div class="info-section-title">Payment</div>
      <div class="info-row">
        <span class="info-label">Method</span>
        <span class="pay-badge">${payLabel}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Status</span>
        <span class="info-value" style="color:#22c55e;">Completed</span>
      </div>
    </div>
  </div>

  <!-- ITEMS -->
  <div class="items-section">
    <div class="items-header">
      <span class="items-title">Items Purchased</span>
      <span class="items-count">${totalItems} ${totalItems === 1 ? 'Item' : 'Items'}</span>
    </div>
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th>Qty</th>
          <th>Rate</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>
  </div>

  <!-- TOTALS -->
  <div class="totals">
    <div class="total-row">
      <span class="total-label">Subtotal</span>
      <span class="total-value">${formatINR(subtotal)}</span>
    </div>
    ${gstEnabled ? `
    <div class="total-row">
      <span class="total-label">GST (${gstPercent}%)</span>
      <span class="total-value">${formatINR(gstAmount)}</span>
    </div>` : ''}
    <div class="total-divider"></div>
    <div class="grand-box">
      <span class="grand-label">TOTAL PAYABLE</span>
      <span class="grand-value">${formatINR(totalPayable)}</span>
    </div>
    <div class="pay-method-row">
      <div class="pay-dot"></div>
      <span class="pay-method-text">Paid via ${payLabel}</span>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <div class="footer-main">Thank you for shopping with Vishnu Mobile Shop! 🙏</div>
    <div class="footer-sub">
      This is a computer-generated invoice and does not require a signature.<br/>
      For any queries, please contact us with your invoice number.
    </div>
    <div class="footer-line">
      <span class="footer-tag">Invoice: ${invoiceNo}</span>
      <span class="footer-tag">·</span>
      <span class="footer-tag">Vishnu Mobile Shop</span>
    </div>
  </div>

</div>
</body>
</html>`;
  };

  // ── Generate PDF and share ────────────────────────────────────────────────


const generateAndSharePDF = async (invoiceNo) => {
  try {
    const html = buildInvoiceHTML(invoiceNo);

    await RNPrint.print({
      html,
      jobName: `Invoice_${invoiceNo}_VishnutMobileShop`,
    });

  } catch (e) {
    if (!e?.message?.toLowerCase().includes('cancel')) {
      Alert.alert('Error', 'Could not print invoice.\n' + e.message);
    }
  }
};

  // ── Main handler ──────────────────────────────────────────────────────────
  const handleGenerateBill = async () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to cart before generating a bill.');
      return;
    }
    setGenerating(true);
    try {
      const invoiceNo = generateInvoiceNo();

      // Step 1: Save order
      const { data: { user } } = await supabase.auth.getUser();

      const { data: order, error: orderErr } = await supabase
  .from('orders')
  .insert({
    created_by:     user?.id || null,
    customer_name:  customerName.trim() || null,
    phone:          phoneNumber.trim()   || null,
    payment_method: paymentMethod,
    subtotal:       parseFloat(subtotal.toFixed(2)),
    gst:            parseFloat(gstAmount.toFixed(2)),
    total_payable:  parseFloat(totalPayable.toFixed(2)),
    total_items:    totalItems,
    invoice_no:     invoiceNo,
    sold_by:        selectedStaff?.id   || null,   // 👈 add
    sold_by_name:   selectedStaff?.full_name || selectedStaff?.username || null, // 👈 add
  })
  .select('id')
  .single();

      if (orderErr) throw orderErr;

      // Step 2: Validate cart items still exist in products table
      const cartIds = cart.map(i => i.id);
      const { data: existingProducts } = await supabase
        .from('products')
        .select('id')
        .in('id', cartIds);

      const existingIds = new Set((existingProducts || []).map(p => p.id));
      const staleItems = cart.filter(i => !existingIds.has(i.id));

      if (staleItems.length > 0) {
        // Remove stale items from cart
        const validCart = cart.filter(i => existingIds.has(i.id));
        await AsyncStorage.setItem('cart', JSON.stringify(validCart));
        setCart(validCart);
        setGenerating(false);
        Alert.alert(
          '⚠️ Cart Updated',
          `The following items are no longer available and were removed from cart:\n\n${staleItems.map(i => `• ${i.name}`).join('\n')}\n\nPlease review your cart and try again.`
        );
        return;
      }

      // Step 2b: Save order items (product_id is valid — FK will pass)
      const orderItems = cart.map(item => ({
        order_id:   order.id,
        product_id: item.id,
        name:       item.name,
        sku:        item.sku,
        qty:        item.qty,
        price:      parseFloat(item.price),
        total:      parseFloat((item.price * item.qty).toFixed(2)),
      }));

const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
if (itemsErr) throw itemsErr;

      // Step 3: Move to sold_products + delete from products
      await Promise.all(cart.map(async (item) => {
        const { data: product, error: fetchErr } = await supabase
          .from('products').select('*').eq('id', item.id).single();
        if (fetchErr) throw fetchErr;

        // REPLACE WITH THIS ✅
// REPLACE WITH THIS ✅
const { error: insertErr } = await supabase.from('sold_products').insert({
  original_id:    product.id,
  order_id:       order.id,
  name:           product.name,
  sku:            product.sku,
  imei:           product.imei,
  price:          product.price,
  market_price:   product.marketPrice,
  color:          product.color,
  description:    product.description,
  image:          product.image,
  brand_id:       product.brand_id,
  category:       product.category,
  currency:       product.currency,
  customer_name:  customerName.trim() || null,
  phone:          phoneNumber.trim()   || null,
  payment_method: paymentMethod,
  sold_by:        selectedStaff?.id   || null,
  sold_by_name:   selectedStaff?.full_name || selectedStaff?.username || null,
  shop:           product.shop || 'shop1',
});
        if (insertErr) throw insertErr;

        // Mobiles (has IMEI): delete product (1 unit per IMEI)
        // Other categories: reduce stockQty
        const isMobileProduct = !!(product.imei);
        if (isMobileProduct) {
          const { error: deleteErr } = await supabase
            .from('products').delete().eq('id', item.id);
          if (deleteErr) throw deleteErr;
       } else {
  const newQty = (product.stockQty || 0) - item.qty;

  await supabase.from('stock_history').insert([{
    product_id:   product.id,
    product_name: product.name,
    brand_id:     product.brand_id,
    event_type:   'sold',
    qty_change:   -item.qty,
    stock_after:  newQty,
    notes:        'Product sold',
  }]);

  if (newQty <= 0) {
            // No stock left — delete it
            const { error: deleteErr } = await supabase
              .from('products').delete().eq('id', item.id);
            if (deleteErr) throw deleteErr;
          } else {
            // Still has stock — just reduce qty
            const { error: updateErr } = await supabase
              .from('products')
              .update({ stockQty: newQty })
              .eq('id', item.id);
            if (updateErr) throw updateErr;
          }
        }
      }));

      // Step 4: Log the sale to activity_logs
      const itemNames = cart.map(i => i.name).join(', ');
      const staffLabel = selectedStaff?.full_name || selectedStaff?.username || 'Unknown';
      await supabase.from('activity_logs').insert({
        action_type: 'SALE',
        entity_type: 'ORDER',
        entity_name: invoiceNo,
        details: `Invoice ${invoiceNo} — ₹${Math.round(totalPayable).toLocaleString('en-IN')} — ${totalItems} item(s): ${itemNames}${customerName.trim() ? ` — Customer: ${customerName.trim()}` : ''}${selectedStaff ? ` — Sold by: ${staffLabel}` : ''}`,
      });

      // Step 5: Clear cart
      await AsyncStorage.setItem('cart', JSON.stringify([]));
      setCart([]);

      setGenerating(false);

      // Step 5: Navigate back immediately, then show options
      navigation.navigate('POS');

      Alert.alert(
        '✅ Order Saved!',
        `Invoice ${invoiceNo} created successfully.`,
        [
          {
            text: '📤 Share Invoice PDF',
            onPress: async () => {
              try {
                await generateAndSharePDF(invoiceNo);
              } catch (e) {
                Alert.alert('Error', 'Could not generate PDF.\n' + e.message);
              }
            },
          },
          { text: 'Done', style: 'cancel' },
        ]
      );

    } catch (error) {
      setGenerating(false);
      console.log('FULL ERROR:', JSON.stringify(error, null, 2));
      Alert.alert('Error', 'Failed to save order.\n' + error.message);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
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
          <Text style={styles.fieldLabel}>SOLD BY (STAFF)</Text>
<TouchableOpacity
  style={styles.inputBox}
  onPress={() => setStaffDropdown(v => !v)}
  activeOpacity={0.8}>
  <Text style={{ flex: 1, fontSize: 14, color: selectedStaff ? '#1a1a2e' : '#bbb' }}>
    {selectedStaff
      ? (selectedStaff.full_name || selectedStaff.username)
      : 'Select staff member'}
  </Text>
  <Text style={{ fontSize: 12, color: '#aaa' }}>{staffDropdown ? '▲' : '▼'}</Text>
</TouchableOpacity>

{staffDropdown && (
  <View style={styles.dropdownList}>
    {staffList.length === 0 ? (
      <Text style={{ padding: 14, color: '#aaa', fontSize: 13 }}>No staff found</Text>
    ) : (
      staffList.map((staff) => (
        <TouchableOpacity
  key={staff.id}
  style={[
    styles.dropdownItem,
    selectedStaff?.id === staff.id && styles.dropdownItemActive,
  ]}
  onPress={() => {
    setSelectedStaff(staff);
    setStaffDropdown(false);
  }}>
  <View style={[
    styles.dropdownAvatar,
    { backgroundColor: staff.role === 'admin' ? '#e11d48' : '#2D2F8E' }
  ]}>
    <Text style={styles.dropdownAvatarText}>
      {(staff.full_name || staff.username || '?').charAt(0).toUpperCase()}
    </Text>
  </View>
  <Text style={[
    styles.dropdownItemText,
    selectedStaff?.id === staff.id && styles.dropdownItemTextActive,
  ]}>
    {staff.full_name || staff.username}
  </Text>

  {/* 👇 Role badge */}
  <View style={{
    marginLeft: 'auto',
    backgroundColor: staff.role === 'admin' ? '#ffeaee' : '#eef0ff',
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2,
    marginRight: selectedStaff?.id === staff.id ? 8 : 0,
  }}>
    <Text style={{
      fontSize: 10, fontWeight: '800',
      color: staff.role === 'admin' ? '#e11d48' : '#2D2F8E',
    }}>
      {staff.role === 'admin' ? 'ADMIN' : 'STAFF'}
    </Text>
  </View>

  {selectedStaff?.id === staff.id && (
    <Text style={{ color: '#2D2F8E', fontWeight: '800' }}>✓</Text>
  )}
</TouchableOpacity>
      ))
    )}
  </View>
)}
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
                activeOpacity={0.8}>
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

          {cart.length > 0 && (
            <View style={styles.totalsBox}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalValue}>{formatINR(subtotal)}</Text>
              </View>

              {/* GST TOGGLE */}
              <View style={styles.gstToggleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.gstToggleLabel}>Apply GST</Text>
                  {gstEnabled && (
                    <Text style={styles.gstToggleSub}>{gstPercent}% of subtotal</Text>
                  )}
                </View>
                <Switch
                  value={gstEnabled}
                  onValueChange={setGstEnabled}
                  trackColor={{ false: '#ddd', true: '#2D2F8E' }}
                  thumbColor="#fff"
                />
              </View>

              {/* GST RATE INPUT — shown only when GST is on */}
              {gstEnabled && (
                <View style={styles.gstRateRow}>
                  <Text style={styles.gstRateLabel}>GST %</Text>
                  <View style={styles.gstRateInput}>
                    <TextInput
                      style={styles.gstRateText}
                      value={gstRate}
                      onChangeText={v => {
                        const n = v.replace(/[^0-9.]/g, '');
                        setGstRate(n);
                      }}
                      keyboardType="decimal-pad"
                      placeholder="18"
                      placeholderTextColor="#bbb"
                      maxLength={5}
                    />
                    <Text style={styles.gstRatePct}>%</Text>
                  </View>
                  <Text style={styles.gstAmount}>+{formatINR(gstAmount)}</Text>
                </View>
              )}

              <View style={styles.dividerLine} />
              <View style={styles.totalRow}>
                <Text style={styles.grandLabel}>Total Payable</Text>
                <Text style={styles.grandValue}>{formatINR(totalPayable)}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.generateBtn, (generating || cart.length === 0) && styles.generateBtnDisabled]}
          onPress={handleGenerateBill}
          activeOpacity={0.85}
          disabled={generating || cart.length === 0}>
          {generating ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text style={styles.generateIcon}>🧾</Text>
              <Text style={styles.generateText}>Generate Invoice PDF</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA' },
  header: {
    backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderBottomWidth: 1, borderBottomColor: '#eee', elevation: 2,
  },
  backBtn: {
    width: 36, height: 36, backgroundColor: '#EEF0FF',
    borderRadius: 10, alignItems: 'center', justifyContent: 'center',
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
  dropdownList: {
  marginTop: 6, backgroundColor: '#F5F6FA',
  borderRadius: 12, borderWidth: 1, borderColor: '#e8ecf4',
  overflow: 'hidden',
},
dropdownItem: {
  flexDirection: 'row', alignItems: 'center', gap: 10,
  paddingHorizontal: 14, paddingVertical: 12,
  borderBottomWidth: 1, borderBottomColor: '#eee',
},
dropdownItemActive: { backgroundColor: '#EEF0FF' },
dropdownItemText: { fontSize: 14, color: '#1a1a2e', fontWeight: '600' },
dropdownItemTextActive: { color: '#2D2F8E', fontWeight: '800' },
dropdownAvatar: {
  width: 32, height: 32, borderRadius: 16,
  backgroundColor: '#2D2F8E',
  alignItems: 'center', justifyContent: 'center',
},
dropdownAvatarText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  section: {
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 14,
    borderRadius: 16, padding: 18, elevation: 2,
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#1a1a2e', marginBottom: 14 },
  fieldLabel: {
    fontSize: 10, fontWeight: '800', color: '#aaa',
    letterSpacing: 1, marginBottom: 6, marginTop: 10,
  },
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F5F6FA', borderRadius: 12,
    borderWidth: 1, borderColor: '#e8ecf4',
    paddingHorizontal: 14, paddingVertical: 12,
  },
  isd: { fontSize: 14, fontWeight: '700', color: '#1a2e6c', marginRight: 8 },
  divider: { width: 1, height: 16, backgroundColor: '#ddd', marginRight: 10 },
  input: { flex: 1, fontSize: 14, color: '#1a1a2e', padding: 0 },
  paymentGrid: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  payBtn: {
    flex: 1, minWidth: 80, alignItems: 'center', paddingVertical: 12,
    borderRadius: 14, backgroundColor: '#F5F6FA',
    borderWidth: 2, borderColor: '#e8ecf4',
  },
  payBtnActive: { borderColor: '#2D2F8E', backgroundColor: '#EEF0FF' },
  payIcon: { fontSize: 22, marginBottom: 4 },
  payLabel: { fontSize: 12, fontWeight: '700', color: '#666' },
  payLabelActive: { color: '#2D2F8E' },
  summaryHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 14,
  },
  countPill: {
    backgroundColor: '#2D2F8E', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  countPillText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  cartItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0', gap: 10,
  },
  cartImg: { width: 52, height: 52, borderRadius: 10, backgroundColor: '#1a1a2e' },
  noImg: { alignItems: 'center', justifyContent: 'center' },
  cartInfo: { flex: 1 },
  cartName: { fontSize: 13, fontWeight: '700', color: '#1a1a2e', lineHeight: 18 },
  cartVariant: { fontSize: 11, color: '#888', marginTop: 3 },
  cartPrice: { fontSize: 14, fontWeight: '800', color: '#2D2F8E' },
  totalsBox: { marginTop: 14, paddingTop: 4 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  totalLabel: { fontSize: 13, color: '#888' },
  totalValue: { fontSize: 13, fontWeight: '700', color: '#333' },
  dividerLine: { height: 1, backgroundColor: '#eee', marginVertical: 8 },
  grandLabel: { fontSize: 16, fontWeight: '800', color: '#2D2F8E' },
  grandValue: { fontSize: 18, fontWeight: '900', color: '#2D2F8E' },
  emptyCart: { alignItems: 'center', paddingVertical: 24 },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  emptyText: { color: '#aaa', fontSize: 13 },
  footer: {
    backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: '#eee', elevation: 10,
  },
  generateBtn: {
    backgroundColor: '#2D2F8E', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingVertical: 16, borderRadius: 14, gap: 8,
  },
  generateBtnDisabled: { backgroundColor: '#aaa' },
  generateIcon: { fontSize: 18 },
  generateText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  // GST controls
  gstToggleRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: '#f0f0f0',
    marginTop: 4,
  },
  gstToggleLabel: { fontSize: 13, fontWeight: '700', color: '#1a1a2e' },
  gstToggleSub:   { fontSize: 11, color: '#2D2F8E', marginTop: 1 },
  gstRateRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#EEF0FF', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    marginTop: 6,
  },
  gstRateLabel: { fontSize: 12, fontWeight: '700', color: '#2D2F8E', flex: 1 },
  gstRateInput: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 8,
    borderWidth: 1, borderColor: '#C7CAFF',
    paddingHorizontal: 10, paddingVertical: 6, gap: 2,
  },
  gstRateText: { fontSize: 14, fontWeight: '800', color: '#2D2F8E', minWidth: 36, padding: 0 },
  gstRatePct:  { fontSize: 13, fontWeight: '700', color: '#2D2F8E' },
  gstAmount:   { fontSize: 13, fontWeight: '800', color: '#10B981' },
});