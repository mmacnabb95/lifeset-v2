/* eslint-disable prettier/prettier */
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useMyGratitudeJournalCollection } from '../useMyGratitudeJournalCollection';
import { View } from 'react-native';


//const myGratitudeJournalsSelector = jest.fn();
const mockGetMyGratitudeJournals = jest.fn();
jest.mock('../collection-slice', () => ({
    __esModule: true,
    default: jest.fn(),
    myGratitudeJournalsSelector: jest.fn(),
    getMyGratitudeJournals: () => mockGetMyGratitudeJournals,
    mygratitudejournalsLoading: jest.fn(),
    mygratitudejournalsErrorSelector: jest.fn()
}));

const dispatch = (f:any) => f();
jest.mock('react-redux', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: () => dispatch,
    useSelector: jest.fn()
}));

const HookHarness = () => {
    const { LoadMoreMyGratitudeJournalsButton } = useMyGratitudeJournalCollection(1);
    return <View><LoadMoreMyGratitudeJournalsButton /></View>;
};

describe('useMyGratitudeJournalCollectionHook', () => {
    it('returns a load more button', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        testInstance.findByProps({"testID": "load-more-mygratitudejournals"});
    });

    it('loads more on load more click', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        const loadMoreButton = testInstance.findByProps({"testID": "load-more-mygratitudejournals"});

        loadMoreButton.props.onPress();

        expect(mockGetMyGratitudeJournals).toBeCalled();
    });
});

