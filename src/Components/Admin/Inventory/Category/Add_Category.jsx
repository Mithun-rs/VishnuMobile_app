import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import Person from '../../../../assets/person.svg';
import BackArrow from '../../../../assets/back-arrow.svg';
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../../../../lib/supabase";

// ── Emoji options for category icons ──────────────────────────────────
const ICON_OPTIONS = [
  '📱', '💻', '🎧', '🖥️', '⌚', '📷', '🎮', '🔋',
  '🖨️', '🖱️', '⌨️', '📡', '🔌', '💡', '🎙️', '📺',
  '🔭', '🧲', '💾', '📀', '🗂️', '📦', '🛍️', '🏷️',
];

export default function AddCategoryScreen() {
  const navigation = useNavigation();

  const [categoryName, setCategoryName] = useState("");
  const [categoryDesc, setCategoryDesc] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("🗂️");
  const [saving, setSaving]             = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);

  // ── Save category to Supabase ──────────────────────────────────────
  const handleSave = async () => {
    if (!categoryName.trim()) {
      Alert.alert("Validation", "Please enter a category name.");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('categories').insert({
        name: categoryName.trim(),
        icon: selectedIcon,
      });

      if (error) {
        if (error.code === '23505') {
          // Unique constraint violation
          Alert.alert('Duplicate', `Category "${categoryName.trim()}" already exists.`);
        } else {
          throw error;
        }
        return;
      }

      Alert.alert('✅ Success', 'Category saved successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      console.error('handleSave error:', e.message);
      Alert.alert('Error', e.message || 'Failed to save category.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setCategoryName('');
    setCategoryDesc('');
    setSelectedIcon('🗂️');
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <BackArrow width={20} height={20} fill="#2D2F8E" stroke="#2D2F8E" />
        </TouchableOpacity>
        <Text style={styles.title}>Shop Manager</Text>
        <View style={styles.profile}>
          <Person width={20} height={20} fill="#fff" />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* PAGE TITLE */}
        <View style={styles.section}>
          <Text style={styles.subTitle}>CATALOG CONTROL</Text>
          <Text style={styles.mainTitle}>Add Category</Text>
        </View>

        {/* FORM CARD */}
        <View style={styles.formCard}>
          <Text style={styles.formCardTitle}>New Category Details</Text>

          {/* ── ICON PICKER ── */}
          <Text style={styles.label}>CATEGORY ICON</Text>
          <TouchableOpacity
            style={styles.iconPickerBtn}
            onPress={() => setShowIconPicker(!showIconPicker)}
            activeOpacity={0.8}
          >
            <Text style={styles.iconPickerEmoji}>{selectedIcon}</Text>
            <Text style={styles.iconPickerLabel}>
              {showIconPicker ? 'Close picker ▲' : 'Change icon ▾'}
            </Text>
          </TouchableOpacity>

          {showIconPicker && (
            <View style={styles.iconGrid}>
              {ICON_OPTIONS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={[styles.iconOption, selectedIcon === emoji && styles.iconOptionActive]}
                  onPress={() => { setSelectedIcon(emoji); setShowIconPicker(false); }}
                >
                  <Text style={styles.iconOptionEmoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* ── CATEGORY NAME ── */}
          <Text style={styles.label}>CATEGORY NAME *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Smartphones, Accessories"
            placeholderTextColor="#aaa"
            value={categoryName}
            onChangeText={setCategoryName}
            editable={!saving}
          />

          {/* ── DESCRIPTION ── */}
          <Text style={styles.label}>DESCRIPTION (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Brief description of this category"
            placeholderTextColor="#aaa"
            value={categoryDesc}
            onChangeText={setCategoryDesc}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            editable={!saving}
          />

          {/* ── PREVIEW ── */}
          <View style={styles.previewBox}>
            <Text style={styles.previewLabel}>PREVIEW</Text>
            <View style={styles.previewCard}>
              <View style={styles.previewIconBox}>
                <Text style={styles.previewIcon}>{selectedIcon}</Text>
              </View>
              <Text style={styles.previewName}>{categoryName || 'Category Name'}</Text>
              <Text style={styles.previewSub}>0 Products</Text>
            </View>
          </View>

          {/* ── BUTTONS ── */}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset} disabled={saving}>
              <Text style={styles.resetBtnText}>↺ Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>💾 Save Category</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA' },
  header: {
    backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: 'bold', color: '#2D2F8E' },
  profile: {
    width: 36, height: 36, backgroundColor: '#2D2F8E',
    borderRadius: 10, alignItems: 'center', justifyContent: 'center',
  },
  scrollContent: { paddingBottom: 40 },
  section: { paddingHorizontal: 16, marginTop: 10, marginBottom: 16 },
  subTitle: { fontSize: 10, color: '#999', letterSpacing: 2 },
  mainTitle: { fontSize: 28, fontWeight: 'bold', marginTop: 5 },

  formCard: {
    backgroundColor: '#fff', marginHorizontal: 16,
    borderRadius: 16, padding: 20, elevation: 3,
  },
  formCardTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 20 },

  label: { fontSize: 10, fontWeight: '700', color: '#999', letterSpacing: 1.2, marginBottom: 8, marginTop: 14 },

  // Icon Picker
  iconPickerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#F5F6FA', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  iconPickerEmoji: { fontSize: 28 },
  iconPickerLabel: { fontSize: 13, color: '#2D2F8E', fontWeight: '600' },
  iconGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12,
    backgroundColor: '#F8F9FF', borderRadius: 12, padding: 12,
  },
  iconOption: {
    width: 44, height: 44, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0',
  },
  iconOptionActive: { backgroundColor: '#EEF0FF', borderColor: '#2D2F8E', borderWidth: 2 },
  iconOptionEmoji: { fontSize: 22 },

  input: {
    backgroundColor: '#F0F2FA', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: '#333',
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  textArea: { height: 80, paddingTop: 12 },

  // Preview
  previewBox: { marginTop: 20, alignItems: 'center' },
  previewLabel: { fontSize: 10, color: '#999', letterSpacing: 1.5, marginBottom: 12 },
  previewCard: {
    backgroundColor: '#F8F9FF', borderRadius: 14, padding: 20,
    alignItems: 'center', width: '50%', elevation: 2,
    borderWidth: 1, borderColor: '#EEF0FF',
  },
  previewIconBox: { backgroundColor: '#EEF0FF', padding: 12, borderRadius: 12, marginBottom: 8 },
  previewIcon: { fontSize: 28 },
  previewName: { fontWeight: '700', fontSize: 13, color: '#1E293B', textAlign: 'center' },
  previewSub: { color: '#2D2F8E', fontSize: 11, marginTop: 3, fontWeight: '600' },

  // Buttons
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  resetBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#D0D5E8',
    alignItems: 'center', justifyContent: 'center',
  },
  resetBtnText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  saveBtn: {
    flex: 2, paddingVertical: 14, borderRadius: 12,
    backgroundColor: '#2D2F8E', alignItems: 'center', justifyContent: 'center',
  },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});