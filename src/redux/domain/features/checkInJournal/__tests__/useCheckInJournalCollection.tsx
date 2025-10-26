/* eslint-disable prettier/prettier */
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useCheckInJournalCollection } from '../useCheckInJournalCollection';
import { View } from 'react-native';


//const checkInJournalsSelector = jest.fn();
const mockGetCheckInJournals = jest.fn();
jest.mock('../collection-slice', () => ({
    __esModule: true,
    default: jest.fn(),
    checkInJournalsSelector: jest.fn(),
    getCheckInJournals: () => mockGetCheckInJournals,
    checkinjournalsLoading: jest.fn(),
    checkinjournalsErrorSelector: jest.fn()
}));

const dispatch = (f:any) => f();
jest.mock('react-redux', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: () => dispatch,
    useSelector: jest.fn()
}));

const HookHarness = () => {
    const { LoadMoreCheckInJournalsButton } = useCheckInJournalCollection(1);
    return <View><LoadMoreCheckInJournalsButton /></View>;
};

describe('useCheckInJournalCollectionHook', () => {
    it('returns a load more button', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        testInstance.findByProps({"testID": "load-more-checkinjournals"});
    });

    it('loads more on load more click', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        const loadMoreButton = testInstance.findByProps({"testID": "load-more-checkinjournals"});

        loadMoreButton.props.onPress();

        expect(mockGetCheckInJournals).toBeCalled();
    });
});

