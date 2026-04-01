import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Person from '../../asset/person.svg';
import Eye from '../../asset/eye.svg';
import styles from './login_page_css';

const USERS = [
  { username: 'Admin', password: 'Admin@123', role: 'admin' },
  { username: 'Staff', password: 'Staff@123', role: 'staff' },
];

const LoginScreen = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleLogin = () => {
    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    if (!trimmedUser || !trimmedPass) {
      Alert.alert('Missing Fields', 'Please enter both username and password.');
      return;
    }

    const matched = USERS.find(
      (u) => u.username === trimmedUser && u.password === trimmedPass
    );

    if (!matched) {
      Alert.alert('Login Failed', 'Invalid username or password.');
      return;
    }

    if (matched.role === 'admin') {
      navigation.replace('MainTabs');
    } else {
      navigation.replace('StaffTabs');
    }
  };

  const handleForgotPassword = () => {
    Alert.alert('Forgot Password', 'Please contact your administrator.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f0f5" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.backgroundTop} />
          <View style={styles.backgroundBottom} />

          <View style={styles.card}>
            <View style={styles.logoContainer}>
              <View style={styles.logoBox}>
                <Text style={styles.logoText}>Vishnu</Text>
              </View>
            </View>

            <Text style={styles.title}>Vishnu Mobile Shop</Text>
            <Text style={styles.subtitle}>Inventory Management System</Text>

            <Text style={styles.label}>USERNAME</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter your username"
                placeholderTextColor="#aaa"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Person width={20} height={20} style={styles.icon} />
            </View>

            <Text style={styles.label}>PASSWORD</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#aaa"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!passwordVisible}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                <Eye width={20} height={20} style={styles.icon} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={0.85}>
              <Text style={styles.loginButtonText}>Login  →</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotContainer}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <Text style={styles.watermark}>VMS</Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2024 Vishnu Mobile Shop Inventory Management System
            </Text>
            <View style={styles.footerLinks}>
              <TouchableOpacity><Text style={styles.footerLink}>Privacy Policy</Text></TouchableOpacity>
              <Text style={styles.footerSeparator}> · </Text>
              <TouchableOpacity><Text style={styles.footerLink}>Terms of Service</Text></TouchableOpacity>
              <Text style={styles.footerSeparator}> · </Text>
              <TouchableOpacity><Text style={styles.footerLink}>Support</Text></TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;