import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { formatPrice, calculateOrderTotals } from '../utils/calculations';

// Static mapping of book titles to their image assets
const bookImages = {
  'The Midnight Library': require('../../assets/The Midnight Library.png'),
  'The Seven Husbands of Evelyn Hugo': require('../../assets/The Seven Husbands of Evelyn Hugo.png'),
  'Atomic Habits': require('../../assets/Atomic Habits.png'),
  'Sapiens': require('../../assets/Sapiens.png'),
  'A Brief History of Time': require('../../assets/A Brief History of Time.png'),
  'The Elegant Universe': require('../../assets/The Elegant Universe.png'),
  'Clean Code': require('../../assets/Clean Code.png'),
  'The Pragmatic Programmer': require('../../assets/The Pragmatic Programmer.png'),
  'The Story of Art': require('../../assets/The Story of Art.png'),
  'Ways of Seeing': require('../../assets/Ways of Seeing.png'),
  'Good to Great': require('../../assets/Good to Great.png'),
  'Zero to One': require('../../assets/Zero to One.png'),
};

const OrderSummaryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { cartItems } = route.params;
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCardType, setSelectedCardType] = useState('visa');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  // Calculate order totals using the utility function
  const { subtotal, tax, total, formattedSubtotal, formattedTax, formattedTotal } = calculateOrderTotals(cartItems);

  const getBookImage = (book) => {
    // For posted books, use the image URL if available
    if (book.isPosted && book.image) {
      return { uri: book.image };
    }
    
    // For static books, use the mapping
    const localImage = bookImages[book.title];
    if (localImage) {
      return localImage;
    }
    
    // Fallback to app icon
    return require('../../assets/icon.png');
  };

  const formatItemPrice = (item) => {
    // Price is already a number from CartScreen processing
    return formatPrice(item.price * (item.quantity || 1));
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    try {
      // Here you would typically make an API call to your backend
      // For now, we'll just simulate a successful order
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      // Clear the cart
      await AsyncStorage.setItem('cart', JSON.stringify([]));
      
      Alert.alert(
        'Order Placed Successfully!',
        'Your purchased information has been sent to your email',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Home')
          }
        ]
      );
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCardInputChange = (field, value) => {
    let formattedValue = value;
    
    switch (field) {
      case 'cardNumber':
        formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
        break;
      case 'expiryDate':
        formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
        break;
      case 'cvv':
        formattedValue = value.replace(/\D/g, '').slice(0, 3);
        break;
    }
    
    setCardDetails(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  };

  const renderPaymentSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Payment Method</Text>
      
      <View style={styles.cardTypeContainer}>
        <TouchableOpacity 
          style={[styles.cardTypeButton, selectedCardType === 'visa' && styles.selectedCardType]}
          onPress={() => setSelectedCardType('visa')}
        >
          <Ionicons name="card" size={24} color={selectedCardType === 'visa' ? '#87CEEB' : '#666'} />
          <Text style={[styles.cardTypeText, selectedCardType === 'visa' && styles.selectedCardTypeText]}>Visa</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.cardTypeButton, selectedCardType === 'mastercard' && styles.selectedCardType]}
          onPress={() => setSelectedCardType('mastercard')}
        >
          <Ionicons name="card" size={24} color={selectedCardType === 'mastercard' ? '#87CEEB' : '#666'} />
          <Text style={[styles.cardTypeText, selectedCardType === 'mastercard' && styles.selectedCardTypeText]}>Mastercard</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardInputContainer}>
        <Text style={styles.inputLabel}>Card Number</Text>
        <TextInput
          style={styles.cardInput}
          placeholder="1234 5678 9012 3456"
          value={cardDetails.cardNumber}
          onChangeText={(value) => handleCardInputChange('cardNumber', value)}
          keyboardType="numeric"
          maxLength={19}
        />
      </View>

      <View style={styles.cardInputContainer}>
        <Text style={styles.inputLabel}>Cardholder Name</Text>
        <TextInput
          style={styles.cardInput}
          placeholder="John Doe"
          value={cardDetails.cardName}
          onChangeText={(value) => handleCardInputChange('cardName', value)}
        />
      </View>

      <View style={styles.cardDetailsRow}>
        <View style={[styles.cardInputContainer, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.inputLabel}>Expiry Date</Text>
          <TextInput
            style={styles.cardInput}
            placeholder="MM/YY"
            value={cardDetails.expiryDate}
            onChangeText={(value) => handleCardInputChange('expiryDate', value)}
            keyboardType="numeric"
            maxLength={5}
          />
        </View>
        <View style={[styles.cardInputContainer, { flex: 1 }]}>
          <Text style={styles.inputLabel}>CVV</Text>
          <TextInput
            style={styles.cardInput}
            placeholder="123"
            value={cardDetails.cvv}
            onChangeText={(value) => handleCardInputChange('cvv', value)}
            keyboardType="numeric"
            maxLength={3}
            secureTextEntry
          />
        </View>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#87CEEB', '#FFFFFF']} style={styles.gradientContainer}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Summary</Text>
        </View>

        <View style={styles.mainContent}>
          <ScrollView style={styles.scrollContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Order Items</Text>
              {cartItems.map((item) => (
                <View key={item.id} style={styles.orderItem}>
                  <Image 
                    source={getBookImage(item)}
                    style={styles.bookImage}
                    resizeMode="cover"
                  />
                  <View style={styles.itemDetails}>
                    <Text style={styles.bookTitle}>{item.title}</Text>
                    <Text style={styles.bookAuthor}>{item.author}</Text>
                    <Text style={styles.quantity}>Quantity: {item.quantity}</Text>
                    <Text style={styles.price}>฿{item.price}</Text>
                  </View>
                </View>
              ))}
            </View>

            {renderPaymentSection()}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Order Total</Text>
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Subtotal:</Text>
                <Text style={styles.totalAmount}>{formattedSubtotal}</Text>
              </View>
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Tax (10%):</Text>
                <Text style={styles.totalAmount}>{formattedTax}</Text>
              </View>
              <View style={[styles.totalContainer, styles.finalTotal]}>
                <Text style={styles.totalLabel}>Total Amount:</Text>
                <Text style={styles.totalAmount}>{formattedTotal}</Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.placeOrderButton, isProcessing && styles.placeOrderButtonDisabled]}
              onPress={handlePlaceOrder}
              disabled={isProcessing}
            >
              <Text style={styles.placeOrderButtonText}>
                {isProcessing ? 'Processing...' : 'Place Order'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  mainContent: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  section: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.😎',
    margin: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  bookImage: {
    width: 60,
    height: 90,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  quantity: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    color: '#87CEEB',
    fontWeight: 'bold',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 18,
    color: '#333',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#87CEEB',
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.😎',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  placeOrderButton: {
    backgroundColor: '#87CEEB',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 50,
  },
  placeOrderButtonDisabled: {
    backgroundColor: '#ccc',
  },
  placeOrderButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  finalTotal: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cardTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  cardTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    width: '45%',
  },
  selectedCardType: {
    backgroundColor: '#e3f2fd',
    borderColor: '#87CEEB',
    borderWidth: 1,
  },
  cardTypeText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  selectedCardTypeText: {
    color: '#87CEEB',
    fontWeight: 'bold',
  },
  cardInputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  cardInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  cardDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default OrderSummaryScreen;