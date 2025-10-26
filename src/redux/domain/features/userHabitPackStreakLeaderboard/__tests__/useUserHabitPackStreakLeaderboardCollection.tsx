/* eslint-disable prettier/prettier */
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useUserHabitPackStreakLeaderboardCollection } from '../useUserHabitPackStreakLeaderboardCollection';
import { View } from 'react-native';


//const userHabitPackStreakLeaderboardsSelector = jest.fn();
const mockGetUserHabitPackStreakLeaderboards = jest.fn();
jest.mock('../collection-slice', () => ({
    __esModule: true,
    default: jest.fn(),
    userHabitPackStreakLeaderboardsSelector: jest.fn(),
    getUserHabitPackStreakLeaderboards: () => mockGetUserHabitPackStreakLeaderboards,
    userhabitpackstreakleaderboardsLoading: jest.fn(),
    userhabitpackstreakleaderboardsErrorSelector: jest.fn()
}));

const dispatch = (f:any) => f();
jest.mock('react-redux', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: () => dispatch,
    useSelector: jest.fn()
}));

const HookHarness = () => {
    const { LoadMoreUserHabitPackStreakLeaderboardsButton } = useUserHabitPackStreakLeaderboardCollection(1);
    return <View><LoadMoreUserHabitPackStreakLeaderboardsButton /></View>;
};

describe('useUserHabitPackStreakLeaderboardCollectionHook', () => {
    it('returns a load more button', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        testInstance.findByProps({"testID": "load-more-userhabitpackstreakleaderboards"});
    });

    it('loads more on load more click', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        const loadMoreButton = testInstance.findByProps({"testID": "load-more-userhabitpackstreakleaderboards"});

        loadMoreButton.props.onPress();

        expect(mockGetUserHabitPackStreakLeaderboards).toBeCalled();
    });
});

