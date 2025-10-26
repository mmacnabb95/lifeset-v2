/* eslint-disable prettier/prettier */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import useHabitMediaKeysData from '../useHabitMediaKeysData.hook';
import '@testing-library/jest-dom/extend-expect';
import { Pressable, View } from 'react-native';

type MockSelectorCallback = () => any;

const mockDispatch = jest.fn((f: any) => Promise.resolve(f));
let mockUseDispatch: any;
let mockUseSelector: any;
let mockGetHabitMediaKeys: any;
let mockHabitMediaKeysSelector: any;
let mockHabitMediaKeysErrorSelector: any;

jest.mock('../collection-slice', () => {
  mockGetHabitMediaKeys = jest.fn(() => Promise.resolve());
  mockHabitMediaKeysSelector = jest.fn();
  mockHabitMediaKeysErrorSelector = jest.fn();

  return {
    __esModule: true,
    default: jest.fn(),
    clearHabitMediaKeyItems: jest.fn(),
    getHabitMediaKeys: mockGetHabitMediaKeys,
    habitMediaKeysSelector: mockHabitMediaKeysSelector,
    habitMediaKeysErrorSelector: mockHabitMediaKeysErrorSelector,
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

const UseHabitMediaKeysDataComponent = () => {
  const { data, error, loading, refresh } = useHabitMediaKeysData();

  return (
    <View>
      {loading && <View data-cy="loading">Loading</View>}
      {error && <View data-cy="error">Error</View>}
      {data && <View data-cy="data">Data</View>}
      <Pressable data-cy="refresh" onPress={refresh}>Refresh</Pressable>
    </View>
  );
};

describe('useHabitMediaKeysData.hook', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockGetHabitMediaKeys.mockClear();
    mockHabitMediaKeysSelector.mockClear();
    mockHabitMediaKeysErrorSelector.mockClear();
  });

  it('shows loading, fetches data', async () => {
    let testRenderer: any;
    act(() => {
      testRenderer = renderer.create(<UseHabitMediaKeysDataComponent />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});
    expect(mockGetHabitMediaKeys).toBeCalledTimes(1);

    mockHabitMediaKeysSelector.mockReturnValueOnce({ data: 1 });
    await act(async () => {
      testRenderer.update(<UseHabitMediaKeysDataComponent />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);

    // Rerender if data has changed
    mockHabitMediaKeysSelector.mockReturnValueOnce({ data: 2 });
    await act(async () => {
      testRenderer.update(<UseHabitMediaKeysDataComponent />);
    });
   // expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});

    await act(async () => {
      testRenderer.update(<UseHabitMediaKeysDataComponent />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
  });

  it('returns error and refetches the data on refresh button click', async () => {
    mockHabitMediaKeysErrorSelector.mockReturnValue('Error');
    let testRenderer: any;
    await act(() => {
      testRenderer = renderer.create(<UseHabitMediaKeysDataComponent />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "error"});
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    const refresh = testInstance.findByProps({"data-cy": "refresh"});
    expect(mockGetHabitMediaKeys).toBeCalledTimes(1);

    mockHabitMediaKeysErrorSelector.mockReturnValue(undefined);
    mockHabitMediaKeysSelector.mockReturnValue({ data: 1 });

    refresh.props.onPress();

    await act(async () => {
      testRenderer.update(<UseHabitMediaKeysDataComponent />);
    });

    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    testInstance.findByProps({"data-cy": "data"});
    expect(mockGetHabitMediaKeys).toBeCalledTimes(2);
  });
});

