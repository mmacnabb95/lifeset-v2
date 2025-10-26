/* eslint-disable prettier/prettier */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import useRemindersData from '../useRemindersData.hook';
import '@testing-library/jest-dom/extend-expect';
import { Pressable, View } from 'react-native';

interface UseRemindersDataProps {
  habit?: number;
};
type MockSelectorCallback = () => any;

const mockDispatch = jest.fn((f: any) => Promise.resolve(f));
let mockUseDispatch: any;
let mockUseSelector: any;
let mockGetReminders: any;
let mockRemindersSelector: any;
let mockRemindersErrorSelector: any;

jest.mock('../collection-slice', () => {
  mockGetReminders = jest.fn(() => Promise.resolve());
  mockRemindersSelector = jest.fn();
  mockRemindersErrorSelector = jest.fn();

  return {
    __esModule: true,
    default: jest.fn(),
    clearReminderItems: jest.fn(),
    getReminders: mockGetReminders,
    remindersSelector: mockRemindersSelector,
    remindersErrorSelector: mockRemindersErrorSelector,
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

const UseRemindersDataComponent = (props: UseRemindersDataProps) => {
  const { habit } = props;
  const { data, error, loading, refresh } = useRemindersData(habit);

  return (
    <View>
      {loading && <View data-cy="loading">Loading</View>}
      {error && <View data-cy="error">Error</View>}
      {data && <View data-cy="data">Data</View>}
      <Pressable data-cy="refresh" onPress={refresh}>Refresh</Pressable>
    </View>
  );
};

describe('useRemindersData.hook', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockGetReminders.mockClear();
    mockRemindersSelector.mockClear();
    mockRemindersErrorSelector.mockClear();
  });

  it('does not trigger fetch if no needed data', () => {
    const testRenderer = renderer.create(<UseRemindersDataComponent />);
    const testInstance = testRenderer.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findByProps({"data-cy": "refresh"});
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    expect(mockGetReminders).toBeCalledTimes(0);
  });

  it('shows loading, fetches data', async () => {
    let testRenderer: any;
    act(() => {
      testRenderer = renderer.create(<UseRemindersDataComponent habit={1} />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});
    expect(mockGetReminders).toBeCalledTimes(1);

    mockRemindersSelector.mockReturnValueOnce({ data: 1 });
    await act(async () => {
      testRenderer.update(<UseRemindersDataComponent habit={1} />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);

    // Rerender if data has changed
    mockRemindersSelector.mockReturnValueOnce({ data: 2 });
    await act(async () => {
      testRenderer.update(<UseRemindersDataComponent habit={2} />);
    });
   // expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});

    await act(async () => {
      testRenderer.update(<UseRemindersDataComponent habit={2} />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
  });

  it('returns error and refetches the data on refresh button click', async () => {
    mockRemindersErrorSelector.mockReturnValue('Error');
    let testRenderer: any;
    await act(() => {
      testRenderer = renderer.create(<UseRemindersDataComponent habit={1} />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "error"});
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    const refresh = testInstance.findByProps({"data-cy": "refresh"});
    expect(mockGetReminders).toBeCalledTimes(1);

    mockRemindersErrorSelector.mockReturnValue(undefined);
    mockRemindersSelector.mockReturnValue({ data: 1 });

    refresh.props.onPress();

    await act(async () => {
      testRenderer.update(<UseRemindersDataComponent habit={1} />);
    });

    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    testInstance.findByProps({"data-cy": "data"});
    expect(mockGetReminders).toBeCalledTimes(2);
  });
});

