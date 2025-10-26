/* eslint-disable prettier/prettier */
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useRandomInspoQuoteCollection } from '../useRandomInspoQuoteCollection';
import { View } from 'react-native';


//const randomInspoQuotesSelector = jest.fn();
const mockGetRandomInspoQuotes = jest.fn();
jest.mock('../collection-slice', () => ({
    __esModule: true,
    default: jest.fn(),
    randomInspoQuotesSelector: jest.fn(),
    getRandomInspoQuotes: () => mockGetRandomInspoQuotes,
    randominspoquotesLoading: jest.fn(),
    randominspoquotesErrorSelector: jest.fn()
}));

const dispatch = (f:any) => f();
jest.mock('react-redux', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: () => dispatch,
    useSelector: jest.fn()
}));

const HookHarness = () => {
    const { LoadMoreRandomInspoQuotesButton } = useRandomInspoQuoteCollection();
    return <View><LoadMoreRandomInspoQuotesButton /></View>;
};

describe('useRandomInspoQuoteCollectionHook', () => {
    it('returns a load more button', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        testInstance.findByProps({"testID": "load-more-randominspoquotes"});
    });

    it('loads more on load more click', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        const loadMoreButton = testInstance.findByProps({"testID": "load-more-randominspoquotes"});

        loadMoreButton.props.onPress();

        expect(mockGetRandomInspoQuotes).toBeCalled();
    });
});

