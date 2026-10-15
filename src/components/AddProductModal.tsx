import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product, ShopSettings } from '../types';
import { INITIAL_CATEGORIES } from '../database/sqlite';

interface AddProductModalProps {
  visible: boolean;
  onClose: () => void;
  onSaveProduct: (product: Product) => void;
  editingProduct?: Product | null;
  settings: ShopSettings;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  visible,
  onClose,
  onSaveProduct,
  editingProduct,
  settings,
}) => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('groceries');
  const [barcode, setBarcode] = useState('');
  const [hsn, setHsn] = useState('2106');
  const [mrp, setMrp] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [gstRate, setGstRate] = useState<number>(18);
  const [stock, setStock] = useState('50');
  const [unit, setUnit] = useState('pcs');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setBrand(editingProduct.brand);
      setCategory(editingProduct.category);
      setBarcode(editingProduct.barcode);
      setHsn(editingProduct.hsn);
      setMrp(editingProduct.mrp.toString());
      setSellingPrice(editingProduct.sellingPrice.toString());
      setGstRate(editingProduct.gstRate);
      setStock(editingProduct.stock.toString());
      setUnit(editingProduct.unit);
      setImageUrl(editingProduct.image || '');
    } else {
      setName('');
      setBrand('');
      setCategory('groceries');
      setBarcode(`890${Math.floor(1000000000 + Math.random() * 9000000000)}`);
      setHsn('2106');
      setMrp('');
      setSellingPrice('');
      setGstRate(18);
      setStock('50');
      setUnit('pcs');
      setImageUrl('');
    }
  }, [editingProduct, visible]);

  const handleSave = () => {
    if (!name.trim() || !sellingPrice.trim()) {
      alert('Please provide Product Name and Selling Price');
      return;
    }

    const price = parseFloat(sellingPrice) || 0;
    const mrpVal = parseFloat(mrp) || Math.round(price * 1.1);

    const product: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name: name.trim(),
      brand: brand.trim() || 'Retail',
      category,
      barcode: barcode.trim() || `890${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      hsn: hsn.trim() || '2106',
      mrp: mrpVal,
      sellingPrice: price,
      gstRate,
      stock: parseInt(stock, 10) || 0,
      unit: unit.trim() || 'pcs',
      image: imageUrl.trim() || undefined,
      keywords: [
        ...name.toLowerCase().split(/\s+/),
        brand.toLowerCase(),
        category.toLowerCase(),
      ],
    };

    onSaveProduct(product);
    onClose();
  };

  const gstOptions = [0, 5, 12, 18, 28];
  const unitOptions = ['pcs', 'pkt', 'kg', 'ltr', 'box', 'gm'];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>
                {editingProduct ? 'Edit Product' : 'Add New Retail Product'}
              </Text>
              <Text style={styles.headerSubtitle}>
                Saves to local SQLite database catalog
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Name & Brand */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Product Title *</Text>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Britannia Good Day Cashew 100g"
                placeholderTextColor="#64748B"
              />
            </View>

            <View style={styles.inlineRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>Brand Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={brand}
                  onChangeText={setBrand}
                  placeholder="e.g. Britannia"
                  placeholderTextColor="#64748B"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Barcode (EAN/UPC)</Text>
                <TextInput
                  style={styles.textInput}
                  value={barcode}
                  onChangeText={setBarcode}
                  placeholder="Barcode"
                  placeholderTextColor="#64748B"
                />
              </View>
            </View>

            {/* Category */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
                {INITIAL_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryPill,
                      category === cat.id && styles.categoryPillActive,
                    ]}
                    onPress={() => setCategory(cat.id)}
                  >
                    <Text
                      style={[
                        styles.categoryPillText,
                        category === cat.id && styles.categoryPillTextActive,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* GST Rate Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Statutory GST Rate Slab (%)</Text>
              <View style={styles.gstPillsRow}>
                {gstOptions.map((rate) => (
                  <TouchableOpacity
                    key={rate}
                    style={[
                      styles.gstPill,
                      gstRate === rate && styles.gstPillActive,
                    ]}
                    onPress={() => setGstRate(rate)}
                  >
                    <Text
                      style={[
                        styles.gstPillText,
                        gstRate === rate && styles.gstPillTextActive,
                      ]}
                    >
                      {rate}% {rate === 0 ? '(Exempt)' : ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* HSN Code & Prices */}
            <View style={styles.inlineRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>HSN / SAC Code</Text>
                <TextInput
                  style={styles.textInput}
                  value={hsn}
                  onChangeText={setHsn}
                  placeholder="e.g. 1905"
                  placeholderTextColor="#64748B"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>Selling Price ({settings.currencySymbol}) *</Text>
                <TextInput
                  style={styles.textInput}
                  value={sellingPrice}
                  onChangeText={setSellingPrice}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor="#64748B"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>MRP ({settings.currencySymbol})</Text>
                <TextInput
                  style={styles.textInput}
                  value={mrp}
                  onChangeText={setMrp}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor="#64748B"
                />
              </View>
            </View>

            {/* Stock & Unit */}
            <View style={styles.inlineRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>Initial Stock</Text>
                <TextInput
                  style={styles.textInput}
                  value={stock}
                  onChangeText={setStock}
                  keyboardType="numeric"
                  placeholder="50"
                  placeholderTextColor="#64748B"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1.5 }]}>
                <Text style={styles.inputLabel}>Unit of Measurement</Text>
                <View style={styles.unitRow}>
                  {unitOptions.map((u) => (
                    <TouchableOpacity
                      key={u}
                      style={[styles.unitChip, unit === u && styles.unitChipActive]}
                      onPress={() => setUnit(u)}
                    >
                      <Text
                        style={[
                          styles.unitChipText,
                          unit === u && styles.unitChipTextActive,
                        ]}
                      >
                        {u}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Product Image URL */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Image URL (optional)</Text>
              <TextInput
                style={styles.textInput}
                value={imageUrl}
                onChangeText={setImageUrl}
                placeholder="https://..."
                placeholderTextColor="#64748B"
              />
            </View>
          </ScrollView>

          {/* Action */}
          <View style={styles.footerAction}>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>
                {editingProduct ? 'Update Product' : 'Save Product to SQLite'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '94%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
  scrollBody: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 5,
  },
  textInput: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
  },
  inlineRow: {
    flexDirection: 'row',
  },
  pillRow: {
    flexDirection: 'row',
  },
  categoryPill: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    marginRight: 8,
  },
  categoryPillActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  categoryPillText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
  },
  gstPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  gstPill: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  gstPillActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  gstPillText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
  },
  gstPillTextActive: {
    color: '#FFFFFF',
  },
  unitRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  unitChip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  unitChipActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  unitChipText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  unitChipTextActive: {
    color: '#FFFFFF',
  },
  footerAction: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
