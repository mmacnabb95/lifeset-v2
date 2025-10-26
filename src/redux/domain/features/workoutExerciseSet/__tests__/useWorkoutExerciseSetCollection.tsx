/* eslint-disable prettier/prettier */
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useWorkoutExerciseSetCollection } from '../useWorkoutExerciseSetCollection';
import { View } from 'react-native';


//const workoutExerciseSetsSelector = jest.fn();
const mockGetWorkoutExerciseSets = jest.fn();
jest.mock('../collection-slice', () => ({
    __esModule: true,
    default: jest.fn(),
    workoutExerciseSetsSelector: jest.fn(),
    getWorkoutExerciseSets: () => mockGetWorkoutExerciseSets,
    workoutexercisesetsLoading: jest.fn(),
    workoutexercisesetsErrorSelector: jest.fn()
}));

const dispatch = (f:any) => f();
jest.mock('react-redux', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: () => dispatch,
    useSelector: jest.fn()
}));

const HookHarness = () => {
    const { LoadMoreWorkoutExerciseSetsButton } = useWorkoutExerciseSetCollection(1);
    return <View><LoadMoreWorkoutExerciseSetsButton /></View>;
};

describe('useWorkoutExerciseSetCollectionHook', () => {
    it('returns a load more button', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        testInstance.findByProps({"testID": "load-more-workoutexercisesets"});
    });

    it('loads more on load more click', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        const loadMoreButton = testInstance.findByProps({"testID": "load-more-workoutexercisesets"});

        loadMoreButton.props.onPress();

        expect(mockGetWorkoutExerciseSets).toBeCalled();
    });
});

