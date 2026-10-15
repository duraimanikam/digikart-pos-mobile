import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { COLORS, SHADOWS } from '../theme/colors';

interface ExpenseVoucherScreenProps {
  onBack: () => void;
  onSaved: () => void;
}

export const ExpenseVoucherScreen: React.FC<ExpenseVoucherScreenProps> = ({
  onBack,
  onSaved,
}) => {
  const [date, setDate] = useState('15-10-2026');
  const [voucherNo, setVoucherNo] = useState('EXP0045');
  const [category, setCategory] = useState('Electricity');
  const [account, setAccount] = useState('Electricity Expenses');
  const [amount, setAmount] = useState('1,250.00');
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'Bank' | 'UPI'>('Cash');
  const [referenceNo, setReferenceNo] = useState('NEFT123456');
  const [notes, setNotes] = useState('Electricity bill for October 2026');

  const handleSave = () => {
    Alert.alert(
      'Voucher Saved',
      `Expense voucher #${voucherNo} for ₹${amount} recorded successfully.`,
      [{ text: 'OK', onPress: onSaved }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg} />

      {/* Screen 17 Header matching Image 2 Screen 7 */}
      <AppHeader title="New Expense Voucher" showBack={true} onBack={onBack} />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          {/* Date & Voucher No 2-col row */}
          <View style={styles.twoColRow}>
            <View style={[styles.inputGroup, styles.colHalf]}>
              <Text style={styles.inputLabel}>Date</Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={styles.innerField}
                  value={date}
                  onChangeText={setDate}
                />
                <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
              </View>
            </View>

            <View style={[styles.inputGroup, styles.colHalf]}>
              <Text style={styles.inputLabel}>Voucher No</Text>
              <TextInput
                style={styles.textInput}
                value={voucherNo}
                onChangeText={setVoucherNo}
              />
            </View>
          </View>

          {/* Category Dropdown */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.dropdownInput}>
              <Text style={styles.dropdownValue}>{category}</Text>
              <Ionicons name="chevron-down" size={18} color="#64748B" />
            </View>
          </View>

          {/* Account Dropdown */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Account</Text>
            <View style={styles.dropdownInput}>
              <Text style={styles.dropdownValue}>{account}</Text>
              <Ionicons name="chevron-down" size={18} color="#64748B" />
            </View>
          </View>

          {/* Amount (₹) */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Amount (₹)</Text>
            <TextInput
              style={styles.textInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Payment Mode Radio Buttons */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Payment Mode</Text>
            <View style={styles.radioRow}>
              {(['Cash', 'Bank', 'UPI'] as const).map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={styles.radioItem}
                  onPress={() => setPaymentMode(mode)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={paymentMode === mode ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={paymentMode === mode ? COLORS.primary : '#94A3B8'}
                  />
                  <Text style={[styles.radioLabel, paymentMode === mode && styles.radioLabelActive]}>
                    {mode}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Reference No */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Reference No</Text>
            <TextInput
              style={styles.textInput}
              value={referenceNo}
              onChangeText={setReferenceNo}
            />
          </View>

          {/* Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Notes</Text>
            <TextInput
              style={[styles.textInput, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={2}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.footerRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onBack} activeOpacity={0.7}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
            <Text style={styles.saveBtnText}>Save Voucher</Text>
          </TouchableOpacity>
        </View>
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
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 12,
  },
  colHalf: {
    flex: 1,
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
  innerField: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
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
  dropdownValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingVertical: 4,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  radioLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  radioLabelActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  notesInput: {
    height: 60,
    textAlignVertical: 'top',
    paddingVertical: 8,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: COLORS.textSecondary,
    fontWeight: '700',
    fontSize: 14,
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.card,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
