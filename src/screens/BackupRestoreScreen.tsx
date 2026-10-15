import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { COLORS, SHADOWS } from '../theme/colors';

interface BackupRestoreScreenProps {
  onBack: () => void;
}

export const BackupRestoreScreen: React.FC<BackupRestoreScreenProps> = ({ onBack }) => {
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(true);
  const [lastBackupTime, setLastBackupTime] = useState('15 Oct 2026 08:30 PM');
  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleCreateLocalBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      setIsBackingUp(false);
      const now = new Date();
      const timeStr = `${now.getDate()} Oct 2026 ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      setLastBackupTime(timeStr);
      Alert.alert('Backup Complete', `Local encrypted database backup created successfully (12.5 MB) in device internal storage.`);
    }, 700);
  };

  const handleRestore = () => {
    Alert.alert(
      'Restore Database',
      'Select a verified .sql or .db backup archive to restore all products, bills, and ledgers.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Browse File', onPress: () => Alert.alert('Restore', 'Database restored successfully!') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg} />

      {/* Screen 20 Header matching Image 2 Screen 10 */}
      <AppHeader title="Backup & Restore" showBack={true} onBack={onBack} />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Option Cards */}
        <View style={styles.optionsList}>
          {/* 1. Create Local Backup */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={handleCreateLocalBackup}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#EDEBFB' }]}>
              <Ionicons name="server" size={22} color={COLORS.primary} />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Create Local Backup</Text>
              <Text style={styles.optionSub}>Save database to device storage</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* 2. Restore from Backup */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={handleRestore}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="refresh" size={22} color="#10B981" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Restore from Backup</Text>
              <Text style={styles.optionSub}>Restore database from file</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* 3. Cloud Sync (Optional) */}
          <View style={styles.optionCard}>
            <View style={[styles.iconWrapper, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="cloud" size={22} color="#2563EB" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Cloud Sync (Optional)</Text>
              <Text style={styles.optionSub}>Sync data to cloud server</Text>
            </View>
            <Switch
              value={cloudSyncEnabled}
              onValueChange={setCloudSyncEnabled}
              trackColor={{ false: '#CBD5E1', true: COLORS.primaryLight }}
              thumbColor={cloudSyncEnabled ? COLORS.primary : '#94A3B8'}
            />
          </View>
        </View>

        {/* Last Backup Status Card matching Screen 10 */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View>
              <Text style={styles.statusHeader}>Last Backup</Text>
              <Text style={styles.statusTimestamp}>{lastBackupTime}</Text>
              <Text style={styles.statusSize}>Size: 12.5 MB</Text>
            </View>

            <View style={styles.successBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#166534" />
              <Text style={styles.successBadgeText}>Success</Text>
            </View>
          </View>
        </View>

        {/* Backup Now Primary Button */}
        <TouchableOpacity
          style={styles.backupNowBtn}
          onPress={handleCreateLocalBackup}
          activeOpacity={0.8}
        >
          <Ionicons name="server-outline" size={18} color="#FFFFFF" />
          <Text style={styles.backupNowText}>
            {isBackingUp ? 'Creating Backup...' : 'Backup Now'}
          </Text>
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
  optionsList: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: 20,
    ...SHADOWS.card,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  optionSub: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
    ...SHADOWS.card,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  statusTimestamp: {
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 3,
  },
  statusSize: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  successBadgeText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '800',
  },
  backupNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    ...SHADOWS.card,
  },
  backupNowText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
