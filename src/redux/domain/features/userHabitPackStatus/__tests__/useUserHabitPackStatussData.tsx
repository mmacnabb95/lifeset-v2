/* eslint-disable prettier/prettier */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import useUserHabitPackStatussData from '../useUserHabitPackStatussData.hook';
import '@testing-library/jest-dom/extend-expect';
import { Pressable, View } from 'react-native';

type MockSelectorCallback = () => any;

const mockDispatch = jest.fn((f: any) => Promise.resolve(f));
let mockUseDispatch: any;
let mockUseSelector: any;
let mockGetUserHabitPackStatuss: any;
let mockUserHabitPackStatussSelector: any;
let mockUserHabitPackStatussErrorSelector: any;

jest.mock('../collection-slice', () => {
  mockGetUserHabitPackStatuss = jest.fn(() => Promise.resolve());
  mockUserHabitPackStatussSelector = jest.fn();
  mockUserHabitPackStatussErrorSelector = jest.fn();

  return {
    __esModule: true,
    default: jest.fn(),
    clearUserHabitPackStatusItems: jest.fn(),
    getUserHabitPackStatuss: mockGetUserHabitPackStatuss,
    userHabitPackStatussSelector: mockUserHabitPackStatussSelector,
    userHabitPackStatussErrorSelector: mockUserHabitPackStatussErrorSelector,
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

const UseUserHabitPackStatussDataComponent = () => {
  const { data, error, loading, refresh } = useUserHabitPackStatussData();

  return (
    <View>
      {loading && <View data-cy="loading">Loading</View>}
      {error && <View data-cy="error">Error</View>}
      {data && <View data-cy="data">Data</View>}
      <Pressable data-cy="refresh" onPress={refresh}>Refresh</Pressable>
    </View>
  );
};

describe('useUserHabitPackStatussData.hook', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockGetUserHabitPackStatuss.mockClear();
    mockUserHabitPackStatussSelector.mockClear();
    mockUserHabitPackStatussErrorSelector.mockClear();
  });

  it('shows loading, fetches data', async () => {
    let testRenderer: any;
    act(() => {
      testRenderer = renderer.create(<UseUserHabitPackStatussDataComponent />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});
    expect(mockGetUserHabitPackStatuss).toBeCalledTimes(1);

    mockUserHabitPackStatussSelector.mockReturnValueOnce({ data: 1 });
    await act(async () => {
      testRenderer.update(<UseUserHabitPackStatussDataComponent />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);

    // Rerender if data has changed
    mockUserHabitPackStatussSelector.mockReturnValueOnce({ data: 2 });
    await act(async () => {
      testRenderer.update(<UseUserHabitPackStatussDataComponent />);
    });
   // expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});

    await act(async () => {
      testRenderer.update(<UseUserHabitPackStatussDataComponent />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
  });

  it('returns error and refetches the data on refresh button click', async () => {
    mockUserHabitPackStatussErrorSelector.mockReturnValue('Error');
    let testRenderer: any;
    await act(() => {
      testRenderer = renderer.create(<UseUserHabitPackStatussDataComponent />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "error"});
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    const refresh = testInstance.findByProps({"data-cy": "refresh"});
    expect(mockGetUserHabitPackStatuss).toBeCalledTimes(1);

    mockUserHabitPackStatussErrorSelector.mockReturnValue(undefined);
    mockUserHabitPackStatussSelector.mockReturnValue({ data: 1 });

    refresh.props.onPress();

    await act(async () => {
      testRenderer.update(<UseUserHabitPackStatussDataComponent />);
    });

    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    testInstance.findByProps({"data-cy": "data"});
    expect(mockGetUserHabitPackStatuss).toBeCalledTimes(2);
  });
});

