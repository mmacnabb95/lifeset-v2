/* eslint-disable prettier/prettier */
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useWorkoutDayCollection } from '../useWorkoutDayCollection';
import { View } from 'react-native';


//const workoutDaysSelector = jest.fn();
const mockGetWorkoutDays = jest.fn();
jest.mock('../collection-slice', () => ({
    __esModule: true,
    default: jest.fn(),
    workoutDaysSelector: jest.fn(),
    getWorkoutDays: () => mockGetWorkoutDays,
    workoutdaysLoading: jest.fn(),
    workoutdaysErrorSelector: jest.fn()
}));

const dispatch = (f:any) => f();
jest.mock('react-redux', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: () => dispatch,
    useSelector: jest.fn()
}));

const HookHarness = () => {
    const { LoadMoreWorkoutDaysButton } = useWorkoutDayCollection(1);
    return <View><LoadMoreWorkoutDaysButton /></View>;
};

describe('useWorkoutDayCollectionHook', () => {
    it('returns a load more button', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        testInstance.findByProps({"testID": "load-more-workoutdays"});
    });

    it('loads more on load more click', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        const loadMoreButton = testInstance.findByProps({"testID": "load-more-workoutdays"});

        loadMoreButton.props.onPress();

        expect(mockGetWorkoutDays).toBeCalled();
    });
});

