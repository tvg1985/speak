import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import StorybookPage from '../Components/StorybookPage';

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('firebase/database', () => ({
  getDatabase: jest.fn(),
  ref: jest.fn(),
  onValue: jest.fn(),
  query: jest.fn(),
  orderByChild: jest.fn(),
  equalTo: jest.fn(),
  push: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'Images',
  },
}));

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));

jest.mock('expo-av', () => ({
  Audio: {
    Sound: jest.fn(),
  },
}));

describe('StorybookPage', () => {
  it('renders correctly', () => {
    const { getByText } = render(<StorybookPage route={{ params: { storybook: {}, userId: '1' } }} />);
    expect(getByText('Storybook')).toBeTruthy();
  });

  it('opens the modal when the Add Page button is pressed', async () => {
    const { getByText, getByTestId } = render(<StorybookPage route={{ params: { storybook: {}, userId: '1' } }} />);
    const addButton = getByText('Add Page');
    fireEvent.press(addButton);
    await waitFor(() => expect(getByTestId('modal')).toBeTruthy());
  });

  // Add more tests as needed
});