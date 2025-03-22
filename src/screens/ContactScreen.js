import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Surface } from 'react-native-paper';

const ContactScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!name || !email || !message) {
      setError('Please fill in all fields');
      return;
    }
    setShowModal(true);
  };

  return (
    <LinearGradient colors={['#87CEEB', '#FFFFFF']} style={styles.gradientContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Contact Us</Text>
      </View>

      <Surface style={styles.content}>
        <Text style={styles.subtitle}>Have questions? We'd love to hear from you.</Text>

        <TextInput
          style={styles.input}
          placeholder="Your Name"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#666"
        />

        <TextInput
          style={styles.input}
          placeholder="Your Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholderTextColor="#666"
        />

        <TextInput
          style={[styles.input, styles.messageInput]}
          placeholder="Your Message"
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={4}
          placeholderTextColor="#666"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.button}
          labelStyle={styles.buttonText}
        >
          Send Message
        </Button>
      </Surface>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  headerContainer: {
    padding: 16,
    marginTop: 70,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    padding: 20,
    margin: 16,
    borderRadius: 10,
    elevation: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
  },
  messageInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  button: {
    marginTop: 8,
    backgroundColor: '#87CEEB',
  },
  buttonText: {
    fontSize: 16,
  },
  error: {
    color: 'red',
    marginBottom: 16,
  },
});

export default ContactScreen; 