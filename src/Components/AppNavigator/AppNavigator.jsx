import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, Animated, StyleSheet,
  Dimensions, StatusBar, Image
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthProvider, useAuth } from '../../context/AuthContext';
import { ROLES, ADMIN_ROLES } from '../../constants';

import { AdminTabs, StaffTabs }  from '../NavBar/NavBar';
import AddCategoryScreen         from '../Admin/Inventory/Category/Add_Category';
import ProductScreen             from '../Admin/Inventory/Products/Products';
import CartScreen                from '../Admin/Inventory/Cart/Cart';
import AddProductScreen          from '../Admin/Inventory/Products/Add_Product';
import ProductdetailScreen       from '../Admin/Inventory/Products/Productsdetails';
import BillingScreen             from '../Admin/Billing/Billing_page';
import StaffListScreen           from '../Admin/StaffList/StaffList';
import SettingsScreen            from '../Admin/Settings/Settings';
import StaffAttendanceScreen     from '../Admin/StaffAttendance/StaffAttendance';
import BrandsScreen              from '../Admin/Inventory/Brands/Brands';
import AdminProductsScreen       from '../Admin/Inventory/Products/AdminProducts';
import DayDetailScreen           from '../Admin/DayDetail/DayDetailScreen';
import ProductsSoldScreen        from '../Admin/ProductsSold/ProductsSold';
import LoginScreen               from '../Login/Login';
import StockHistoryScreen from '../Admin/Inventory/StockHistory/StockHistory';

const Stack = createNativeStackNavigator();
const { width } = Dimensions.get('window');

// ─── Animated Splash ──────────────────────────────────────────────────────────
function AnimatedSplash({ onFinish }) {
  const fadeAnim      = useRef(new Animated.Value(0)).current;
  const scaleAnim     = useRef(new Animated.Value(0.85)).current;
  const translateAnim = useRef(new Animated.Value(30)).current;
  const dotsAnim      = useRef(new Animated.Value(0)).current;
  const exitAnim      = useRef(new Animated.Value(1)).current;
  const ring1Anim     = useRef(new Animated.Value(0.97)).current;
  const ring2Anim     = useRef(new Animated.Value(0.97)).current;
  const spinAnim      = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Rings pulse loop
    const pulsate = (anim, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1.03, duration: 1500, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.97, duration: 1500, useNativeDriver: true }),
        ])
      ).start();

    pulsate(ring1Anim, 0);
    pulsate(ring2Anim, 600);

    // Logo spin loop
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // Logo floats up + dots appear, then fade out
Animated.sequence([
  Animated.parallel([
    Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    Animated.spring(translateAnim, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
  ]),
  Animated.timing(dotsAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    // show for a bit, then just call onFinish
]).start(() => {
  Animated.delay(2500).start(() => onFinish());
});
  }, []);

  return (
    <Animated.View style={[s.splash, { opacity: exitAnim }]}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1c6b" />

      {/* Pulsing rings */}
      <Animated.View style={[s.ring, s.ring1, { transform: [{ scale: ring1Anim }] }]} />
      <Animated.View style={[s.ring, s.ring2, { transform: [{ scale: ring2Anim }] }]} />

      {/* Logo block */}
      <Animated.View style={[s.logoBlock, {
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }, { translateY: translateAnim }],
      }]}>
        <Animated.View style={[s.outerRing, {
          transform: [{ rotate: spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }],
        }]}>
          <View style={s.logoInner}>
            <Image source={require('../../assets/logo.png')} style={{ width: 52, height: 52 }} />
          </View>
        </Animated.View>
        <Text style={s.appName}>Vishnu Mobile</Text>
        <Text style={s.appSub}>SHOP MANAGEMENT</Text>
      </Animated.View>

      {/* Bouncing dots */}
      <Animated.View style={[s.dotsRow, { opacity: dotsAnim }]}>
        {[0, 1, 2].map(i => <BouncingDot key={i} delay={i * 150} />)}
      </Animated.View>
    </Animated.View>
  );
}

// Single bouncing dot
function BouncingDot({ delay }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.delay(600 - delay),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={[s.dot, {
      opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
      transform: [{ scaleY: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] }) }],
    }]} />
  );
}

// ─── Pending Approval ─────────────────────────────────────────────────────────
function PendingApprovalScreen() {
  const { signOut } = useAuth();
  return (
    <View style={s.pendingContainer}>
      <View style={s.pendingCard}>
        <Text style={s.pendingEmoji}>⏳</Text>
        <Text style={s.pendingTitle}>Approval Pending</Text>
        <Text style={s.pendingSubtitle}>
          Your account is waiting for admin confirmation.{'\n'}
          Please wait — the admin will approve your account shortly.
        </Text>
        <Text style={s.pendingLogoutBtn} onPress={signOut}>← Back to Login</Text>
      </View>
    </View>
  );
}

