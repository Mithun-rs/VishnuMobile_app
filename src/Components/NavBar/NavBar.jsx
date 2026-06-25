import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Screens — Admin tabs
import HomeScreen from '../Admin/Home/HomePage';
import CategoryScreen from '../Admin/Inventory/Category/Category';
import StaffListScreen from '../Admin/StaffList/StaffList';
import ReportScreen from '../Admin/More/More';

// Screens — Shared / Staff tabs
import PosScreen from '../Pos/Pos';
import StaffDashboard from '../Staff/StaffDashboard/StaffDashboard';
import StaffScanAttendance from '../Staff/StaffScanAttendance/StaffScanAttendance';

// Icons
import HomeIcon from '../../assets/Home.svg';
import CategoryIcon from '../../assets/category.svg';
import PosIcon from '../../assets/pos.svg';
import ReportIcon from '../../assets/report.svg';
import StaffIcon from '../../assets/staff.svg';

const Tab = createBottomTabNavigator();

const ACTIVE_COLOR = '#2D2F8E';
const INACTIVE_COLOR = '#8fa0b8';
const ACTIVE_BG = '#E8E8F5'; // light blue-purple background

// Reusable wrapper for tab icons with background highlight
const TabIcon = ({ focused, children }) => (
  <View
    style={{
      backgroundColor: focused ? ACTIVE_BG : 'transparent',
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 6,
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {children}
  </View>
);

// ─── Admin Tabs (all 5) ───────────────────────────────────────────────────────
export function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { height: 68 },
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused}>
              <HomeIcon
                width={22} height={22}
                fill={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
              />
            </TabIcon>
          ),
        }}
      />
      <Tab.Screen
        name="Stock"
        component={CategoryScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused}>
              <CategoryIcon
                width={22} height={22}
                fill={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
              />
            </TabIcon>
          ),
        }}
      />
      <Tab.Screen
        name="POS"
        component={PosScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused}>
              <PosIcon
                width={22} height={22}
                fill={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
              />
            </TabIcon>
          ),
        }}
      />
      <Tab.Screen
        name="Staff"
        component={StaffListScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused}>
              <StaffIcon
                width={22} height={22}
                fill={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
              />
            </TabIcon>
          ),
        }}
      />
      <Tab.Screen
        name="Report"
        component={ReportScreen}
        options={{
          tabBarLabel: 'Report',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused}>
              <ReportIcon
                width={22} height={22}
                fill={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
              />
            </TabIcon>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ─── Staff Tabs (only 3) ──────────────────────────────────────────────────────
export function StaffTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { height: 68 },
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
      }}
    >
      <Tab.Screen
        name="Home"
        component={StaffDashboard}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused}>
              <HomeIcon
                width={22} height={22}
                fill={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
              />
            </TabIcon>
          ),
        }}
      />
      <Tab.Screen
        name="POS"
        component={PosScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused}>
              <PosIcon
                width={22} height={22}
                fill={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
              />
            </TabIcon>
          ),
        }}
      />
      <Tab.Screen
        name="Attendance"
        component={StaffScanAttendance}
        options={{
          tabBarLabel: 'Attendance',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused}>
              <StaffIcon
                width={22} height={22}
                fill={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
              />
            </TabIcon>
          ),
        }}
      />
    </Tab.Navigator>
  );
}