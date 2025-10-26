/* eslint-disable prettier/prettier */
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useWorkoutDayExerciseCollection } from '../useWorkoutDayExerciseCollection';
import { View } from 'react-native';


//const workoutDayExercisesSelector = jest.fn();
const mockGetWorkoutDayExercises = jest.fn();
jest.mock('../collection-slice', () => ({
    __esModule: true,
    default: jest.fn(),
    workoutDayExercisesSelector: jest.fn(),
    getWorkoutDayExercises: () => mockGetWorkoutDayExercises,
    workoutdayexercisesLoading: jest.fn(),
    workoutdayexercisesErrorSelector: jest.fn()
}));

const dispatch = (f:any) => f();
jest.mock('react-redux', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: () => dispatch,
    useSelector: jest.fn()
}));

const HookHarness = () => {
    const { LoadMoreWorkoutDayExercisesButton } = useWorkoutDayExerciseCollection(1);
    return <View><LoadMoreWorkoutDayExercisesButton /></View>;
};

describe('useWorkoutDayExerciseCollectionHook', () => {
    it('returns a load more button', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        testInstance.findByProps({"testID": "load-more-workoutdayexercises"});
    });

    it('loads more on load more click', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        const loadMoreButton = testInstance.findByProps({"testID": "load-more-workoutdayexercises"});

        loadMoreButton.props.onPress();

        expect(mockGetWorkoutDayExercises).toBeCalled();
    });
});

