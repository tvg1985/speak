import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Forgot from './Forgot';

jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

describe('Forgot', () => {
  it('renders correctly', () => {
    const { getByPlaceholderText } = render(<Forgot />);

    expect(getByPlaceholderText('Email')).toBeTruthy();
  });

  it('updates email field', () => {
    const { getByPlaceholderText } = render(<Forgot />);
    const emailInput = getByPlaceholderText('Email');

    fireEvent.changeText(emailInput, 'testuser@example.com');

    expect(emailInput.props.value).toBe('testuser@example.com');
  });

  it('navigates to Login on successful email submission', () => {
    const navigation = { navigate: jest.fn() };
    const { getByText } = render(<Forgot navigation={navigation} />);
    const submitButton = getByText('Submit');

    fireEvent.press(submitButton);

    expect(navigation.navigate).toHaveBeenCalledWith('Login');
  });
});