import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GlassBackgroundProps {
  children: React.ReactNode;
}

/**
 * Light Frosted Glass ambient backdrop:
 * Soft mint -> airy slate -> pale lavender gradient with subtle diffused color orbs
 * so translucent frosted glass cards catch light cleanly without hurting readability.
 */
export const GlassBackground: React.FC<GlassBackgroundProps> = ({ children }) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#ecfdf5', '#f8fafc', '#eef2ff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Subtle diffused ambient orbs */}
      <View style={styles.orbTopRight} pointerEvents="none" />
      <View style={styles.orbMiddleLeft} pointerEvents="none" />
      <View style={styles.orbBottomRight} pointerEvents="none" />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  orbTopRight: {
    position: 'absolute',
    top: -60,
    right: -50,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(16, 185, 129, 0.10)',
  },
  orbMiddleLeft: {
    position: 'absolute',
    top: 260,
    left: -70,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
  },
  orbBottomRight: {
    position: 'absolute',
    bottom: 80,
    right: -60,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
  },
});

export default GlassBackground;
