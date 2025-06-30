import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useThemeColor } from '../../hooks/useThemeColor';

interface SkeletonProps {
  height?: number;
  width?: number | string;
  borderRadius?: number;
  style?: any;
}

export function Skeleton({ height = 20, width = '100%', borderRadius = 8, style }: SkeletonProps) {
  const backgroundColor = useThemeColor({}, 'backgroundSecondary');
  const highlightColor = useThemeColor({}, 'border');
  
  const opacity = React.useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [opacity]);

  return (
    <View style={[styles.container, { height, width, borderRadius, backgroundColor }, style]}>
      <Animated.View
        style={[
          styles.highlight,
          {
            opacity,
            backgroundColor: highlightColor,
            borderRadius,
          },
        ]}
      />
    </View>
  );
}

interface SkeletonItemProps {
  showAvatar?: boolean;
  showTags?: boolean;
  linesCount?: number;
}

export function SkeletonItem({ showAvatar = false, showTags = true, linesCount = 3 }: SkeletonItemProps) {
  const cardColor = useThemeColor({}, 'card');
  
  return (
    <View style={[styles.itemCard, { backgroundColor: cardColor }]}>
      <View style={styles.itemHeader}>
        {showAvatar && (
          <Skeleton width={40} height={40} borderRadius={20} style={{ marginRight: 12 }} />
        )}
        <View style={styles.itemInfo}>
          <Skeleton width="70%" height={18} style={{ marginBottom: 8 }} />
          <Skeleton width="45%" height={14} />
        </View>
        <View style={styles.itemActions}>
          <Skeleton width={24} height={24} borderRadius={12} style={{ marginLeft: 8 }} />
          <Skeleton width={24} height={24} borderRadius={12} style={{ marginLeft: 8 }} />
        </View>
      </View>
      
      <View style={styles.itemDetails}>
        {Array.from({ length: linesCount }).map((_, index) => (
          <Skeleton 
            key={index}
            width={index === linesCount - 1 ? "60%" : "100%"} 
            height={14} 
            style={{ marginBottom: 6 }} 
          />
        ))}
      </View>
      
      {showTags && (
        <View style={styles.tagsContainer}>
          <Skeleton width={50} height={20} borderRadius={10} style={{ marginRight: 8 }} />
          <Skeleton width={35} height={20} borderRadius={10} style={{ marginRight: 8 }} />
          <Skeleton width={45} height={20} borderRadius={10} />
        </View>
      )}
    </View>
  );
}

interface SkeletonListProps {
  itemCount?: number;
  showAvatar?: boolean;
  showTags?: boolean;
}

export function SkeletonList({ itemCount = 5, showAvatar = false, showTags = true }: SkeletonListProps) {
  return (
    <View style={styles.listContainer}>
      {Array.from({ length: itemCount }).map((_, index) => (
        <SkeletonItem 
          key={index} 
          showAvatar={showAvatar} 
          showTags={showTags}
          linesCount={Math.floor(Math.random() * 3) + 2} // Random between 2-4 lines
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  itemCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemDetails: {
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
});
