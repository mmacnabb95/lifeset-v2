/* eslint-disable prettier/prettier */
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useStreakLeaderBoardCollection } from '../useStreakLeaderBoardCollection';
import { View } from 'react-native';


//const streakLeaderBoardsSelector = jest.fn();
const mockGetStreakLeaderBoards = jest.fn();
jest.mock('../collection-slice', () => ({
    __esModule: true,
    default: jest.fn(),
    streakLeaderBoardsSelector: jest.fn(),
    getStreakLeaderBoards: () => mockGetStreakLeaderBoards,
    streakleaderboardsLoading: jest.fn(),
    streakleaderboardsErrorSelector: jest.fn()
}));

const dispatch = (f:any) => f();
jest.mock('react-redux', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: () => dispatch,
    useSelector: jest.fn()
}));

const HookHarness = () => {
    const { LoadMoreStreakLeaderBoardsButton } = useStreakLeaderBoardCollection(1);
    return <View><LoadMoreStreakLeaderBoardsButton /></View>;
};

describe('useStreakLeaderBoardCollectionHook', () => {
    it('returns a load more button', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        testInstance.findByProps({"testID": "load-more-streakleaderboards"});
    });

    it('loads more on load more click', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        const loadMoreButton = testInstance.findByProps({"testID": "load-more-streakleaderboards"});

        loadMoreButton.props.onPress();

        expect(mockGetStreakLeaderBoards).toBeCalled();
    });
});

