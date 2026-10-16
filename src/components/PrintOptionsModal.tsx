import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme/colors';
import { Invoice, ShopSettings } from '../types';
import { receiptService } from '../services/receiptService';

interface PrintOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  settings: ShopSettings;
}

export const PrintOptionsModal: React.FC<PrintOptionsModalProps> = ({
  visible,
  onClose,
  invoice,
  settings,
}) => {
  const [paperWidth, setPaperWidth] = useState<58 | 80>(80);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printStatus, setPrintStatus] = useState<string | null>(null);

  if (!invoice) return null;

  const handlePrintWifiA4 = async () => {
    setIsPrinting(true);
    setPrintStatus('Generating A4 GST Tax Invoice for Wi-Fi Printer...');
    try {
      const res = await receiptService.printA4Wifi(invoice, settings);
      setIsPrinting(false);
      setPrintStatus(null);
      if (res.success) {
        Alert.alert(
          'Wi-Fi Printer',
          `Full A4 GST Tax Invoice #${invoice.invoiceNo} successfully prepared for Wi-Fi / Network printer.`
        );
        onClose();
      }
    } catch (err: any) {
      setIsPrinting(false);
      setPrintStatus(null);
      Alert.alert('Print Error', err?.message || 'Failed to print via Wi-Fi');
    }
  };

  const handlePrintBluetoothThermal = async () => {
    setIsPrinting(true);
    setPrintStatus(`Connecting & streaming to Bluetooth Thermal Printer (${paperWidth}mm)...`);
    try {
      const res = await receiptService.printThermalBluetooth(invoice, settings, paperWidth);
      setIsPrinting(false);
      setPrintStatus(null);
      if (res.success) {
        Alert.alert(
          'Bluetooth Thermal Print',
          `Thermal bill #${invoice.invoiceNo} (${paperWidth}mm) sent to Bluetooth printer.`
        );
        onClose();
      }
    } catch (err: any) {
      setIsPrinting(false);
      setPrintStatus(null);
      Alert.alert('Bluetooth Error', err?.message || 'Failed to print via Bluetooth');
    }
  };

  const handleShareA4Pdf = async () => {
    setIsPrinting(true);
    setPrintStatus('Creating A4 GST Invoice PDF...');
    try {
      await receiptService.shareInvoicePdf(invoice, settings, 'a4');
      setIsPrinting(false);
      setPrintStatus(null);
    } catch (err: any) {
      setIsPrinting(false);
      setPrintStatus(null);
      Alert.alert('Share Error', err?.message || 'Failed to share PDF');
    }
  };

  const handleShareThermalPdf = async () => {
    setIsPrinting(true);
    setPrintStatus('Creating Thermal Slip PDF...');
    try {
      await receiptService.shareInvoicePdf(invoice, settings, 'thermal');
      setIsPrinting(false);
      setPrintStatus(null);
    } catch (err: any) {
      setIsPrinting(false);
      setPrintStatus(null);
      Alert.alert('Share Error', err?.message || 'Failed to share PDF');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleBox}>
              <View style={styles.printerIconCircle}>
                <Ionicons name="print" size={22} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Print Bill #{invoice.invoiceNo}</Text>
                <Text style={styles.headerSubtitle}>
                  Choose your printer type: Wi-Fi A4 or Bluetooth Thermal
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          {isPrinting ? (
            <View style={styles.printingStateBox}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.printingStateText}>{printStatus}</Text>
            </View>
          ) : (
            <View style={styles.optionsList}>
              {/* Option 1: Wi-Fi / Network Printer (A4 GST Invoice) */}
              <TouchableOpacity
                style={styles.printerCard}
                onPress={handlePrintWifiA4}
                activeOpacity={0.8}
              >
                <View style={[styles.cardIconBox, { backgroundColor: '#3B82F6' }]}>
                  <Ionicons name="wifi" size={26} color="#FFFFFF" />
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardTitle}>Wi-Fi / Network Printer</Text>
                    <View style={styles.a4Badge}>
                      <Text style={styles.a4BadgeText}>A4 GST INVOICE</Text>
                    </View>
                  </View>
                  <Text style={styles.cardDesc}>
                    Print official statutory A4 GST Tax Invoice with HSN summary, bank details & signature on any Wi-Fi or LAN printer.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
              </TouchableOpacity>

              {/* Option 2: Bluetooth Thermal Printer */}
              <View style={styles.thermalCardWrapper}>
                <TouchableOpacity
                  style={styles.printerCard}
                  onPress={handlePrintBluetoothThermal}
                  activeOpacity={0.8}
                >
                  <View style={[styles.cardIconBox, { backgroundColor: '#10B981' }]}>
                    <Ionicons name="bluetooth" size={26} color="#FFFFFF" />
                  </View>
                  <View style={styles.cardContent}>
                    <View style={styles.cardTitleRow}>
                      <Text style={styles.cardTitle}>Bluetooth Thermal Printer</Text>
                      <View style={styles.thermalBadge}>
                        <Text style={styles.thermalBadgeText}>{paperWidth}mm SLIP</Text>
                      </View>
                    </View>
                    <Text style={styles.cardDesc}>
                      High-speed receipt roll print for POS counters via Bluetooth.
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                </TouchableOpacity>

                {/* Paper width selector chips */}
                <View style={styles.paperWidthRow}>
                  <Text style={styles.paperWidthLabel}>Paper Roll Width:</Text>
                  <View style={styles.paperWidthPills}>
                    <TouchableOpacity
                      style={[
                        styles.paperWidthPill,
                        paperWidth === 80 && styles.paperWidthPillActive,
                      ]}
                      onPress={() => setPaperWidth(80)}
                    >
                      <Text
                        style={[
                          styles.paperWidthText,
                          paperWidth === 80 && styles.paperWidthTextActive,
                        ]}
                      >
                        80 mm (3-inch)
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.paperWidthPill,
                        paperWidth === 58 && styles.paperWidthPillActive,
                      ]}
                      onPress={() => setPaperWidth(58)}
                    >
                      <Text
                        style={[
                          styles.paperWidthText,
                          paperWidth === 58 && styles.paperWidthTextActive,
                        ]}
                      >
                        58 mm (2-inch)
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Option 3: Share PDF options */}
              <View style={styles.shareRow}>
                <TouchableOpacity
                  style={styles.shareBtn}
                  onPress={handleShareA4Pdf}
                  activeOpacity={0.8}
                >
                  <Ionicons name="document-text-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.shareBtnText}>Share A4 PDF</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.shareBtn}
                  onPress={handleShareThermalPdf}
                  activeOpacity={0.8}
                >
                  <Ionicons name="receipt-outline" size={18} color="#10B981" />
                  <Text style={[styles.shareBtnText, { color: '#059669' }]}>Share Thermal PDF</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
    ...SHADOWS.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  printerIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  optionsList: {
    gap: 14,
  },
  printerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  cardIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  a4Badge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  a4BadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#2563EB',
  },
  thermalBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  thermalBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#059669',
  },
  cardDesc: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },
  thermalCardWrapper: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  paperWidthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#F1F5F9',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  paperWidthLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  paperWidthPills: {
    flexDirection: 'row',
    gap: 8,
  },
  paperWidthPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  paperWidthPillActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  paperWidthText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  paperWidthTextActive: {
    color: '#FFFFFF',
  },
  shareRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  shareBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  printingStateBox: {
    paddingVertical: 36,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  printingStateText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
  },
});
