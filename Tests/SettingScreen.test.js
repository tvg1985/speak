import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { UserIdContext } from '../Components/UserIdContext';
import SettingsScreen from '../Components/SettingsScreen';

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('firebase/database', () => ({
  getDatabase: jest.fn(),
  ref: jest.fn(),
  onValue: jest.fn(),
  remove: jest.fn(),
  push: jest.fn(),
  set: jest.fn(),
}));

jest.mock('crypto-js', () => ({
  SHA256: jest.fn().mockReturnValue({ toString: jest.fn() }),
}));

describe('SettingsScreen', () => {
  it('renders correctly', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('Role: PARENT')).toBeTruthy();
  });

  it('opens add dependent modal on "Add" button press', () => {
    const { getByText, getByTestId } = render(<SettingsScreen />);
    const addButton = getByText('Add');
    fireEvent.press(addButton);
    expect(getByTestId('modal')).toBeTruthy();
  });

  // Add more tests as needed
});