import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useThemeColor } from '../../hooks/useThemeColor';
import { IconSymbol } from './IconSymbol';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  type: ToastType;
  duration?: number;
  onHide: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export function Toast({
  visible,
  message,
  type,
  duration = 3000,
  onHide,
  action,
}: ToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  
  const backgroundColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  const getToastColors = () => {
    switch (type) {
      case 'success':
        return { bg: '#10B981', icon: 'checkmark.circle.fill' as const };
      case 'error':
        return { bg: '#EF4444', icon: 'xmark.circle.fill' as const };
      case 'warning':
        return { bg: '#F59E0B', icon: 'exclamationmark.triangle.fill' as const };
      case 'info':
        return { bg: '#3B82F6', icon: 'info.circle.fill' as const };
      default:
        return { bg: '#6B7280', icon: 'info.circle' as const };
    }
  };

  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  }, [translateY, opacity, onHide]);

  useEffect(() => {
    if (visible) {
      // Add haptic feedback
      switch (type) {
        case 'success':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'error':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        case 'warning':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        default:
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      // Show animation
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, type, duration, hideToast, translateY, opacity]);

  const handleAction = () => {
    if (action) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      action.onPress();
    }
  };

  if (!visible) return null;

  const colors = getToastColors();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor,
          borderColor,
          borderLeftColor: colors.bg,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: colors.bg }]}>
          <IconSymbol name={colors.icon} size={20} color="white" />
        </View>
        
        <Text style={[styles.message, { color: textColor }]} numberOfLines={2}>
          {message}
        </Text>
        
        {action && (
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: colors.bg }]}
            onPress={handleAction}
          >
            <Text style={[styles.actionText, { color: colors.bg }]}>
              {action.label}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      <TouchableOpacity style={styles.closeButton} onPress={hideToast}>
        <IconSymbol name="xmark" size={16} color={textColor} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 9999,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingRight: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    marginLeft: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
  },
});
