import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { 
  TextInput, 
  Button, 
  Card, 
  Title, 
  Paragraph, 
  Divider,
  HelperText
} from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { setLoading, loginSuccess } from '../store/authSlice';
import { authAPI } from '../services/api';

interface LoginScreenProps {
  onNavigateToRegister: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigateToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [loading, setLoadingState] = useState(false);
  const dispatch = useDispatch();

  const validateForm = () => {
    const newErrors = { email: '', password: '' };
    let isValid = true;

    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoadingState(true);
    dispatch(setLoading(true));

    try {
      const response = await authAPI.login({ email, password });
      const { user, token, refreshToken } = response.data;
      
      dispatch(loginSuccess({ user, token, refreshToken }));
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      Alert.alert('Login Error', message);
    } finally {
      setLoadingState(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Welcome Back</Title>
          <Paragraph style={styles.subtitle}>Sign in to continue</Paragraph>
          
          <TextInput
            label="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
            }}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            error={!!errors.email}
          />
          <HelperText type="error" visible={!!errors.email}>
            {errors.email}
          </HelperText>

          <TextInput
            label="Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
            }}
            mode="outlined"
            secureTextEntry
            style={styles.input}
            error={!!errors.password}
          />
          <HelperText type="error" visible={!!errors.password}>
            {errors.password}
          </HelperText>

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            Sign In
          </Button>

          <Divider style={styles.divider} />

          <Button
            mode="text"
            onPress={onNavigateToRegister}
            disabled={loading}
          >
            Don't have an account? Sign Up
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  card: {
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  input: {
    marginBottom: 5,
  },
  button: {
    marginTop: 20,
    marginBottom: 10,
  },
  divider: {
    marginVertical: 20,
  },
});

export default LoginScreen;