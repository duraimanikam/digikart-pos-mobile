import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AppHeader } from '../components/AppHeader';
import { COLORS, SHADOWS } from '../theme/colors';
import { Product } from '../types';

interface ProductDetailsScreenProps {
  product?: Product | null;
  onBack: () => void;
  onSaveProduct: (product: Product) => void;
  onOpenScanner?: () => void;
}

export const ProductDetailsScreen: React.FC<ProductDetailsScreenProps> = ({
  product,
  onBack,
  onSaveProduct,
  onOpenScanner,
}) => {
  const [imageUri, setImageUri] = useState<string>(
    product?.image || 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=300&q=80'
  );
  const [name, setName] = useState(product?.name || 'Aachi Turmeric Powder');
  const [barcode, setBarcode] = useState(product?.barcode || '8906021123456');
  const [category, setCategory] = useState(product?.category || 'Spices');
  const [unit, setUnit] = useState(product?.unit || '500 g');
  const [gstRate, setGstRate] = useState(product ? String(product.gstRate) : '5');
  const [purchaseRate, setPurchaseRate] = useState(
    product?.purchaseRate ? String(product.purchaseRate) : '90.00'
  );
  const [sellingRate, setSellingRate] = useState(
    product ? String(product.sellingPrice) : '120.00'
  );
  const [openingStock, setOpeningStock] = useState(
    product ? String(product.stock) : '45'
  );

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch {
      // Fallback
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Product Name is required');
      return;
    }

    const updatedProduct: Product = {
      id: product?.id || `prod-${Date.now()}`,
      name: name.trim(),
      brand: product?.brand || 'Aachi',
      category: category.toLowerCase(),
      barcode: barcode.trim() || `${Math.floor(1000000000000 + Math.random() * 9000000000000)}`,
      hsn: product?.hsn || '0910',
      mrp: parseFloat(sellingRate) || 120,
      purchaseRate: parseFloat(purchaseRate) || 90,
      sellingPrice: parseFloat(sellingRate) || 120,
      gstRate: parseFloat(gstRate) || 5,
      stock: parseInt(openingStock, 10) || 45,
      unit: unit.trim() || '500 g',
      image: imageUri,
      keywords: [name.toLowerCase(), category.toLowerCase()],
    };

    onSaveProduct(updatedProduct);
    onBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg} />

      {/* Screen 7 Header matching Image 1 Screen 7 */}
      <AppHeader
        title="Product Details"
        showBack={true}
        onBack={onBack}
        rightIcon="create-outline"
        onRightPress={handleSave}
      />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Photo Upload Container with Camera Badge */}
        <View style={styles.imageSection}>
          <View style={styles.imageBox}>
            <Image source={{ uri: imageUri }} style={styles.productImg} resizeMode="cover" />
            <TouchableOpacity
              style={styles.cameraBadge}
              onPress={handlePickImage}
              activeOpacity={0.8}
            >
              <Ionicons name="camera" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Fields matching Screen 7 */}
        <View style={styles.formCard}>
          {/* Product Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Product Name</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Aachi Turmeric Powder"
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* Barcode with Scan Icon */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Barcode</Text>
            <View style={styles.inputWithIcon}>
              <TextInput
                style={styles.inputFieldInner}
                value={barcode}
                onChangeText={setBarcode}
                placeholder="Barcode"
                placeholderTextColor="#94A3B8"
              />
              <TouchableOpacity
                style={styles.scanBtn}
                onPress={onOpenScanner}
                activeOpacity={0.7}
              >
                <Ionicons name="scan-outline" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Category Dropdown */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.dropdownInput}>
              <Text style={styles.dropdownText}>{category}</Text>
              <Ionicons name="chevron-down" size={18} color="#64748B" />
            </View>
          </View>

          {/* Unit & GST % 2-column row */}
          <View style={styles.twoColRow}>
            <View style={[styles.inputGroup, styles.colHalf]}>
              <Text style={styles.inputLabel}>Unit</Text>
              <TextInput
                style={styles.textInput}
                value={unit}
                onChangeText={setUnit}
                placeholder="500 g"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={[styles.inputGroup, styles.colHalf]}>
              <Text style={styles.inputLabel}>GST %</Text>
              <TextInput
                style={styles.textInput}
                value={gstRate}
                onChangeText={setGstRate}
                keyboardType="numeric"
                placeholder="5"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          {/* Purchase Rate & Selling Rate 2-column row */}
          <View style={styles.twoColRow}>
            <View style={[styles.inputGroup, styles.colHalf]}>
              <Text style={styles.inputLabel}>Purchase Rate</Text>
              <TextInput
                style={styles.textInput}
                value={purchaseRate}
                onChangeText={setPurchaseRate}
                keyboardType="decimal-pad"
                placeholder="90.00"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={[styles.inputGroup, styles.colHalf]}>
              <Text style={styles.inputLabel}>Selling Rate</Text>
              <TextInput
                style={styles.textInput}
                value={sellingRate}
                onChangeText={setSellingRate}
                keyboardType="decimal-pad"
                placeholder="120.00"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          {/* Opening Stock */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Opening Stock</Text>
            <TextInput
              style={styles.textInput}
              value={openingStock}
              onChangeText={setOpeningStock}
              keyboardType="numeric"
              placeholder="45"
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

        {/* Save Product Master Button */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
          <Text style={styles.saveBtnText}>Save Product</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  body: {
    padding: 16,
    paddingBottom: 30,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  imageBox: {
    width: 110,
    height: 110,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
    overflow: 'visible',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.card,
  },
  productImg: {
    width: 100,
    height: 100,
    borderRadius: 14,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...SHADOWS.card,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  inputFieldInner: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  scanBtn: {
    padding: 4,
  },
  dropdownInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  dropdownText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 12,
  },
  colHalf: {
    flex: 1,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    ...SHADOWS.card,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
