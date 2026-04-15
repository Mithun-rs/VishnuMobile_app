import React from 'react';
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

// ─── Admin Tabs (all 5) ───────────────────────────────────────────────────────
export function AdminTabs() {
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
        component={StaffListScreen}
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
        component={ReportScreen}
        options={{
          tabBarLabel: 'Report',
          tabBarIcon: ({ focused }) => (
            <ReportIcon
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
export function StaffTabs() {
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
        component={StaffDashboard}
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