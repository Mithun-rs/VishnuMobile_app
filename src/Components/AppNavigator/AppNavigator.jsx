import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Auth context
import { AuthProvider, useAuth } from '../../context/AuthContext';

// Tab Navigators
import { AdminTabs, StaffTabs } from '../NavBar/NavBar';

// Screens — Admin stack
import AddCategoryScreen    from '../Admin/Inventory/Category/Add_Category';
import ProductScreen        from '../Admin/Inventory/Products/Products';
import CartScreen           from '../Admin/Inventory/Cart/Cart';
import AddProductScreen     from '../Admin/Inventory/Products/Add_Product';
import ProductdetailScreen  from '../Admin/Inventory/Products/Productsdetails';
import BillingScreen        from '../Admin/Billing/Billing_page';
import StaffListScreen      from '../Admin/StaffList/StaffList';
import SettingsScreen       from '../Admin/Settings/Settings';
import ProductsSoldScreen   from '../Admin/ProductsSold/ProductsSold';
import StaffAttendanceScreen from '../Admin/StaffAttendance/StaffAttendance';

// Auth screen
import LoginScreen          from '../Login/Login';

const Stack = createNativeStackNavigator();

// ─── Loading Spinner ─────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <View style={s.loading}>
      <ActivityIndicator size="large" color="#2D2F8E" />
    </View>
  );
}

// ─── Pending Approval Screen ──────────────────────────────────────────────────
function PendingApprovalScreen() {
  const { signOut } = useAuth();
  return (
    <SafeAreaView style={s.pendingContainer}>
      <View style={s.pendingCard}>
        <Text style={s.pendingEmoji}>⏳</Text>
        <Text style={s.pendingTitle}>Approval Pending</Text>
        <Text style={s.pendingSubtitle}>
          Your account is waiting for admin confirmation.{'\n'}
          Please wait — the admin will approve your account shortly.
        </Text>
        <TouchableOpacity style={s.pendingLogoutBtn} onPress={signOut} activeOpacity={0.8}>
          <Text style={s.pendingLogoutText}>← Back to Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Inner Navigator (reads AuthContext) ─────────────────────────────────────
function RootNavigator() {
  const { session, profile, loading } = useAuth();

  // While restoring session from AsyncStorage
  if (loading) return <LoadingScreen />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!session ? (
        // ── NOT LOGGED IN → show Login only ───────────────────────
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : profile?.is_approved === false && profile?.role !== 'admin' && profile?.role !== 'attendance_admin' ? (
        // ── LOGGED IN BUT NOT APPROVED (staff only) → show Pending screen ─
        <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} />
      ) : profile?.role === 'admin' ? (
        // ── ADMIN LOGGED IN → show Admin stack ────────────────────
        <>
          <Stack.Screen name="MainTabs"      component={AdminTabs} />
          <Stack.Screen name="AddCategory"   component={AddCategoryScreen} />
          <Stack.Screen name="Products"      component={ProductScreen} />
          <Stack.Screen name="Cart"          component={CartScreen} />
          <Stack.Screen name="Billing"       component={BillingScreen} />
          <Stack.Screen name="AddProduct"    component={AddProductScreen} />
          <Stack.Screen name="ProductDetails" component={ProductdetailScreen} />
          <Stack.Screen name="StaffList"     component={StaffListScreen} />
          <Stack.Screen name="Settings"      component={SettingsScreen} />
          <Stack.Screen name="ProductsSoldReport" component={ProductsSoldScreen} />
          <Stack.Screen name="StaffAttendance"    component={StaffAttendanceScreen} />
        </>
      ) : profile?.role === 'attendance_admin' ? (
        // ── ATTENDANCE ADMIN LOGGED IN → show Staff Attendance only ─
        <>
          <Stack.Screen name="StaffAttendance" component={StaffAttendanceScreen} />
        </>
      ) : (
        // ── STAFF LOGGED IN → show Staff stack ────────────────────
        <>
          <Stack.Screen name="StaffTabs"     component={StaffTabs} />
          <Stack.Screen name="Products"      component={ProductScreen} />
          <Stack.Screen name="Cart"          component={CartScreen} />
          <Stack.Screen name="Billing"       component={BillingScreen} />
          <Stack.Screen name="ProductDetails" component={ProductdetailScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

// ─── Root App Navigator (provides AuthContext + NavigationContainer) ──────────
export default function AppNavigator() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

const s = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
  },
  pendingContainer: {
    flex: 1,
    backgroundColor: '#F5F6FA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  pendingCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    maxWidth: 340,
    width: '100%',
  },
  pendingEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  pendingTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1A1A2E',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  pendingSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  pendingLogoutBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pendingLogoutText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
});
