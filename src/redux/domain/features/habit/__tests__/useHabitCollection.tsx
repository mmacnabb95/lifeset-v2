/* eslint-disable prettier/prettier */
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useHabitCollection } from '../useHabitCollection';
import { View } from 'react-native';


//const habitsSelector = jest.fn();
const mockGetHabits = jest.fn();
jest.mock('../collection-slice', () => ({
    __esModule: true,
    default: jest.fn(),
    habitsSelector: jest.fn(),
    getHabits: () => mockGetHabits,
    habitsLoading: jest.fn(),
    habitsErrorSelector: jest.fn()
}));

const dispatch = (f:any) => f();
jest.mock('react-redux', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: () => dispatch,
    useSelector: jest.fn()
}));

const HookHarness = () => {
    const { LoadMoreHabitsButton } = useHabitCollection(1);
    return <View><LoadMoreHabitsButton /></View>;
};

describe('useHabitCollectionHook', () => {
    it('returns a load more button', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        testInstance.findByProps({"testID": "load-more-habits"});
    });

    it('loads more on load more click', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        const loadMoreButton = testInstance.findByProps({"testID": "load-more-habits"});

        loadMoreButton.props.onPress();

        expect(mockGetHabits).toBeCalled();
    });
});

