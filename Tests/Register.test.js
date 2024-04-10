import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Register from './Register';

jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

describe('Register', () => {
  it('renders correctly', () => {
    const { getByPlaceholderText } = render(<Register />);

    expect(getByPlaceholderText('Username')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByPlaceholderText('Confirm Password')).toBeTruthy();
  });

  it('updates username, password and confirm password fields', () => {
    const { getByPlaceholderText } = render(<Register />);
    const usernameInput = getByPlaceholderText('Username');
    const passwordInput = getByPlaceholderText('Password');
    const confirmPasswordInput = getByPlaceholderText('Confirm Password');

    fireEvent.changeText(usernameInput, 'testuser');
    fireEvent.changeText(passwordInput, 'testpassword');
    fireEvent.changeText(confirmPasswordInput, 'testpassword');

    expect(usernameInput.props.value).toBe('testuser');
    expect(passwordInput.props.value).toBe('testpassword');
    expect(confirmPasswordInput.props.value).toBe('testpassword');
  });

  it('navigates to Home on successful registration', () => {
    const navigation = { navigate: jest.fn() };
    const { getByText } = render(<Register navigation={navigation} />);
    const registerButton = getByText('Register');

    fireEvent.press(registerButton);

    expect(navigation.navigate).toHaveBeenCalledWith('Home');
  });
});