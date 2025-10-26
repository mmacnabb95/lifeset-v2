/* eslint-disable prettier/prettier */
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useWorkoutCollection } from '../useWorkoutCollection';
import { View } from 'react-native';


//const workoutsSelector = jest.fn();
const mockGetWorkouts = jest.fn();
jest.mock('../collection-slice', () => ({
    __esModule: true,
    default: jest.fn(),
    workoutsSelector: jest.fn(),
    getWorkouts: () => mockGetWorkouts,
    workoutsLoading: jest.fn(),
    workoutsErrorSelector: jest.fn()
}));

const dispatch = (f:any) => f();
jest.mock('react-redux', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: () => dispatch,
    useSelector: jest.fn()
}));

const HookHarness = () => {
    const { LoadMoreWorkoutsButton } = useWorkoutCollection();
    return <View><LoadMoreWorkoutsButton /></View>;
};

describe('useWorkoutCollectionHook', () => {
    it('returns a load more button', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        testInstance.findByProps({"testID": "load-more-workouts"});
    });

    it('loads more on load more click', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        const loadMoreButton = testInstance.findByProps({"testID": "load-more-workouts"});

        loadMoreButton.props.onPress();

        expect(mockGetWorkouts).toBeCalled();
    });
});

