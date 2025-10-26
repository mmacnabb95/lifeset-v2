/* eslint-disable prettier/prettier */
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useJournalCollection } from '../useJournalCollection';
import { View } from 'react-native';


//const journalsSelector = jest.fn();
const mockGetJournals = jest.fn();
jest.mock('../collection-slice', () => ({
    __esModule: true,
    default: jest.fn(),
    journalsSelector: jest.fn(),
    getJournals: () => mockGetJournals,
    journalsLoading: jest.fn(),
    journalsErrorSelector: jest.fn()
}));

const dispatch = (f:any) => f();
jest.mock('react-redux', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: () => dispatch,
    useSelector: jest.fn()
}));

const HookHarness = () => {
    const { LoadMoreJournalsButton } = useJournalCollection(1);
    return <View><LoadMoreJournalsButton /></View>;
};

describe('useJournalCollectionHook', () => {
    it('returns a load more button', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        testInstance.findByProps({"testID": "load-more-journals"});
    });

    it('loads more on load more click', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        const loadMoreButton = testInstance.findByProps({"testID": "load-more-journals"});

        loadMoreButton.props.onPress();

        expect(mockGetJournals).toBeCalled();
    });
});

