/* eslint-disable prettier/prettier */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import useAllUserHabitPacksData from '../useAllUserHabitPacksData.hook';
import '@testing-library/jest-dom/extend-expect';
import { Pressable, View } from 'react-native';

type MockSelectorCallback = () => any;

const mockDispatch = jest.fn((f: any) => Promise.resolve(f));
let mockUseDispatch: any;
let mockUseSelector: any;
let mockGetAllUserHabitPacks: any;
let mockAllUserHabitPacksSelector: any;
let mockAllUserHabitPacksErrorSelector: any;

jest.mock('../collection-slice', () => {
  mockGetAllUserHabitPacks = jest.fn(() => Promise.resolve());
  mockAllUserHabitPacksSelector = jest.fn();
  mockAllUserHabitPacksErrorSelector = jest.fn();

  return {
    __esModule: true,
    default: jest.fn(),
    clearAllUserHabitPackItems: jest.fn(),
    getAllUserHabitPacks: mockGetAllUserHabitPacks,
    allUserHabitPacksSelector: mockAllUserHabitPacksSelector,
    allUserHabitPacksErrorSelector: mockAllUserHabitPacksErrorSelector,
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

const UseAllUserHabitPacksDataComponent = () => {
  const { data, error, loading, refresh } = useAllUserHabitPacksData();

  return (
    <View>
      {loading && <View data-cy="loading">Loading</View>}
      {error && <View data-cy="error">Error</View>}
      {data && <View data-cy="data">Data</View>}
      <Pressable data-cy="refresh" onPress={refresh}>Refresh</Pressable>
    </View>
  );
};

describe('useAllUserHabitPacksData.hook', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockGetAllUserHabitPacks.mockClear();
    mockAllUserHabitPacksSelector.mockClear();
    mockAllUserHabitPacksErrorSelector.mockClear();
  });

  it('shows loading, fetches data', async () => {
    let testRenderer: any;
    act(() => {
      testRenderer = renderer.create(<UseAllUserHabitPacksDataComponent />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});
    expect(mockGetAllUserHabitPacks).toBeCalledTimes(1);

    mockAllUserHabitPacksSelector.mockReturnValueOnce({ data: 1 });
    await act(async () => {
      testRenderer.update(<UseAllUserHabitPacksDataComponent />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);

    // Rerender if data has changed
    mockAllUserHabitPacksSelector.mockReturnValueOnce({ data: 2 });
    await act(async () => {
      testRenderer.update(<UseAllUserHabitPacksDataComponent />);
    });
   // expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});

    await act(async () => {
      testRenderer.update(<UseAllUserHabitPacksDataComponent />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
  });

  it('returns error and refetches the data on refresh button click', async () => {
    mockAllUserHabitPacksErrorSelector.mockReturnValue('Error');
    let testRenderer: any;
    await act(() => {
      testRenderer = renderer.create(<UseAllUserHabitPacksDataComponent />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "error"});
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    const refresh = testInstance.findByProps({"data-cy": "refresh"});
    expect(mockGetAllUserHabitPacks).toBeCalledTimes(1);

    mockAllUserHabitPacksErrorSelector.mockReturnValue(undefined);
    mockAllUserHabitPacksSelector.mockReturnValue({ data: 1 });

    refresh.props.onPress();

    await act(async () => {
      testRenderer.update(<UseAllUserHabitPacksDataComponent />);
    });

    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    testInstance.findByProps({"data-cy": "data"});
    expect(mockGetAllUserHabitPacks).toBeCalledTimes(2);
  });
});

