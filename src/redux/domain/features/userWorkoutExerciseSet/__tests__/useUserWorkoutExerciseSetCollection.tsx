/* eslint-disable prettier/prettier */
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useUserWorkoutExerciseSetCollection } from '../useUserWorkoutExerciseSetCollection';
import { View } from 'react-native';


//const userWorkoutExerciseSetsSelector = jest.fn();
const mockGetUserWorkoutExerciseSets = jest.fn();
jest.mock('../collection-slice', () => ({
    __esModule: true,
    default: jest.fn(),
    userWorkoutExerciseSetsSelector: jest.fn(),
    getUserWorkoutExerciseSets: () => mockGetUserWorkoutExerciseSets,
    userworkoutexercisesetsLoading: jest.fn(),
    userworkoutexercisesetsErrorSelector: jest.fn()
}));

const dispatch = (f:any) => f();
jest.mock('react-redux', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: () => dispatch,
    useSelector: jest.fn()
}));

const HookHarness = () => {
    const { LoadMoreUserWorkoutExerciseSetsButton } = useUserWorkoutExerciseSetCollection(1);
    return <View><LoadMoreUserWorkoutExerciseSetsButton /></View>;
};

describe('useUserWorkoutExerciseSetCollectionHook', () => {
    it('returns a load more button', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        testInstance.findByProps({"testID": "load-more-userworkoutexercisesets"});
    });

    it('loads more on load more click', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        const loadMoreButton = testInstance.findByProps({"testID": "load-more-userworkoutexercisesets"});

        loadMoreButton.props.onPress();

        expect(mockGetUserWorkoutExerciseSets).toBeCalled();
    });
});

