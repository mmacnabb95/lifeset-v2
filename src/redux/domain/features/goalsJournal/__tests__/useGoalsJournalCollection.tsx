/* eslint-disable prettier/prettier */
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useGoalsJournalCollection } from '../useGoalsJournalCollection';
import { View } from 'react-native';


//const goalsJournalsSelector = jest.fn();
const mockGetGoalsJournals = jest.fn();
jest.mock('../collection-slice', () => ({
    __esModule: true,
    default: jest.fn(),
    goalsJournalsSelector: jest.fn(),
    getGoalsJournals: () => mockGetGoalsJournals,
    goalsjournalsLoading: jest.fn(),
    goalsjournalsErrorSelector: jest.fn()
}));

const dispatch = (f:any) => f();
jest.mock('react-redux', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: () => dispatch,
    useSelector: jest.fn()
}));

const HookHarness = () => {
    const { LoadMoreGoalsJournalsButton } = useGoalsJournalCollection(1);
    return <View><LoadMoreGoalsJournalsButton /></View>;
};

describe('useGoalsJournalCollectionHook', () => {
    it('returns a load more button', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        testInstance.findByProps({"testID": "load-more-goalsjournals"});
    });

    it('loads more on load more click', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        const loadMoreButton = testInstance.findByProps({"testID": "load-more-goalsjournals"});

        loadMoreButton.props.onPress();

        expect(mockGetGoalsJournals).toBeCalled();
    });
});

