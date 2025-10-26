/* eslint-disable prettier/prettier */
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useUserWorkoutDayExerciseCollection } from '../useUserWorkoutDayExerciseCollection';
import { View } from 'react-native';


//const userWorkoutDayExercisesSelector = jest.fn();
const mockGetUserWorkoutDayExercises = jest.fn();
jest.mock('../collection-slice', () => ({
    __esModule: true,
    default: jest.fn(),
    userWorkoutDayExercisesSelector: jest.fn(),
    getUserWorkoutDayExercises: () => mockGetUserWorkoutDayExercises,
    userworkoutdayexercisesLoading: jest.fn(),
    userworkoutdayexercisesErrorSelector: jest.fn()
}));

const dispatch = (f:any) => f();
jest.mock('react-redux', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: () => dispatch,
    useSelector: jest.fn()
}));

const HookHarness = () => {
    const { LoadMoreUserWorkoutDayExercisesButton } = useUserWorkoutDayExerciseCollection(1);
    return <View><LoadMoreUserWorkoutDayExercisesButton /></View>;
};

describe('useUserWorkoutDayExerciseCollectionHook', () => {
    it('returns a load more button', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        testInstance.findByProps({"testID": "load-more-userworkoutdayexercises"});
    });

    it('loads more on load more click', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        const loadMoreButton = testInstance.findByProps({"testID": "load-more-userworkoutdayexercises"});

        loadMoreButton.props.onPress();

        expect(mockGetUserWorkoutDayExercises).toBeCalled();
    });
});

