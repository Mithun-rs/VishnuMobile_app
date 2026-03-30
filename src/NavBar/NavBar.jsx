import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// Screens
import HomeScreen from '../Components/Home_page/HomePage';
import CategoryScreen from '../Components/Stock_page/Category/Category';
import AddCategoryScreen from '../Components/Stock_page/Category/Add_Categoty';
import PosScreen from '../Components/Pos/Pos_page';
import StaffScreen from '../Components/Staff_page/Staff_page';
import MoreScreen from '../Components/More_page/More_page';

// Icons
import HomeIcon from '../asset/Home.svg';
import CategoryIcon from '../asset/category.svg';
import PosIcon from '../asset/pos.svg';
import MoreIcon from '../asset/report.svg';
import StaffIcon from '../asset/staff.svg';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabScreens() {
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
  width={22}
  height={22}
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
            <CategoryIcon width={22}
  height={22}
  fill={focused ? '#2D2F8E' : '#8fa0b8'}
  stroke={focused ? '#2D2F8E' : '#8fa0b8'} />
          ),
        }}
      />

      <Tab.Screen
        name="POS"
        component={PosScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <PosIcon width={22}
  height={22}
  fill={focused ? '#2D2F8E' : '#8fa0b8'}
  stroke={focused ? '#2D2F8E' : '#8fa0b8'} />
          ),
        }}
      />

      <Tab.Screen
        name="Staff"
        component={StaffScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <StaffIcon width={22}
  height={22}
  fill={focused ? '#2D2F8E' : '#8fa0b8'}
  stroke={focused ? '#2D2F8E' : '#8fa0b8'} />
          ),
        }}
      />

      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <MoreIcon width={22}
  height={22}
  fill={focused ? '#2D2F8E' : '#8fa0b8'}
  stroke={focused ? '#2D2F8E' : '#8fa0b8'} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Tabs */}
        <Stack.Screen name="MainTabs" component={TabScreens} />

        {/* Hidden Screen (NOT in tab bar) */}
        <Stack.Screen name="AddCategory" component={AddCategoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}