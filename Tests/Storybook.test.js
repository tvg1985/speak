import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import StorybookScreen from '../Components/Storybook';

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('firebase/database', () => ({
  getDatabase: jest.fn(),
  ref: jest.fn(),
  onValue: jest.fn(),
  off: jest.fn(),
  query: jest.fn(),
  orderByChild: jest.fn(),
  equalTo: jest.fn(),
  push: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
}));

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(),
  ref: jest.fn(),
  uploadBytesResumable: jest.fn(),
  getDownloadURL: jest.fn(),
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'Images',
  },
}));

describe('StorybookScreen', () => {
  it('renders correctly', () => {
    const { getByText } = render(<StorybookScreen />);
    expect(getByText('Story Books')).toBeTruthy();
  });

  it('opens the modal when the Add button is pressed', async () => {
    const { getByText, getByTestId } = render(<StorybookScreen />);
    const addButton = getByText('Add');
    fireEvent.press(addButton);
    await waitFor(() => expect(getByTestId('modal')).toBeTruthy());
  });

  it('disables long press functionality when user role is child', async () => {
    // Mock the UserIdContext to return 'child' as the userRole
    jest.mock('../Components/UserIdContext', () => ({
      UserIdContext: {
        Consumer: (props) => props.children({ userRole: 'child' }),
      },
    }));

    const { getByTestId } = render(<StorybookScreen />);
    const storybookItem = getByTestId('storybook-item');
    fireEvent.longPress(storybookItem);
    await waitFor(() => expect(getByTestId('delete-modal')).not.toBeTruthy());
  });

  it('loads parent storybooks when user role is child', async () => {
    // Mock the UserIdContext to return 'child' as the userRole
    jest.mock('../Components/UserIdContext', () => ({
      UserIdContext: {
        Consumer: (props) => props.children({ userRole: 'child', parentId: 'parent1' }),
      },
    }));

    const { getByTestId } = render(<StorybookScreen />);
    await waitFor(() => expect(getByTestId('storybook-list')).toBeTruthy());
  });

  it('loads parent storybook pages when user role is child', async () => {
    // Mock the UserIdContext to return 'child' as the userRole
    jest.mock('../Components/UserIdContext', () => ({
      UserIdContext: {
        Consumer: (props) => props.children({ userRole: 'child', parentId: 'parent1' }),
      },
    }));

    const { getByTestId } = render(<StorybookScreen />);
    const storybookItem = getByTestId('storybook-item');
    fireEvent.press(storybookItem);
    await waitFor(() => expect(getByTestId('storybook-page-list')).toBeTruthy());
  });

  // Add more tests as needed
});