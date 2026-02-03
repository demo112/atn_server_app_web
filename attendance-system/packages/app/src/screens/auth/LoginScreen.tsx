import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import request from '../../utils/request';
import { authService } from '../../services/auth';
import { getErrorMessage } from '../../utils/error';
import type { LoginVo } from '@attendance/shared';

const LoginScreen = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('错误', '请输入用户名和密码');
      return;
    }

    setLoading(true);
    try {
      await authService.login({
        username,
        password
      });
      
      // Navigate to Home
      navigation.replace('Home');
    } catch (error) {
      const msg = getErrorMessage(error);
      Alert.alert('登录失败', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>考勤系统</Text>
      
      <View style={styles.form}>
        <Text style={styles.label}>用户名</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="请输入用户名"
          autoCapitalize="none"
        />
        
        <Text style={styles.label}>密码</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="请输入密码"
          secureTextEntry
        />
        
        <View style={styles.buttonContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <Button title="登录" onPress={handleLogin} />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    width: '100%',
  },
  label: {
    marginBottom: 5,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 10,
  },
});

export default LoginScreen;
