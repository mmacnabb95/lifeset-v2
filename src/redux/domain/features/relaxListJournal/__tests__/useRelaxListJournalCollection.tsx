/* eslint-disable prettier/prettier */
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useRelaxListJournalCollection } from '../useRelaxListJournalCollection';
import { View } from 'react-native';


//const relaxListJournalsSelector = jest.fn();
const mockGetRelaxListJournals = jest.fn();
jest.mock('../collection-slice', () => ({
    __esModule: true,
    default: jest.fn(),
    relaxListJournalsSelector: jest.fn(),
    getRelaxListJournals: () => mockGetRelaxListJournals,
    relaxlistjournalsLoading: jest.fn(),
    relaxlistjournalsErrorSelector: jest.fn()
}));

const dispatch = (f:any) => f();
jest.mock('react-redux', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: () => dispatch,
    useSelector: jest.fn()
}));

const HookHarness = () => {
    const { LoadMoreRelaxListJournalsButton } = useRelaxListJournalCollection(1);
    return <View><LoadMoreRelaxListJournalsButton /></View>;
};

describe('useRelaxListJournalCollectionHook', () => {
    it('returns a load more button', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        testInstance.findByProps({"testID": "load-more-relaxlistjournals"});
    });

    it('loads more on load more click', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        const loadMoreButton = testInstance.findByProps({"testID": "load-more-relaxlistjournals"});

        loadMoreButton.props.onPress();

        expect(mockGetRelaxListJournals).toBeCalled();
    });
});

