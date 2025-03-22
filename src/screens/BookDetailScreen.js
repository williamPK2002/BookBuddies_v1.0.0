import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatPrice } from '../utils/calculations';

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

const BookDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { book } = route.params;
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isInCart, setIsInCart] = useState(false);
  const [loading, setLoading] = useState(false);

  // Ensure book price is a number, handling both string and number inputs
  const bookPrice = typeof book.price === 'string' 
    ? parseFloat(book.price.replace(/[^0-9.-]+/g, '')) || 0
    : book.price || 0;

  useEffect(() => {
    checkFavoriteStatus();
    checkCartStatus();
  }, []);

  const checkFavoriteStatus = async () => {
    try {
      const favorites = await AsyncStorage.getItem('favorites');
      if (favorites) {
        const favoritesArray = JSON.parse(favorites);
        setIsFavorite(favoritesArray.some(fav => fav.id === book.id));
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const checkCartStatus = async () => {
    try {
      const cart = await AsyncStorage.getItem('cart');
      if (cart) {
        const cartArray = JSON.parse(cart);
        const cartItem = cartArray.find(item => item.id === book.id);
        setIsInCart(!!cartItem);
        if (cartItem) {
          setQuantity(cartItem.quantity);
        }
      }
    } catch (error) {
      console.error('Error checking cart status:', error);
    }
  };

  const toggleFavorite = async () => {
    try {
      const favorites = await AsyncStorage.getItem('favorites');
      let favoritesArray = favorites ? JSON.parse(favorites) : [];

      if (isFavorite) {
        favoritesArray = favoritesArray.filter(fav => fav.id !== book.id);
      } else {
        favoritesArray.push(book);
      }

      await AsyncStorage.setItem('favorites', JSON.stringify(favoritesArray));
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  const addToCart = async () => {
    try {
      const cart = await AsyncStorage.getItem('cart');
      let cartArray = cart ? JSON.parse(cart) : [];

      const existingItem = cartArray.find(item => item.id === book.id);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cartArray.push({ ...book, quantity });
      }

      await AsyncStorage.setItem('cart', JSON.stringify(cartArray));
      setIsInCart(true);
      Alert.alert('Success', 'Book added to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add book to cart');
    }
  };

  const removeFromCart = async () => {
    try {
      const cart = await AsyncStorage.getItem('cart');
      if (cart) {
        const cartArray = JSON.parse(cart);
        const updatedCart = cartArray.filter(item => item.id !== book.id);
        await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
        setIsInCart(false);
        Alert.alert('Success', 'Book removed from cart');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      Alert.alert('Error', 'Failed to remove book from cart');
    }
  };

  // Get the book image based on whether it's a posted book or static book
  const getBookImage = () => {
    if (book.image) {
      return { uri: book.image };
    }
    return bookImages[book.title] || require('../../assets/icon.png');
  };

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
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={toggleFavorite}
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={24} 
              color={isFavorite ? "#ff6b6b" : "#333"} 
            />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          <View style={styles.imageContainer}>
            <Image 
              source={getBookImage()}
              style={styles.bookImage}
              resizeMode="cover"
            />
          </View>

          <View style={styles.detailsContainer}>
            <Text style={styles.title}>{book.title}</Text>
            <Text style={styles.author}>by {book.author}</Text>
            <Text style={styles.category}>{book.category}</Text>
            <Text style={styles.price}>{formatPrice(bookPrice)}</Text>

            <View style={styles.quantityContainer}>
              <Text style={styles.quantityLabel}>Quantity:</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Ionicons name="remove" size={20} color="#333" />
                </TouchableOpacity>
                <Text style={styles.quantity}>{quantity}</Text>
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={() => setQuantity(quantity + 1)}
                >
                  <Ionicons name="add" size={20} color="#333" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.cartButton, isInCart && styles.removeFromCartButton]}
              onPress={isInCart ? removeFromCart : addToCart}
            >
              <Text style={styles.cartButtonText}>
                {isInCart ? 'Remove from Cart' : 'Add to Cart'}
              </Text>
            </TouchableOpacity>

            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>Description</Text>
              <Text style={styles.description}>{book.description}</Text>
            </View>
          </View>
        </ScrollView>
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
    marginTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  favoriteButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    width: '100%',
    height: 400,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookImage: {
    width: 250,
    height: 350,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  detailsContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  author: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  category: {
    fontSize: 14,
    color: '#87CEEB',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#87CEEB',
    marginBottom: 16,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quantityLabel: {
    fontSize: 16,
    color: '#333',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 18,
    marginHorizontal: 16,
    color: '#333',
  },
  cartButton: {
    backgroundColor: '#87CEEB',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  removeFromCartButton: {
    backgroundColor: '#ff6b6b',
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  descriptionContainer: {
    marginTop: 16,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
});

export default BookDetailScreen; 