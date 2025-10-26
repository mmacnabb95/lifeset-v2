/* eslint-disable prettier/prettier */
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { usePublishedWorkoutCollection } from '../usePublishedWorkoutCollection';
import { View } from 'react-native';


//const publishedWorkoutsSelector = jest.fn();
const mockGetPublishedWorkouts = jest.fn();
jest.mock('../collection-slice', () => ({
    __esModule: true,
    default: jest.fn(),
    publishedWorkoutsSelector: jest.fn(),
    getPublishedWorkouts: () => mockGetPublishedWorkouts,
    publishedworkoutsLoading: jest.fn(),
    publishedworkoutsErrorSelector: jest.fn()
}));

const dispatch = (f:any) => f();
jest.mock('react-redux', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: () => dispatch,
    useSelector: jest.fn()
}));

const HookHarness = () => {
    const { LoadMorePublishedWorkoutsButton } = usePublishedWorkoutCollection();
    return <View><LoadMorePublishedWorkoutsButton /></View>;
};

describe('usePublishedWorkoutCollectionHook', () => {
    it('returns a load more button', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        testInstance.findByProps({"testID": "load-more-publishedworkouts"});
    });

    it('loads more on load more click', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        const loadMoreButton = testInstance.findByProps({"testID": "load-more-publishedworkouts"});

        loadMoreButton.props.onPress();

        expect(mockGetPublishedWorkouts).toBeCalled();
    });
});

