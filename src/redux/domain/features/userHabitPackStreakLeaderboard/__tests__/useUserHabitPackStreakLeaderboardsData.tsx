/* eslint-disable prettier/prettier */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import useUserHabitPackStreakLeaderboardsData from '../useUserHabitPackStreakLeaderboardsData.hook';
import '@testing-library/jest-dom/extend-expect';
import { Pressable, View } from 'react-native';

interface UseUserHabitPackStreakLeaderboardsDataProps {
  userhabitpack?: number;
};
type MockSelectorCallback = () => any;

const mockDispatch = jest.fn((f: any) => Promise.resolve(f));
let mockUseDispatch: any;
let mockUseSelector: any;
let mockGetUserHabitPackStreakLeaderboards: any;
let mockUserHabitPackStreakLeaderboardsSelector: any;
let mockUserHabitPackStreakLeaderboardsErrorSelector: any;

jest.mock('../collection-slice', () => {
  mockGetUserHabitPackStreakLeaderboards = jest.fn(() => Promise.resolve());
  mockUserHabitPackStreakLeaderboardsSelector = jest.fn();
  mockUserHabitPackStreakLeaderboardsErrorSelector = jest.fn();

  return {
    __esModule: true,
    default: jest.fn(),
    clearUserHabitPackStreakLeaderboardItems: jest.fn(),
    getUserHabitPackStreakLeaderboards: mockGetUserHabitPackStreakLeaderboards,
    userHabitPackStreakLeaderboardsSelector: mockUserHabitPackStreakLeaderboardsSelector,
    userHabitPackStreakLeaderboardsErrorSelector: mockUserHabitPackStreakLeaderboardsErrorSelector,
  };
});
jest.mock('react-redux', () => {
  mockUseDispatch = jest.fn(() => mockDispatch);
  mockUseSelector = jest.fn((f: MockSelectorCallback) => f());

  return {
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: mockUseDispatch,
    useSelector: mockUseSelector,
  };
});

const UseUserHabitPackStreakLeaderboardsDataComponent = (props: UseUserHabitPackStreakLeaderboardsDataProps) => {
  const { userhabitpack } = props;
  const { data, error, loading, refresh } = useUserHabitPackStreakLeaderboardsData(userhabitpack);

  return (
    <View>
      {loading && <View data-cy="loading">Loading</View>}
      {error && <View data-cy="error">Error</View>}
      {data && <View data-cy="data">Data</View>}
      <Pressable data-cy="refresh" onPress={refresh}>Refresh</Pressable>
    </View>
  );
};

describe('useUserHabitPackStreakLeaderboardsData.hook', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockGetUserHabitPackStreakLeaderboards.mockClear();
    mockUserHabitPackStreakLeaderboardsSelector.mockClear();
    mockUserHabitPackStreakLeaderboardsErrorSelector.mockClear();
  });

  it('does not trigger fetch if no needed data', () => {
    const testRenderer = renderer.create(<UseUserHabitPackStreakLeaderboardsDataComponent />);
    const testInstance = testRenderer.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findByProps({"data-cy": "refresh"});
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    expect(mockGetUserHabitPackStreakLeaderboards).toBeCalledTimes(0);
  });

  it('shows loading, fetches data', async () => {
    let testRenderer: any;
    act(() => {
      testRenderer = renderer.create(<UseUserHabitPackStreakLeaderboardsDataComponent userhabitpack={1} />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});
    expect(mockGetUserHabitPackStreakLeaderboards).toBeCalledTimes(1);

    mockUserHabitPackStreakLeaderboardsSelector.mockReturnValueOnce({ data: 1 });
    await act(async () => {
      testRenderer.update(<UseUserHabitPackStreakLeaderboardsDataComponent userhabitpack={1} />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);

    // Rerender if data has changed
    mockUserHabitPackStreakLeaderboardsSelector.mockReturnValueOnce({ data: 2 });
    await act(async () => {
      testRenderer.update(<UseUserHabitPackStreakLeaderboardsDataComponent userhabitpack={2} />);
    });
   // expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});

    await act(async () => {
      testRenderer.update(<UseUserHabitPackStreakLeaderboardsDataComponent userhabitpack={2} />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
  });

  it('returns error and refetches the data on refresh button click', async () => {
    mockUserHabitPackStreakLeaderboardsErrorSelector.mockReturnValue('Error');
    let testRenderer: any;
    await act(() => {
      testRenderer = renderer.create(<UseUserHabitPackStreakLeaderboardsDataComponent userhabitpack={1} />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "error"});
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    const refresh = testInstance.findByProps({"data-cy": "refresh"});
    expect(mockGetUserHabitPackStreakLeaderboards).toBeCalledTimes(1);

    mockUserHabitPackStreakLeaderboardsErrorSelector.mockReturnValue(undefined);
    mockUserHabitPackStreakLeaderboardsSelector.mockReturnValue({ data: 1 });

    refresh.props.onPress();

    await act(async () => {
      testRenderer.update(<UseUserHabitPackStreakLeaderboardsDataComponent userhabitpack={1} />);
    });

    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    testInstance.findByProps({"data-cy": "data"});
    expect(mockGetUserHabitPackStreakLeaderboards).toBeCalledTimes(2);
  });
});

