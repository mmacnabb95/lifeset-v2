/* eslint-disable prettier/prettier */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import useUserHabitPackHabitsData from '../useUserHabitPackHabitsData.hook';
import '@testing-library/jest-dom/extend-expect';
import { Pressable, View } from 'react-native';

interface UseUserHabitPackHabitsDataProps {
  userhabitpack?: number;
};
type MockSelectorCallback = () => any;

const mockDispatch = jest.fn((f: any) => Promise.resolve(f));
let mockUseDispatch: any;
let mockUseSelector: any;
let mockGetUserHabitPackHabits: any;
let mockUserHabitPackHabitsSelector: any;
let mockUserHabitPackHabitsErrorSelector: any;

jest.mock('../collection-slice', () => {
  mockGetUserHabitPackHabits = jest.fn(() => Promise.resolve());
  mockUserHabitPackHabitsSelector = jest.fn();
  mockUserHabitPackHabitsErrorSelector = jest.fn();

  return {
    __esModule: true,
    default: jest.fn(),
    clearUserHabitPackHabitItems: jest.fn(),
    getUserHabitPackHabits: mockGetUserHabitPackHabits,
    userHabitPackHabitsSelector: mockUserHabitPackHabitsSelector,
    userHabitPackHabitsErrorSelector: mockUserHabitPackHabitsErrorSelector,
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

const UseUserHabitPackHabitsDataComponent = (props: UseUserHabitPackHabitsDataProps) => {
  const { userhabitpack } = props;
  const { data, error, loading, refresh } = useUserHabitPackHabitsData(userhabitpack);

  return (
    <View>
      {loading && <View data-cy="loading">Loading</View>}
      {error && <View data-cy="error">Error</View>}
      {data && <View data-cy="data">Data</View>}
      <Pressable data-cy="refresh" onPress={refresh}>Refresh</Pressable>
    </View>
  );
};

describe('useUserHabitPackHabitsData.hook', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockGetUserHabitPackHabits.mockClear();
    mockUserHabitPackHabitsSelector.mockClear();
    mockUserHabitPackHabitsErrorSelector.mockClear();
  });

  it('does not trigger fetch if no needed data', () => {
    const testRenderer = renderer.create(<UseUserHabitPackHabitsDataComponent />);
    const testInstance = testRenderer.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findByProps({"data-cy": "refresh"});
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    expect(mockGetUserHabitPackHabits).toBeCalledTimes(0);
  });

  it('shows loading, fetches data', async () => {
    let testRenderer: any;
    act(() => {
      testRenderer = renderer.create(<UseUserHabitPackHabitsDataComponent userhabitpack={1} />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});
    expect(mockGetUserHabitPackHabits).toBeCalledTimes(1);

    mockUserHabitPackHabitsSelector.mockReturnValueOnce({ data: 1 });
    await act(async () => {
      testRenderer.update(<UseUserHabitPackHabitsDataComponent userhabitpack={1} />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);

    // Rerender if data has changed
    mockUserHabitPackHabitsSelector.mockReturnValueOnce({ data: 2 });
    await act(async () => {
      testRenderer.update(<UseUserHabitPackHabitsDataComponent userhabitpack={2} />);
    });
   // expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});

    await act(async () => {
      testRenderer.update(<UseUserHabitPackHabitsDataComponent userhabitpack={2} />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
  });

  it('returns error and refetches the data on refresh button click', async () => {
    mockUserHabitPackHabitsErrorSelector.mockReturnValue('Error');
    let testRenderer: any;
    await act(() => {
      testRenderer = renderer.create(<UseUserHabitPackHabitsDataComponent userhabitpack={1} />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "error"});
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    const refresh = testInstance.findByProps({"data-cy": "refresh"});
    expect(mockGetUserHabitPackHabits).toBeCalledTimes(1);

    mockUserHabitPackHabitsErrorSelector.mockReturnValue(undefined);
    mockUserHabitPackHabitsSelector.mockReturnValue({ data: 1 });

    refresh.props.onPress();

    await act(async () => {
      testRenderer.update(<UseUserHabitPackHabitsDataComponent userhabitpack={1} />);
    });

    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    testInstance.findByProps({"data-cy": "data"});
    expect(mockGetUserHabitPackHabits).toBeCalledTimes(2);
  });
});

