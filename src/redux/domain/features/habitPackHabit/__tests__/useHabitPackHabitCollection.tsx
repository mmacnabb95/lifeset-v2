/* eslint-disable prettier/prettier */
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useHabitPackHabitCollection } from '../useHabitPackHabitCollection';
import { View } from 'react-native';


//const habitPackHabitsSelector = jest.fn();
const mockGetHabitPackHabits = jest.fn();
jest.mock('../collection-slice', () => ({
    __esModule: true,
    default: jest.fn(),
    habitPackHabitsSelector: jest.fn(),
    getHabitPackHabits: () => mockGetHabitPackHabits,
    habitpackhabitsLoading: jest.fn(),
    habitpackhabitsErrorSelector: jest.fn()
}));

const dispatch = (f:any) => f();
jest.mock('react-redux', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: () => dispatch,
    useSelector: jest.fn()
}));

const HookHarness = () => {
    const { LoadMoreHabitPackHabitsButton } = useHabitPackHabitCollection(1);
    return <View><LoadMoreHabitPackHabitsButton /></View>;
};

describe('useHabitPackHabitCollectionHook', () => {
    it('returns a load more button', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        testInstance.findByProps({"testID": "load-more-habitpackhabits"});
    });

    it('loads more on load more click', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        const loadMoreButton = testInstance.findByProps({"testID": "load-more-habitpackhabits"});

        loadMoreButton.props.onPress();

        expect(mockGetHabitPackHabits).toBeCalled();
    });
});

