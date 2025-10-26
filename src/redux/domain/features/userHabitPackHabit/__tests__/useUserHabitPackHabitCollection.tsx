/* eslint-disable prettier/prettier */
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useUserHabitPackHabitCollection } from '../useUserHabitPackHabitCollection';
import { View } from 'react-native';


//const userHabitPackHabitsSelector = jest.fn();
const mockGetUserHabitPackHabits = jest.fn();
jest.mock('../collection-slice', () => ({
    __esModule: true,
    default: jest.fn(),
    userHabitPackHabitsSelector: jest.fn(),
    getUserHabitPackHabits: () => mockGetUserHabitPackHabits,
    userhabitpackhabitsLoading: jest.fn(),
    userhabitpackhabitsErrorSelector: jest.fn()
}));

const dispatch = (f:any) => f();
jest.mock('react-redux', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: () => dispatch,
    useSelector: jest.fn()
}));

const HookHarness = () => {
    const { LoadMoreUserHabitPackHabitsButton } = useUserHabitPackHabitCollection(1);
    return <View><LoadMoreUserHabitPackHabitsButton /></View>;
};

describe('useUserHabitPackHabitCollectionHook', () => {
    it('returns a load more button', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        testInstance.findByProps({"testID": "load-more-userhabitpackhabits"});
    });

    it('loads more on load more click', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        const loadMoreButton = testInstance.findByProps({"testID": "load-more-userhabitpackhabits"});

        loadMoreButton.props.onPress();

        expect(mockGetUserHabitPackHabits).toBeCalled();
    });
});

