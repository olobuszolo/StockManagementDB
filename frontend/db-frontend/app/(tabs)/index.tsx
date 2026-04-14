import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.grid}>
        <Link href="/employees" style={styles.card}>
          <ThemedText>Employees</ThemedText>
        </Link>
        <Link href="/units" style={styles.card}>
          <ThemedText>Units</ThemedText>
        </Link>
        <Link href="/customers" style={styles.card}>
          <ThemedText>Customers</ThemedText>
        </Link>
        <Link href="/categories" style={styles.card}>
          <ThemedText>Categories</ThemedText>
        </Link>
        <Link href="/suppliers" style={styles.card}>
          <ThemedText>Suppliers</ThemedText>
        </Link>
        <Link href="/orders" style={styles.card}>
          <ThemedText>Orders</ThemedText>
        </Link>
        <Link href="/deliveries" style={styles.card}>
          <ThemedText>Deliveries</ThemedText>
        </Link>
        <Link href="/products" style={styles.card}>
          <ThemedText>Products</ThemedText>
        </Link>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  grid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  marginBottom: 16,
  },
  card: {
    width: '48%',
    height: 100,
    backgroundColor: '#ccc',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
});
