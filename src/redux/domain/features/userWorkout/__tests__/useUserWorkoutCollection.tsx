/* eslint-disable prettier/prettier */
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useUserWorkoutCollection } from '../useUserWorkoutCollection';
import { View } from 'react-native';


//const userWorkoutsSelector = jest.fn();
const mockGetUserWorkouts = jest.fn();
jest.mock('../collection-slice', () => ({
    __esModule: true,
    default: jest.fn(),
    userWorkoutsSelector: jest.fn(),
    getUserWorkouts: () => mockGetUserWorkouts,
    userworkoutsLoading: jest.fn(),
    userworkoutsErrorSelector: jest.fn()
}));

const dispatch = (f:any) => f();
jest.mock('react-redux', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: () => dispatch,
    useSelector: jest.fn()
}));

const HookHarness = () => {
    const { LoadMoreUserWorkoutsButton } = useUserWorkoutCollection(1);
    return <View><LoadMoreUserWorkoutsButton /></View>;
};

describe('useUserWorkoutCollectionHook', () => {
    it('returns a load more button', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        testInstance.findByProps({"testID": "load-more-userworkouts"});
    });

    it('loads more on load more click', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        const loadMoreButton = testInstance.findByProps({"testID": "load-more-userworkouts"});

        loadMoreButton.props.onPress();

        expect(mockGetUserWorkouts).toBeCalled();
    });
});

