/* eslint-disable prettier/prettier */
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useInspoQuoteCollection } from '../useInspoQuoteCollection';
import { View } from 'react-native';


//const inspoQuotesSelector = jest.fn();
const mockGetInspoQuotes = jest.fn();
jest.mock('../collection-slice', () => ({
    __esModule: true,
    default: jest.fn(),
    inspoQuotesSelector: jest.fn(),
    getInspoQuotes: () => mockGetInspoQuotes,
    inspoquotesLoading: jest.fn(),
    inspoquotesErrorSelector: jest.fn()
}));

const dispatch = (f:any) => f();
jest.mock('react-redux', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: () => dispatch,
    useSelector: jest.fn()
}));

const HookHarness = () => {
    const { LoadMoreInspoQuotesButton } = useInspoQuoteCollection();
    return <View><LoadMoreInspoQuotesButton /></View>;
};

describe('useInspoQuoteCollectionHook', () => {
    it('returns a load more button', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        testInstance.findByProps({"testID": "load-more-inspoquotes"});
    });

    it('loads more on load more click', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        const loadMoreButton = testInstance.findByProps({"testID": "load-more-inspoquotes"});

        loadMoreButton.props.onPress();

        expect(mockGetInspoQuotes).toBeCalled();
    });
});

