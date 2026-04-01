import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import HomeScreen from '../Components/Home_page/HomePage';
import CategoryScreen from '../Components/Stock_page/Category/Category';
import AddCategoryScreen from '../Components/Stock_page/Category/Add_Categoty';
import PosScreen from '../Components/Pos/Pos_page';
import StaffScreen from '../Components/Staff_page/staffattendance/staffattendance';
import StaffListScreen from '../Components/Staff_page/stafflist/stafflist';
import MoreScreen from '../Components/More_page/More_page';
import ProductScreen from '../Components/Stock_page/Products/Products';
import CartScreen from '../Components/Stock_page/Cart_page/Cart_page';
import AddProductScreen from '../Components/Stock_page/Products/Add_Product';
import ProductdetailScreen from '../Components/Stock_page/Products/Productsdetails';
import LoginScreen from '../Components/Login_page/login_page';       // adjust path
import StaffDashboard from '../Components/Staff/Staffdashboard/StaffDashboard'; // adjust path
import BillingScreen from '../Components/Billing/Billing_page';
import StaffScanAttendance from '../Components/Staff/StaffScanAttendance/StaffScanAttendance';
import SettingsScreen from '../Components/Settings/Settings_page';

// Icons
import HomeIcon from '../asset/Home.svg';
import CategoryIcon from '../asset/category.svg';
import PosIcon from '../asset/pos.svg';
import MoreIcon from '../asset/report.svg';
import StaffIcon from '../asset/staff.svg';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ─── Admin Tabs (all 5) ───────────────────────────────────────────────────────
function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { height: 68 },
        tabBarActiveTintColor: '#2D2F8E',
        tabBarInactiveTintColor: '#8fa0b8',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <HomeIcon
              width={22} height={22}
              fill={focused ? '#2D2F8E' : '#8fa0b8'}
              stroke={focused ? '#2D2F8E' : '#8fa0b8'}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Stock"
        component={CategoryScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <CategoryIcon
              width={22} height={22}
              fill={focused ? '#2D2F8E' : '#8fa0b8'}
              stroke={focused ? '#2D2F8E' : '#8fa0b8'}
            />
          ),
        }}
      />
      <Tab.Screen
        name="POS"
        component={PosScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <PosIcon
              width={22} height={22}
              fill={focused ? '#2D2F8E' : '#8fa0b8'}
              stroke={focused ? '#2D2F8E' : '#8fa0b8'}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Staff"
        component={StaffScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <StaffIcon
              width={22} height={22}
              fill={focused ? '#2D2F8E' : '#8fa0b8'}
              stroke={focused ? '#2D2F8E' : '#8fa0b8'}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Report"
        component={MoreScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <MoreIcon
              width={22} height={22}
              fill={focused ? '#2D2F8E' : '#8fa0b8'}
              stroke={focused ? '#2D2F8E' : '#8fa0b8'}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ─── Staff Tabs (only 3) ──────────────────────────────────────────────────────
function StaffTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { height: 68 },
        tabBarActiveTintColor: '#2D2F8E',
        tabBarInactiveTintColor: '#8fa0b8',
      }}
    >
      <Tab.Screen
        name="Home"
        component={StaffDashboard}        // Staff home = StaffDashboard
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => (
            <HomeIcon
              width={22} height={22}
              fill={focused ? '#2D2F8E' : '#8fa0b8'}
              stroke={focused ? '#2D2F8E' : '#8fa0b8'}
            />
          ),
        }}
      />
      <Tab.Screen
        name="POS"
        component={PosScreen}             // Same POS as Admin
        options={{
          tabBarIcon: ({ focused }) => (
            <PosIcon
              width={22} height={22}
              fill={focused ? '#2D2F8E' : '#8fa0b8'}
              stroke={focused ? '#2D2F8E' : '#8fa0b8'}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Attendance"
        component={StaffScanAttendance}
        options={{
          tabBarLabel: 'Attendance',
          tabBarIcon: ({ focused }) => (
            <StaffIcon
              width={22} height={22}
              fill={focused ? '#2D2F8E' : '#8fa0b8'}
              stroke={focused ? '#2D2F8E' : '#8fa0b8'}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ─── Root Stack ───────────────────────────────────────────────────────────────
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        {/* Auth */}
        <Stack.Screen name="Login" component={LoginScreen} />

        {/* Admin — 5 tabs */}
        <Stack.Screen name="MainTabs" component={AdminTabs} />

        {/* Staff — 3 tabs */}
        <Stack.Screen name="StaffTabs" component={StaffTabs} />

        {/* Hidden stack screens (accessible from both roles) */}
        <Stack.Screen name="AddCategory" component={AddCategoryScreen} />
        <Stack.Screen name="Products" component={ProductScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="Billing" component={BillingScreen} />
        <Stack.Screen name="AddProduct" component={AddProductScreen} />
        <Stack.Screen name="ProductDetails" component={ProductdetailScreen} />
        <Stack.Screen name="StaffList" component={StaffListScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}