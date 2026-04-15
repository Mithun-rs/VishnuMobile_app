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
  Modal,
} from 'react-native';
import Person from '../../assets/person.svg';
import Eye from '../../assets/eye.svg';
import styles from './Login.styles';
import { supabase } from '../../lib/supabase';

const RegisterModal = ({ visible, onClose }) => {
  const [fullName, setFullName]             = useState('');
  const [username, setUsername]             = useState('');
  const [password, setPassword]             = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading]               = useState(false);

  const handleRegister = async () => {
    const trimmedFull = fullName.trim();
    const trimmedUser = username.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedFull || !trimmedUser || !trimmedPass) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }

    if (trimmedPass.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const email = `${trimmedUser}.vms@gmail.com`;

      // 1. Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password: trimmedPass,
        options: {
          data: {
            full_name: trimmedFull,
            username: trimmedUser,
            role: 'staff',
          }
        }
      });

      if (error) throw error;

      // 2. Success message
      Alert.alert(
        '🎉 Registration Sent',
        'Your registration has been submitted successfully.\n\nAn administrator must approve your account before you can log in.',
        [{ text: 'OK', onPress: onClose }]
      );

    } catch (e) {
      console.error('Registration error:', e.message);
      Alert.alert('Registration Failed', e.message || 'Could not complete registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <StatusBar barStyle="light-content" />
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={[styles.scrollContainer, { justifyContent: 'flex-end', paddingBottom: 0 }]}
            keyboardShouldPersistTaps="handled"
          >
            <View style={[styles.card, { width: '100%', maxWidth: '100%', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }]}>
              <View style={styles.logoContainer}>
                <View style={[styles.logoBox, { backgroundColor: '#3949ab' }]}>
                  <Person width={32} height={32} fill="#fff" />
                </View>
              </View>

              <Text style={styles.title}>Join as Staff</Text>
              <Text style={styles.subtitle}>Create your account for approval</Text>

              <Text style={styles.label}>FULL NAME</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Rahul Sharma"
                  placeholderTextColor="#aaa"
                  value={fullName}
                  onChangeText={setFullName}
                  editable={!loading}
                />
              </View>

              <Text style={styles.label}>USERNAME</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Choose a username"
                  placeholderTextColor="#aaa"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>

              <Text style={styles.label}>PASSWORD</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Choose a password"
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
                onPress={handleRegister}
                activeOpacity={0.85}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginButtonText}>SUBMIT REGISTRATION</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={onClose} style={[styles.forgotContainer, { marginBottom: 30 }]}>
                <Text style={[styles.forgotText, { color: '#3949ab', fontWeight: '700' }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

export default RegisterModal;
