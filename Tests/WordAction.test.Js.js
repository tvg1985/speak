import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import firebase from 'firebase';
import MockFirebase from 'firebase-mock';
import WordAction from '../Components/WordAction';

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

jest.mock('../Components/UserIdContext', () => ({
    UserIdContext: {
        Consumer: (props) => props.children({ userRole: 'child', parentId: 'parent1' }),
    },
}));

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
    describe('categories', () => {
        it('fetches categories from the database', async () => {
            const categories = [ /* your categories data here */];

            // Mock the fetchCategories function
            const fetchCategories = jest.fn(() => Promise.resolve(categories));
            WordAction.fetchCategories = fetchCategories;

            // Render the WordAction component
            const {getByTestId} = render(<WordAction/>);

            // Wait for the categories to be fetched
            await waitFor(() => expect(fetchCategories).toHaveBeenCalled());

            // Check if the categories state is updated correctly
            const categoriesState = getByTestId('categoriesState'); // Assuming you have testID='categoriesState' on your categories state
            expect(categoriesState).toEqual(categories);
        });

        it('renders categories correctly', () => {
            const categories = ['1', '2', '3'];

            // Render the WordAction component with the categories state
            const {getByTestId} = render(<WordAction categories={categories}/>);

            // Check if the FlatList contains the correct number of category items
            const categoryItems = getByTestId('categoryItems'); // Assuming you have testID='categoryItems' on your category items
            expect(categoryItems.length).toEqual(categories.length);

            // Check if each category item contains the correct data
            categories.forEach((category, index) => {
                const categoryItem = categoryItems[index];
                expect(categoryItem).toHaveTextContent(category.category_name);
                expect(categoryItem).toHaveProp('source', {uri: category.category_photo});
            });
        });
    });

    describe('Roles', () => {
        // ...existing tests...

        it('disables "Add Action" button when user role is child', async () => {
            const {getByText} = render(<WordAction/>);
            const addActionButton = getByText('Add Action');
            fireEvent.press(addActionButton);
            await waitFor(() => expect(getByText('You do not have permission to add actions')).toBeTruthy());
        });

        it('loads parent actions when user role is child', async () => {
            const {getByTestId} = render(<WordAction/>);
            await waitFor(() => expect(getByTestId('action-list')).toBeTruthy());
        });

        it('opens modal when "Add Action" button is pressed and user role is parent', async () => {
            jest.mock('../Components/UserIdContext', () => ({
                UserIdContext: {
                    Consumer: (props) => props.children({userRole: 'parent', parentId: 'parent1'}),
                },
            }));

            const {getByText, getByTestId} = render(<WordAction/>);
            const addActionButton = getByText('Add Action');
            fireEvent.press(addActionButton);
            await waitFor(() => expect(getByTestId('modal')).toBeTruthy());
        });

        // Add more tests as needed
    });
});