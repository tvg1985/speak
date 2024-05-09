import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import StorybookDetail from "../Components/StorybookDetail";

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('expo-av', () => ({
  Audio: {
    Sound: jest.fn(() => ({
      loadAsync: jest.fn(),
      playAsync: jest.fn(),
      unloadAsync: jest.fn(),
    })),
  },
}));

describe('StorybookPageDetail', () => {
  it('renders correctly', () => {
    const { getByText } = render(<StorybookDetail route={{ params: { page: { page_photo: 'test_photo', page_number: '1' } } }} />);
    expect(getByText('1')).toBeTruthy();
  });

  it('navigates back when the Back button is pressed', async () => {
    const { getByText } = render(<StorybookDetail route={{ params: { page: { page_photo: 'test_photo', page_number: '1' } } }} />);
    const backButton = getByText('Back');
    fireEvent.press(backButton);
    // Add assertion for navigation.goBack() being called
  });

  // Add more tests as needed
});