// ─── Root Navigator ───────────────────────────────────────────────────────────
function RootNavigator() {
  const { session, profile, loading } = useAuth();

  if (loading && !profile) {
    return <View style={{ flex: 1, backgroundColor: '#2D2F8E' }} />;
  }

  return (
    <Stack.Navigator screenOptions={{
      headerShown: false,
      animation: 'fade',
      animationDuration: 150,
      contentStyle: { backgroundColor: '#F5F6FA' },
    }}>
      {!session ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : profile?.is_approved === false && !ADMIN_ROLES.includes(profile?.role) ? (
        <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} />
      ) : profile?.role === ROLES.ADMIN ? (
        <>
          <Stack.Screen name="MainTabs"           component={AdminTabs} />
          <Stack.Screen name="AddCategory"        component={AddCategoryScreen} />
          <Stack.Screen name="Products"           component={ProductScreen} />
          <Stack.Screen name="Cart"               component={CartScreen} />
          <Stack.Screen name="Billing"            component={BillingScreen} />
          <Stack.Screen name="AddProduct"         component={AddProductScreen} />
          <Stack.Screen name="ProductDetails"     component={ProductdetailScreen} />
          <Stack.Screen name="StaffList"          component={StaffListScreen} />
          <Stack.Screen name="Settings"           component={SettingsScreen} />
          <Stack.Screen name="StaffAttendance"    component={StaffAttendanceScreen} />
          <Stack.Screen name="Brands"             component={BrandsScreen} />
          <Stack.Screen name="AdminProducts"      component={AdminProductsScreen} />
          <Stack.Screen name="DayDetail"          component={DayDetailScreen} />
          <Stack.Screen name="ProductsSoldScreen" component={ProductsSoldScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ProductsSoldReport" component={ProductsSoldScreen} options={{ headerShown: false }} />
          <Stack.Screen name="StockHistory" component={StockHistoryScreen} />
        </>
      ) : profile?.role === 'inactive' ? (
        <Stack.Screen name="StaffAttendance" component={StaffAttendanceScreen} />
      ) : (
        <>
          <Stack.Screen name="StaffTabs"      component={StaffTabs} />
          <Stack.Screen name="Products"       component={ProductScreen} />
          <Stack.Screen name="Cart"           component={CartScreen} />
          <Stack.Screen name="Billing"        component={BillingScreen} />
          <Stack.Screen name="ProductDetails" component={ProductdetailScreen} options={{ headerShown: false }} />
        </>
      )}
    </Stack.Navigator>
  );
}

// ─── App Navigator ────────────────────────────────────────────────────────────
function AppContent() {
  const [splashDone, setSplashDone] = useState(false);
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const handleSplashFinish = () => {
  Animated.timing(splashOpacity, {
    toValue: 0,
    duration: 600,
    useNativeDriver: true,
  }).start(() => setSplashDone(true));
};
  return (
    <View style={{ flex: 1 }}>
      {/* App loads in background immediately */}
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>

      {/* Splash sits on top as overlay */}
{!splashDone && (
  <Animated.View style={[s.splashOverlay, { opacity: splashOpacity }]}>
    <AnimatedSplash onFinish={handleSplashFinish} />
  </Animated.View>
)}
    </View>
  );
}

export default function AppNavigator() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  logoBox: {
  width: 100, height: 100,
  backgroundColor: 'rgba(255,255,255,0.15)',
  borderRadius: 50,           // slightly less round so rotation is visible
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 20,
  borderWidth: 2,
  borderColor: 'rgba(255,255,255,0.4)',
  borderTopColor: '#ffffff',  // bright top border makes spin visible
},
  // Splash overlay — covers everything instantly
  splashOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 9999,
    elevation: 9999,
  },
// Splash
splash: {
  flex: 1,
  backgroundColor: '#1a1c6b',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 40,
},
ring: {
  position: 'absolute',
  borderRadius: 999,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.07)',
},
ring1: { width: 280, height: 280 },
ring2: { width: 460, height: 460 },
outerRing: {
  width: 100, height: 100,
  borderRadius: 50,
  borderWidth: 2,
  borderColor: 'rgba(255,255,255,0.15)',
  borderTopColor: '#fff',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 20,
},
logoInner: {
  width: 76, height: 76,
  borderRadius: 38,
  backgroundColor: 'rgba(255,255,255,0.12)',
  alignItems: 'center',
  justifyContent: 'center',
},
logoBlock: { alignItems: 'center' },
appName: {
  fontSize: 28, fontWeight: '900',
  color: '#fff', letterSpacing: 0.5,
},
appSub: {
  fontSize: 11, fontWeight: '300',
  color: 'rgba(255,255,255,0.5)',
  letterSpacing: 4, marginTop: 6,
},
dotsRow: { flexDirection: 'row', gap: 8 },
dot: {
  width: 6, height: 6,
  borderRadius: 3,
  backgroundColor: 'rgba(255,255,255,0.8)',
},

  logoIcon:  { fontSize: 52 },
  appName:   { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  appSub:    { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4, letterSpacing: 1.5, textTransform: 'uppercase' },
  progressContainer: { width: width * 0.65, alignItems: 'center', gap: 10 },
  progressTrack: {
    width: '100%', height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2, overflow: 'hidden',
  },
  progressFill:  { height: '100%', backgroundColor: '#fff', borderRadius: 2 },
  loadingText:   { color: 'rgba(255,255,255,0.5)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase' },
  pendingContainer: { flex: 1, backgroundColor: '#F5F6FA', justifyContent: 'center', alignItems: 'center', padding: 24 },
  pendingCard:      { backgroundColor: '#fff', borderRadius: 24, padding: 32, alignItems: 'center', elevation: 6, maxWidth: 340, width: '100%' },
  pendingEmoji:     { fontSize: 56, marginBottom: 16 },
  pendingTitle:     { fontSize: 22, fontWeight: '900', color: '#1A1A2E', marginBottom: 12 },
  pendingSubtitle:  { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  pendingLogoutBtn: { fontSize: 13, fontWeight: '700', color: '#475569' },
});