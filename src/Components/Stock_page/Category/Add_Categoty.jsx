import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Image,
  Alert,
} from "react-native";
import Person from '../../../asset/person.svg';
import BackArrow from '../../../asset/back-arrow.svg';
import Upload from '../../../asset/upload.svg';
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { launchImageLibrary } from "react-native-image-picker";

export default function AddCategoryScreen() {
  const navigation = useNavigation();
  const [categoryName, setCategoryName] = useState("");
  const [categoryDesc, setCategoryDesc] = useState("");
  const [imageUri, setImageUri] = useState(null);

  // Open image picker
  const handleUploadImage = () => {
    launchImageLibrary({ mediaType: "photo", quality: 0.8 }, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert("Error", response.errorMessage);
        return;
      }
      const uri = response.assets?.[0]?.uri;
      if (uri) setImageUri(uri);
    });
  };

  // Save category to AsyncStorage
  const handleSave = async () => {
    if (!categoryName.trim()) {
      Alert.alert("Validation", "Please enter a category name.");
      return;
    }

    try {
      const existing = await AsyncStorage.getItem("categories");
      const categories = existing ? JSON.parse(existing) : [];

      const newCategory = {
        id: Date.now().toString(),
        name: categoryName.trim(),
        description: categoryDesc.trim(),
        imageUri: imageUri || null,
        productCount: 0,
      };

      categories.push(newCategory);
      await AsyncStorage.setItem("categories", JSON.stringify(categories));

      Alert.alert("Success", "Category saved successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to save category.");
    }
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
          <Text style={styles.formCardTitle}>Add New Category</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>

          {/* Category Name */}
          <Text style={styles.label}>CATEGORY NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter category name"
            placeholderTextColor="#aaa"
            value={categoryName}
            onChangeText={setCategoryName}
          />

          {/* Category Description */}
          <Text style={styles.label}>CATEGORY DESCRIPTION</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter a brief description"
            placeholderTextColor="#aaa"
            value={categoryDesc}
            onChangeText={setCategoryDesc}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* Image Upload */}
          <Text style={styles.label}>CATEGORY IMAGE UPLOAD</Text>
          <TouchableOpacity style={styles.uploadBox} onPress={handleUploadImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.uploadedImage} />
            ) : (
              <>
                <View style={styles.uploadIconBox}>
                  <Upload width={28} height={28} fill="#2D2F8E" stroke="#2D2F8E" />
                </View>
                <Text style={styles.uploadText}>Upload Image</Text>
                <Text style={styles.uploadSub}>PNG, JPG up to 5MB</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Thumbnail preview row */}
          {imageUri && (
            <View style={styles.thumbRow}>
              <Image source={{ uri: imageUri }} style={styles.thumb} />
              <TouchableOpacity style={styles.thumbRemove} onPress={() => setImageUri(null)}>
                <Text style={styles.thumbRemoveText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save{"\n"}Category</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },

  // Header
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D2F8E",
  },
  profile: {
    width: 36,
    height: 36,
    backgroundColor: "#2D2F8E",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  // Page title
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 10,
    color: "#999",
    letterSpacing: 2,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 5,
  },

  // Form card
  formCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    position: "relative",
  },
  formCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: 20,
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  closeBtnText: {
    fontSize: 16,
    color: "#999",
  },

  // Labels & inputs
  label: {
    fontSize: 10,
    fontWeight: "700",
    color: "#999",
    letterSpacing: 1.2,
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: "#F0F2FA",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#333",
  },
  textArea: {
    height: 90,
    paddingTop: 12,
  },

  // Upload
  uploadBox: {
    borderWidth: 1.5,
    borderColor: "#D0D5E8",
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAFBFF",
    marginTop: 2,
  },
  uploadIconBox: {
    width: 48,
    height: 48,
    backgroundColor: "#EEF0FF",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2D2F8E",
  },
  uploadSub: {
    fontSize: 11,
    color: "#aaa",
    marginTop: 3,
  },
  uploadedImage: {
    width: "100%",
    height: 140,
    borderRadius: 10,
  },

  // Thumbnail row
  thumbRow: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  thumbRemove: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#F0F2FA",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  thumbRemoveText: {
    color: "#999",
    fontSize: 14,
  },

  // Buttons
  btnRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 28,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#D0D5E8",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#1E1F8F",
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    lineHeight: 20,
  },
});