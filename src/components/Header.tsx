import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ShopSettings } from '../types';

interface HeaderProps {
  settings: ShopSettings;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onOpenPhotoBill: () => void;
  activeTab: 'pos' | 'inventory' | 'invoices' | 'settings';
  onSelectTab: (tab: 'pos' | 'inventory' | 'invoices' | 'settings') => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  cartCount,
  cartTotal,
  onOpenCart,
  onOpenPhotoBill,
  activeTab,
  onSelectTab,
}) => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      {/* Top Bar: Brand, GSTIN, Time, Cart Action */}
      <View style={styles.topRow}>
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Ionicons name="cart" size={20} color="#FFFFFF" />
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.brandTitle} numberOfLines={1}>
                {settings.shopName}
              </Text>
              <View style={styles.gstTag}>
                <View style={styles.liveDot} />
                <Text style={styles.gstTagText}>{settings.gstin}</Text>
              </View>
            </View>
            <Text style={styles.brandSubtitle} numberOfLines={1}>
              {settings.tagline}
            </Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          {/* Snap & Bill Shortcut */}
          <TouchableOpacity
            style={styles.snapButton}
            onPress={onOpenPhotoBill}
            activeOpacity={0.8}
          >
            <Ionicons name="camera" size={18} color="#FFFFFF" />
            <Text style={styles.snapButtonText}>Snap & Bill</Text>
          </TouchableOpacity>

          {/* Cart Trigger */}
          <TouchableOpacity
            style={[styles.cartButton, cartCount > 0 && styles.cartButtonActive]}
            onPress={onOpenCart}
            activeOpacity={0.8}
          >
            <Ionicons
              name="basket"
              size={20}
              color={cartCount > 0 ? '#10B981' : '#94A3B8'}
            />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
            <View style={styles.cartValueBox}>
              <Text style={styles.cartCountLabel}>
                {cartCount} {cartCount === 1 ? 'item' : 'items'}
              </Text>
              <Text style={styles.cartValueTotal}>
                {settings.currencySymbol}
                {cartTotal.toFixed(0)}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'pos' && styles.tabItemActive]}
          onPress={() => onSelectTab('pos')}
        >
          <Ionicons
            name="grid"
            size={18}
            color={activeTab === 'pos' ? '#10B981' : '#94A3B8'}
          />
          <Text
            style={[styles.tabText, activeTab === 'pos' && styles.tabTextActive]}
          >
            POS Register
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'inventory' && styles.tabItemActive,
          ]}
          onPress={() => onSelectTab('inventory')}
        >
          <Ionicons
            name="cube"
            size={18}
            color={activeTab === 'inventory' ? '#10B981' : '#94A3B8'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'inventory' && styles.tabTextActive,
            ]}
          >
            Inventory
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'invoices' && styles.tabItemActive,
          ]}
          onPress={() => onSelectTab('invoices')}
        >
          <Ionicons
            name="receipt"
            size={18}
            color={activeTab === 'invoices' ? '#10B981' : '#94A3B8'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'invoices' && styles.tabTextActive,
            ]}
          >
            GST Bills & Reports
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'settings' && styles.tabItemActive,
          ]}
          onPress={() => onSelectTab('settings')}
        >
          <Ionicons
            name="settings"
            size={18}
            color={activeTab === 'settings' ? '#10B981' : '#94A3B8'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'settings' && styles.tabTextActive,
            ]}
          >
            Settings
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingTop: Platform.OS === 'ios' ? 44 : 10,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  brandTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  gstTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  gstTagText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  snapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  snapButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  cartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    position: 'relative',
    gap: 6,
  },
  cartButtonActive: {
    borderColor: '#10B981',
    backgroundColor: '#064E3B20',
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    left: 20,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  cartValueBox: {
    marginLeft: 2,
  },
  cartCountLabel: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  cartValueTotal: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '800',
  },
  tabRow: {
    flexDirection: 'row',
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingTop: 4,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
    borderRadius: 8,
  },
  tabItemActive: {
    backgroundColor: '#1E293B',
  },
  tabText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#10B981',
    fontWeight: '700',
  },
});
