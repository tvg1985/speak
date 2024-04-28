import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import firebase from 'firebase';
import MockFirebase from 'firebase-mock';
import WordAction from '../Components/WordAction';

let mockdatabase = new MockFirebase.MockFirebase();
let mocksdk = new MockFirebase.MockFirebaseSdk(
    () => {
        return null;
    },
    () => {
        return mockdatabase;
    }
);

// Replace the firebase instance with the mock instance
jest.mock('firebase', () => {
    return mocksdk;
});

describe('WordAction', () => {

    it('renders correctly', () => {
        const {getByText} = render(<WordAction/>);

        // Check if the "Add Action" button is rendered
        expect(getByText('Add Action')).toBeTruthy();
    });

    it('opens delete modal on long press', () => {
        const {getByTestId} = render(<WordAction/>);
        const photo = getByTestId('photo'); // Assuming you have testID='photo' on your photo component

        // Perform a long press action on the photo
        fireEvent(photo, 'onLongPress');

        // Check if the delete modal is visible
        expect(getByTestId('deleteModal')).toBeTruthy(); // Assuming you have testID='deleteModal' on your delete modal
    });

    it('closes delete modal on "No" button press', () => {
        const {getByTestId} = render(<WordAction/>);
        const noButton = getByTestId('noButton'); // Assuming you have testID='noButton' on your "No" button

        // Press the "No" button
        fireEvent.press(noButton);

        // Check if the delete modal is not visible
        expect(getByTestId('deleteModal')).not.toBeTruthy(); // Assuming you have testID='deleteModal' on your delete modal
    });


    describe('delete and add', () => {


        it('deletes photo and closes delete modal on "Yes" button press', () => {
            const {getByTestId} = render(<WordAction/>);
            const yesButton = getByTestId('yourYesButtonTestId'); // Replace with your actual testID

            // Press the "Yes" button
            fireEvent.press(yesButton);

            // Check if the photo is not visible
            expect(getByTestId('yourPhotoTestId')).not.toBeTruthy(); // Replace with your actual testID

            // Check if the delete modal is not visible
            expect(getByTestId('yourDeleteModalTestId')).not.toBeTruthy(); // Replace with your actual testID
        });

        it('opens add action modal on "Add Action" button press', () => {
            const {getByTestId} = render(<WordAction/>);
            const addActionButton = getByTestId('yourAddActionButtonTestId'); // Replace with your actual testID

            // Press the "Add Action" button
            fireEvent.press(addActionButton);

            // Check if the add action modal is visible
            expect(getByTestId('yourAddActionModalTestId')).toBeTruthy(); // Replace with your actual testID
        });


        describe('test deleting and adding from database', () => {
            it('adds a new item to the database', async () => {
                const item = { /* your data here */};

                await WordAction.yourAddItemMethod(item); // Replace with your actual method

                const snapshot = await firebase.database().ref('yourDatabasePath').once('value'); // Replace with your actual database path
                const items = snapshot.val();

                expect(items).toContainEqual(item);
            });

            it('deletes an item from the database', async () => {
                const item = { /* your data here */};
                const newItemRef = await firebase.database().ref('yourDatabasePath').push(item); //  actual database path

                await WordAction.yourDeleteItemMethod(newItemRef.key); // Replace with actual method

                const snapshot = await firebase.database().ref('yourDatabasePath').once('value'); //  actual database path
                const items = snapshot.val();

                expect(items).not.toContainEqual(item);
            });
        });
    });
});