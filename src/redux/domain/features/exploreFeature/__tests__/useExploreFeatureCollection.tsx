/* eslint-disable prettier/prettier */
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useExploreFeatureCollection } from '../useExploreFeatureCollection';
import { View } from 'react-native';


//const exploreFeaturesSelector = jest.fn();
const mockGetExploreFeatures = jest.fn();
jest.mock('../collection-slice', () => ({
    __esModule: true,
    default: jest.fn(),
    exploreFeaturesSelector: jest.fn(),
    getExploreFeatures: () => mockGetExploreFeatures,
    explorefeaturesLoading: jest.fn(),
    explorefeaturesErrorSelector: jest.fn()
}));

const dispatch = (f:any) => f();
jest.mock('react-redux', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: () => dispatch,
    useSelector: jest.fn()
}));

const HookHarness = () => {
    const { LoadMoreExploreFeaturesButton } = useExploreFeatureCollection(1);
    return <View><LoadMoreExploreFeaturesButton /></View>;
};

describe('useExploreFeatureCollectionHook', () => {
    it('returns a load more button', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        testInstance.findByProps({"testID": "load-more-explorefeatures"});
    });

    it('loads more on load more click', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        const loadMoreButton = testInstance.findByProps({"testID": "load-more-explorefeatures"});

        loadMoreButton.props.onPress();

        expect(mockGetExploreFeatures).toBeCalled();
    });
});

