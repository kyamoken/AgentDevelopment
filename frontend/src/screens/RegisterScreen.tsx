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

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onNavigateToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoadingState] = useState(false);
  const dispatch = useDispatch();

  const validateForm = () => {
    const newErrors = {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    };
    let isValid = true;

    if (!formData.username) {
      newErrors.username = 'Username is required';
      isValid = false;
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
      isValid = false;
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoadingState(true);
    dispatch(setLoading(true));

    try {
      const response = await authAPI.register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      const { user, token, refreshToken } = response.data;
      dispatch(loginSuccess({ user, token, refreshToken }));
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      Alert.alert('Registration Error', message);
    } finally {
      setLoadingState(false);
      dispatch(setLoading(false));
    }
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Create Account</Title>
          <Paragraph style={styles.subtitle}>Join our chat community</Paragraph>
          
          <TextInput
            label="Username"
            value={formData.username}
            onChangeText={(text) => updateField('username', text)}
            mode="outlined"
            autoCapitalize="none"
            style={styles.input}
            error={!!errors.username}
          />
          <HelperText type="error" visible={!!errors.username}>
            {errors.username}
          </HelperText>

          <TextInput
            label="Email"
            value={formData.email}
            onChangeText={(text) => updateField('email', text)}
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
            value={formData.password}
            onChangeText={(text) => updateField('password', text)}
            mode="outlined"
            secureTextEntry
            style={styles.input}
            error={!!errors.password}
          />
          <HelperText type="error" visible={!!errors.password}>
            {errors.password}
          </HelperText>

          <TextInput
            label="Confirm Password"
            value={formData.confirmPassword}
            onChangeText={(text) => updateField('confirmPassword', text)}
            mode="outlined"
            secureTextEntry
            style={styles.input}
            error={!!errors.confirmPassword}
          />
          <HelperText type="error" visible={!!errors.confirmPassword}>
            {errors.confirmPassword}
          </HelperText>

          <Button
            mode="contained"
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            Create Account
          </Button>

          <Divider style={styles.divider} />

          <Button
            mode="text"
            onPress={onNavigateToLogin}
            disabled={loading}
          >
            Already have an account? Sign In
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

export default RegisterScreen;