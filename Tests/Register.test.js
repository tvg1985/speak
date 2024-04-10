import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Register from './Register';
import { get } from "firebase/database";

jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

jest.mock('firebase/database', () => ({
  get: jest.fn(),
  ref: jest.fn(() => 'users/testuser1'),
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

  it('shows error message and suggestions when username already exists', async () => {
    get.mockResolvedValueOnce({ exists: () => true });

    const { getByPlaceholderText, findByText } = render(<Register />);
    const usernameInput = getByPlaceholderText('Username');
    const registerButton = getByText('Register');

    fireEvent.changeText(usernameInput, 'testuser1');
    fireEvent.press(registerButton);

    const errorMessage = await findByText('Username already exists');
    const suggestion1 = await findByText('testuser11');
    const suggestion2 = await findByText('testuser12');
    const suggestion3 = await findByText('testuser13');

    expect(errorMessage).toBeTruthy();
    expect(suggestion1).toBeTruthy();
    expect(suggestion2).toBeTruthy();
    expect(suggestion3).toBeTruthy();
  });
});