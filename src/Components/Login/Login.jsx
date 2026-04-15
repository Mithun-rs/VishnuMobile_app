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
  ActivityIndicator,
} from 'react-native';
import Person from '../../assets/person.svg';
import Eye from '../../assets/eye.svg';
import styles from './Login.styles';
import { supabase } from '../../lib/supabase';
import RegisterModal from './Register';

const LoginScreen = () => {
  const [username, setUsername]             = useState('');
  const [password, setPassword]             = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading]               = useState(false);
  const [registerVisible, setRegisterVisible] = useState(false);

  const handleLogin = async () => {
    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    if (!trimmedUser || !trimmedPass) {
      Alert.alert('Missing Fields', 'Please enter both username and password.');
      return;
    }

    setLoading(true);
    try {
      // ── Step 1: build email from username ─────────────────────────
      const email = `${trimmedUser.toLowerCase()}.vms@gmail.com`;

      // ── Step 2: sign in with Supabase Auth ────────────────────────
      let { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: trimmedPass,
      });

      // ── Step 2.5: Smart Retry for legacy accounts ──────────────────
      if (error && (error.message.includes('Invalid login credentials') || error.message.includes('User not found'))) {
        const legacyEmail = `${trimmedUser.toLowerCase()}@vishnumobileshop.com`;
        const { data: legacyData, error: legacyError } = await supabase.auth.signInWithPassword({
          email: legacyEmail,
          password: trimmedPass,
        });

        if (!legacyError) {
          data = legacyData;
          error = null;
        }
      }

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          Alert.alert('Login Failed', 'Invalid username or password.');
        } else {
          Alert.alert('Login Failed', error.message);
        }
        return;
      }

      // ── Step 3: Check if this account is approved ─────────────────
      const userId = data.user.id;
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('id, role, is_approved, full_name, username')
        .eq('id', userId)
        .maybeSingle();

      if (profileErr) {
        console.warn('Profile fetch error:', profileErr.message);
        // Let AppNavigator handle routing via AuthContext
        return;
      }

      // Fallback to JWT metadata if profile table doesn't have role
      const metaRole = data.user.user_metadata?.role || null;
      const dbRole = profileData?.role;

      // Admins are always approved; only block non-approved staff
      const isAdmin = 
        dbRole === 'admin' || 
        dbRole === 'attendance_admin' || 
        metaRole === 'admin' || 
        metaRole === 'attendance_admin';
        
      const isApproved = profileData?.is_approved === true;

      if (!isAdmin && !isApproved) {
        // Sign out to prevent unapproved access
        await supabase.auth.signOut();

        Alert.alert(
          '⏳ Approval Pending',
          'Your account is waiting for admin confirmation.\n\nPlease wait for approval before logging in.',
          [{ text: 'OK' }]
        );
        return;
      }

      // ── Step 4: Approved — AppNavigator handles routing ───────────
      console.log('✅ Login success:', data.user.email);

    } catch (e) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
      console.error('Login error:', e);
    } finally {
      setLoading(false);
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
                editable={!loading}
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
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                <Eye width={20} height={20} style={styles.icon} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Login  →</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotContainer}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <View style={{ height: 1, backgroundColor: '#eee', marginVertical: 20 }} />

            <TouchableOpacity 
              onPress={() => setRegisterVisible(true)} 
              style={[styles.forgotContainer, { flexDirection: 'row', gap: 6 }]}
            >
              <Text style={styles.forgotText}>Joining as staff?</Text>
              <Text style={[styles.forgotText, { color: '#3949ab', fontWeight: '700' }]}>Register here</Text>
            </TouchableOpacity>

            <Text style={styles.watermark}>VMS</Text>
          </View>

          <RegisterModal 
            visible={registerVisible} 
            onClose={() => setRegisterVisible(false)} 
          />

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