/* eslint-disable prettier/prettier */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import useHabitCompletedRecordsData from '../useHabitCompletedRecordsData.hook';
import '@testing-library/jest-dom/extend-expect';
import { Pressable, View } from 'react-native';

interface UseHabitCompletedRecordsDataProps {
  habit?: number;
};
type MockSelectorCallback = () => any;

const mockDispatch = jest.fn((f: any) => Promise.resolve(f));
let mockUseDispatch: any;
let mockUseSelector: any;
let mockGetHabitCompletedRecords: any;
let mockHabitCompletedRecordsSelector: any;
let mockHabitCompletedRecordsErrorSelector: any;

jest.mock('../collection-slice', () => {
  mockGetHabitCompletedRecords = jest.fn(() => Promise.resolve());
  mockHabitCompletedRecordsSelector = jest.fn();
  mockHabitCompletedRecordsErrorSelector = jest.fn();

  return {
    __esModule: true,
    default: jest.fn(),
    clearHabitCompletedRecordItems: jest.fn(),
    getHabitCompletedRecords: mockGetHabitCompletedRecords,
    habitCompletedRecordsSelector: mockHabitCompletedRecordsSelector,
    habitCompletedRecordsErrorSelector: mockHabitCompletedRecordsErrorSelector,
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

const UseHabitCompletedRecordsDataComponent = (props: UseHabitCompletedRecordsDataProps) => {
  const { habit } = props;
  const { data, error, loading, refresh } = useHabitCompletedRecordsData(habit);

  return (
    <View>
      {loading && <View data-cy="loading">Loading</View>}
      {error && <View data-cy="error">Error</View>}
      {data && <View data-cy="data">Data</View>}
      <Pressable data-cy="refresh" onPress={refresh}>Refresh</Pressable>
    </View>
  );
};

describe('useHabitCompletedRecordsData.hook', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockGetHabitCompletedRecords.mockClear();
    mockHabitCompletedRecordsSelector.mockClear();
    mockHabitCompletedRecordsErrorSelector.mockClear();
  });

  it('does not trigger fetch if no needed data', () => {
    const testRenderer = renderer.create(<UseHabitCompletedRecordsDataComponent />);
    const testInstance = testRenderer.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findByProps({"data-cy": "refresh"});
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    expect(mockGetHabitCompletedRecords).toBeCalledTimes(0);
  });

  it('shows loading, fetches data', async () => {
    let testRenderer: any;
    act(() => {
      testRenderer = renderer.create(<UseHabitCompletedRecordsDataComponent habit={1} />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});
    expect(mockGetHabitCompletedRecords).toBeCalledTimes(1);

    mockHabitCompletedRecordsSelector.mockReturnValueOnce({ data: 1 });
    await act(async () => {
      testRenderer.update(<UseHabitCompletedRecordsDataComponent habit={1} />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);

    // Rerender if data has changed
    mockHabitCompletedRecordsSelector.mockReturnValueOnce({ data: 2 });
    await act(async () => {
      testRenderer.update(<UseHabitCompletedRecordsDataComponent habit={2} />);
    });
   // expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});

    await act(async () => {
      testRenderer.update(<UseHabitCompletedRecordsDataComponent habit={2} />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
  });

  it('returns error and refetches the data on refresh button click', async () => {
    mockHabitCompletedRecordsErrorSelector.mockReturnValue('Error');
    let testRenderer: any;
    await act(() => {
      testRenderer = renderer.create(<UseHabitCompletedRecordsDataComponent habit={1} />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "error"});
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    const refresh = testInstance.findByProps({"data-cy": "refresh"});
    expect(mockGetHabitCompletedRecords).toBeCalledTimes(1);

    mockHabitCompletedRecordsErrorSelector.mockReturnValue(undefined);
    mockHabitCompletedRecordsSelector.mockReturnValue({ data: 1 });

    refresh.props.onPress();

    await act(async () => {
      testRenderer.update(<UseHabitCompletedRecordsDataComponent habit={1} />);
    });

    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    testInstance.findByProps({"data-cy": "data"});
    expect(mockGetHabitCompletedRecords).toBeCalledTimes(2);
  });
});

