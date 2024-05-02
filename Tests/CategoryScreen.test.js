import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import CategoryScreen from './CategoryScreen';

describe('CategoryScreen', () => {
    it('renders correctly', () => {
        const {getByText} = render(<CategoryScreen route={{params: {userId: '1', categoryName: 'Test'}}}/>);
        expect(getByText('Test')).toBeTruthy();
    });

    it('navigates to WordAction screen when the Word Action button is pressed', () => {
        const {getByText} = render(<CategoryScreen route={{params: {userId: '1', categoryName: 'Test'}}}/>);
        const button = getByText('Word Action');
        fireEvent.press(button);

    });

    it('logs the message when the Settings button is pressed', () => {
        const {getByText} = render(<CategoryScreen route={{params: {userId: '1', categoryName: 'Test'}}}/>);
        const button = getByText('Settings');
        fireEvent.press(button);
    });

    it('opens the Add Action modal when the Add Action button is pressed', () => {
        const {getByText} = render(<CategoryScreen route={{params: {userId: '1', categoryName: 'Test'}}}/>);
        const button = getByText('Add Action');
        fireEvent.press(button);
        expect(getByText('Add a new action')).toBeTruthy();
    });

    it('logs the error message when the Add button in the Add Action modal is pressed', () => {
        const {getByText} = render(<CategoryScreen route={{params: {userId: '1', categoryName: 'Test'}}}/>);
        const button = getByText('Add');
        fireEvent.press(button);
    });

    it('closes the Add Action modal when the Cancel button in the Add Action modal is pressed', () => {
        const {getByText, queryByText} = render(<CategoryScreen
            route={{params: {userId: '1', categoryName: 'Test'}}}/>);
        const button = getByText('Cancel');
        fireEvent.press(button);
        expect(queryByText('Add a new action')).toBeNull();
    });
});