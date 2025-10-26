/* eslint-disable prettier/prettier */
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useMyEntriesJournalCollection } from '../useMyEntriesJournalCollection';
import { View } from 'react-native';


//const myEntriesJournalsSelector = jest.fn();
const mockGetMyEntriesJournals = jest.fn();
jest.mock('../collection-slice', () => ({
    __esModule: true,
    default: jest.fn(),
    myEntriesJournalsSelector: jest.fn(),
    getMyEntriesJournals: () => mockGetMyEntriesJournals,
    myentriesjournalsLoading: jest.fn(),
    myentriesjournalsErrorSelector: jest.fn()
}));

const dispatch = (f:any) => f();
jest.mock('react-redux', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: () => dispatch,
    useSelector: jest.fn()
}));

const HookHarness = () => {
    const { LoadMoreMyEntriesJournalsButton } = useMyEntriesJournalCollection(1);
    return <View><LoadMoreMyEntriesJournalsButton /></View>;
};

describe('useMyEntriesJournalCollectionHook', () => {
    it('returns a load more button', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        testInstance.findByProps({"testID": "load-more-myentriesjournals"});
    });

    it('loads more on load more click', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        const loadMoreButton = testInstance.findByProps({"testID": "load-more-myentriesjournals"});

        loadMoreButton.props.onPress();

        expect(mockGetMyEntriesJournals).toBeCalled();
    });
});

