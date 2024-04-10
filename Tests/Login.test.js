import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Login from './Login';
import { get } from "firebase/database";

jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

jest.mock('firebase/database', () => ({
  get: jest.fn(),
  ref: jest.fn(() => 'users/testuser1'),
}));


describe('Login', () => {
  it('renders correctly', () => {
    const { getByPlaceholderText } = render(<Login />);

    expect(getByPlaceholderText('Username')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
  });

  it('updates username and password fields', () => {
    const { getByPlaceholderText } = render(<Login />);
    const usernameInput = getByPlaceholderText('Username');
    const passwordInput = getByPlaceholderText('Password');

    fireEvent.changeText(usernameInput, 'testuser');
    fireEvent.changeText(passwordInput, 'testpassword');

    expect(usernameInput.props.value).toBe('testuser');
    expect(passwordInput.props.value).toBe('testpassword');
  });

  it('navigates to Home on submit', () => {
    const navigation = { navigate: jest.fn() };
    const { getByText } = render(<Login navigation={navigation} />);
    const loginButton = getByText('Login');

    fireEvent.press(loginButton);

    expect(navigation.navigate).toHaveBeenCalledWith('Home');
  });
  it('shows error message when username does not exist', async () => {
    get.mockResolvedValueOnce({ exists: () => false });

    const { getByPlaceholderText, findByText } = render(<Login />);
    const usernameInput = getByPlaceholderText('Username');
    const loginButton = getByText('Login');

    fireEvent.changeText(usernameInput, 'testuser1');
    fireEvent.press(loginButton);

    const errorMessage = await findByText('Username does not exist');

    expect(errorMessage).toBeTruthy();
  });
});