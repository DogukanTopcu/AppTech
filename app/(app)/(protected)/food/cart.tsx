import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { CartItem, useCart } from './cart-context';

const Cart = () => {
  const router = useRouter();
  const { 
    cart, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    cartTotal
  } = useCart();

  const handleBackPress = () => {
    router.back();
  };

  const handleRemoveItem = (itemId: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeFromCart(itemId),
        },
      ]
    );
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => clearCart(),
        },
      ]
    );
  };

  const handleGiveOrder = () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before placing an order.');
      return;
    }
    router.push('/(app)/(protected)/food/order-details');
  };

  // Group items by restaurant
  const groupedItems = cart.reduce((groups, item) => {
    const restaurant = item.restaurantName;
    if (!groups[restaurant]) {
      groups[restaurant] = [];
    }
    groups[restaurant].push(item);
    return groups;
  }, {} as { [key: string]: CartItem[] });

  // Calculate totals
  const calculateItemTotal = (item: CartItem) => {
    return item.price * item.quantity;
  };

  const calculateRestaurantTotal = (items: CartItem[]) => {
    return items.reduce((total, item) => total + calculateItemTotal(item), 0);
  };

  const grandTotal = cartTotal;
  const serviceFee = 5;

  const renderCartItem = (item: CartItem) => (
    <View key={item.id} style={styles.cartItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>{item.price.toFixed(2)}₺</Text>
      </View>

      <View style={styles.quantityControls}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.id, item.quantity - 1)}
        >
          <MaterialIcons name="remove" size={20} color="#9a0f21" />
        </TouchableOpacity>

        <Text style={styles.quantityText}>{item.quantity}</Text>

        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.id, item.quantity + 1)}
        >
          <MaterialIcons name="add" size={20} color="#9a0f21" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleRemoveItem(item.id)}
      >
        <MaterialIcons name="delete" size={20} color="#FF4757" />
      </TouchableOpacity>
    </View>
  );

  if (cart.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress}>
            <MaterialIcons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cart ({cart.length} items)</Text>
          <TouchableOpacity onPress={handleClearCart}>
            <MaterialIcons name="clear-all" size={24} color="#FF4757" />
          </TouchableOpacity>
        </View>

        <View style={styles.emptyCartContainer}>
          <MaterialIcons name="shopping-cart" size={80} color="#ccc" />
          <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
          <Text style={styles.emptyCartSubtitle}>
            Add some delicious items from restaurants to get started!
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => router.back()}
          >
            <Text style={styles.browseButtonText}>Browse Restaurants</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cart ({cart.length} items)</Text>
        <TouchableOpacity onPress={handleClearCart}>
          <MaterialIcons name="clear-all" size={24} color="#FF4757" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Cart Items Grouped by Restaurant */}
        {Object.entries(groupedItems).map(([restaurantName, items]) => (
          <View key={restaurantName} style={styles.restaurantSection}>
            <View style={styles.restaurantHeader}>
              <MaterialIcons name="restaurant" size={20} color="#9a0f21" />
              <Text style={styles.restaurantName}>{restaurantName}</Text>
            </View>

            {items.map(renderCartItem)}

            <View style={styles.restaurantTotal}>
              <Text style={styles.restaurantTotalText}>
                Subtotal: {calculateRestaurantTotal(items).toFixed(2)}₺
              </Text>
            </View>
          </View>
        ))}

        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items Total:</Text>
            <Text style={styles.summaryValue}>{grandTotal.toFixed(2)}₺</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee:</Text>
            <Text style={styles.summaryValue}>Free</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service Fee:</Text>
            <Text style={styles.summaryValue}>{serviceFee.toFixed(2)}₺</Text>
          </View>
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>{(grandTotal + serviceFee).toFixed(2)}₺</Text>
          </View>
        </View>

        {/* Bottom Spacing for Tab Navigation */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleClearCart}>
          <Text style={styles.cancelButtonText}>Cancel Order</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.orderButton} onPress={handleGiveOrder}>
          <Text style={styles.orderButtonText}>Give an Order</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyCartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyCartSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#9a0f21',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  restaurantSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  restaurantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    gap: 8,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9a0f21',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    gap: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 24,
    textAlign: 'center',
  },
  deleteButton: {
    padding: 8,
  },
  restaurantTotal: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  restaurantTotalText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9a0f21',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
    bottom: 60,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FF4757',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FF4757',
    fontSize: 16,
    fontWeight: '600',
  },
  orderButton: {
    flex: 1,
    backgroundColor: '#9a0f21',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 100,
  },
});

export default Cart; 