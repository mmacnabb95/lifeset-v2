/* eslint-disable prettier/prettier */
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useExerciseResourceCollection } from '../useExerciseResourceCollection';
import { View } from 'react-native';


//const exerciseResourcesSelector = jest.fn();
const mockGetExerciseResources = jest.fn();
jest.mock('../collection-slice', () => ({
    __esModule: true,
    default: jest.fn(),
    exerciseResourcesSelector: jest.fn(),
    getExerciseResources: () => mockGetExerciseResources,
    exerciseresourcesLoading: jest.fn(),
    exerciseresourcesErrorSelector: jest.fn()
}));

const dispatch = (f:any) => f();
jest.mock('react-redux', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: () => dispatch,
    useSelector: jest.fn()
}));

const HookHarness = () => {
    const { LoadMoreExerciseResourcesButton } = useExerciseResourceCollection(1);
    return <View><LoadMoreExerciseResourcesButton /></View>;
};

describe('useExerciseResourceCollectionHook', () => {
    it('returns a load more button', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        testInstance.findByProps({"testID": "load-more-exerciseresources"});
    });

    it('loads more on load more click', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        const loadMoreButton = testInstance.findByProps({"testID": "load-more-exerciseresources"});

        loadMoreButton.props.onPress();

        expect(mockGetExerciseResources).toBeCalled();
    });
});

