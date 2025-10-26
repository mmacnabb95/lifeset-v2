/* eslint-disable prettier/prettier */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import useHabitPackHabitsData from '../useHabitPackHabitsData.hook';
import '@testing-library/jest-dom/extend-expect';
import { Pressable, View } from 'react-native';

interface UseHabitPackHabitsDataProps {
  habitpack?: number;
};
type MockSelectorCallback = () => any;

const mockDispatch = jest.fn((f: any) => Promise.resolve(f));
let mockUseDispatch: any;
let mockUseSelector: any;
let mockGetHabitPackHabits: any;
let mockHabitPackHabitsSelector: any;
let mockHabitPackHabitsErrorSelector: any;

jest.mock('../collection-slice', () => {
  mockGetHabitPackHabits = jest.fn(() => Promise.resolve());
  mockHabitPackHabitsSelector = jest.fn();
  mockHabitPackHabitsErrorSelector = jest.fn();

  return {
    __esModule: true,
    default: jest.fn(),
    clearHabitPackHabitItems: jest.fn(),
    getHabitPackHabits: mockGetHabitPackHabits,
    habitPackHabitsSelector: mockHabitPackHabitsSelector,
    habitPackHabitsErrorSelector: mockHabitPackHabitsErrorSelector,
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

const UseHabitPackHabitsDataComponent = (props: UseHabitPackHabitsDataProps) => {
  const { habitpack } = props;
  const { data, error, loading, refresh } = useHabitPackHabitsData(habitpack);

  return (
    <View>
      {loading && <View data-cy="loading">Loading</View>}
      {error && <View data-cy="error">Error</View>}
      {data && <View data-cy="data">Data</View>}
      <Pressable data-cy="refresh" onPress={refresh}>Refresh</Pressable>
    </View>
  );
};

describe('useHabitPackHabitsData.hook', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockGetHabitPackHabits.mockClear();
    mockHabitPackHabitsSelector.mockClear();
    mockHabitPackHabitsErrorSelector.mockClear();
  });

  it('does not trigger fetch if no needed data', () => {
    const testRenderer = renderer.create(<UseHabitPackHabitsDataComponent />);
    const testInstance = testRenderer.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findByProps({"data-cy": "refresh"});
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    expect(mockGetHabitPackHabits).toBeCalledTimes(0);
  });

  it('shows loading, fetches data', async () => {
    let testRenderer: any;
    act(() => {
      testRenderer = renderer.create(<UseHabitPackHabitsDataComponent habitpack={1} />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});
    expect(mockGetHabitPackHabits).toBeCalledTimes(1);

    mockHabitPackHabitsSelector.mockReturnValueOnce({ data: 1 });
    await act(async () => {
      testRenderer.update(<UseHabitPackHabitsDataComponent habitpack={1} />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);

    // Rerender if data has changed
    mockHabitPackHabitsSelector.mockReturnValueOnce({ data: 2 });
    await act(async () => {
      testRenderer.update(<UseHabitPackHabitsDataComponent habitpack={2} />);
    });
   // expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});

    await act(async () => {
      testRenderer.update(<UseHabitPackHabitsDataComponent habitpack={2} />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
  });

  it('returns error and refetches the data on refresh button click', async () => {
    mockHabitPackHabitsErrorSelector.mockReturnValue('Error');
    let testRenderer: any;
    await act(() => {
      testRenderer = renderer.create(<UseHabitPackHabitsDataComponent habitpack={1} />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "error"});
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    const refresh = testInstance.findByProps({"data-cy": "refresh"});
    expect(mockGetHabitPackHabits).toBeCalledTimes(1);

    mockHabitPackHabitsErrorSelector.mockReturnValue(undefined);
    mockHabitPackHabitsSelector.mockReturnValue({ data: 1 });

    refresh.props.onPress();

    await act(async () => {
      testRenderer.update(<UseHabitPackHabitsDataComponent habitpack={1} />);
    });

    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    testInstance.findByProps({"data-cy": "data"});
    expect(mockGetHabitPackHabits).toBeCalledTimes(2);
  });
});

