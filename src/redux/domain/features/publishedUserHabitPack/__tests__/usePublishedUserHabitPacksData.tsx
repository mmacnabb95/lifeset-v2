/* eslint-disable prettier/prettier */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import usePublishedUserHabitPacksData from '../usePublishedUserHabitPacksData.hook';
import '@testing-library/jest-dom/extend-expect';
import { Pressable, View } from 'react-native';

type MockSelectorCallback = () => any;

const mockDispatch = jest.fn((f: any) => Promise.resolve(f));
let mockUseDispatch: any;
let mockUseSelector: any;
let mockGetPublishedUserHabitPacks: any;
let mockPublishedUserHabitPacksSelector: any;
let mockPublishedUserHabitPacksErrorSelector: any;

jest.mock('../collection-slice', () => {
  mockGetPublishedUserHabitPacks = jest.fn(() => Promise.resolve());
  mockPublishedUserHabitPacksSelector = jest.fn();
  mockPublishedUserHabitPacksErrorSelector = jest.fn();

  return {
    __esModule: true,
    default: jest.fn(),
    clearPublishedUserHabitPackItems: jest.fn(),
    getPublishedUserHabitPacks: mockGetPublishedUserHabitPacks,
    publishedUserHabitPacksSelector: mockPublishedUserHabitPacksSelector,
    publishedUserHabitPacksErrorSelector: mockPublishedUserHabitPacksErrorSelector,
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

const UsePublishedUserHabitPacksDataComponent = () => {
  const { data, error, loading, refresh } = usePublishedUserHabitPacksData();

  return (
    <View>
      {loading && <View data-cy="loading">Loading</View>}
      {error && <View data-cy="error">Error</View>}
      {data && <View data-cy="data">Data</View>}
      <Pressable data-cy="refresh" onPress={refresh}>Refresh</Pressable>
    </View>
  );
};

describe('usePublishedUserHabitPacksData.hook', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockGetPublishedUserHabitPacks.mockClear();
    mockPublishedUserHabitPacksSelector.mockClear();
    mockPublishedUserHabitPacksErrorSelector.mockClear();
  });

  it('shows loading, fetches data', async () => {
    let testRenderer: any;
    act(() => {
      testRenderer = renderer.create(<UsePublishedUserHabitPacksDataComponent />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});
    expect(mockGetPublishedUserHabitPacks).toBeCalledTimes(1);

    mockPublishedUserHabitPacksSelector.mockReturnValueOnce({ data: 1 });
    await act(async () => {
      testRenderer.update(<UsePublishedUserHabitPacksDataComponent />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);

    // Rerender if data has changed
    mockPublishedUserHabitPacksSelector.mockReturnValueOnce({ data: 2 });
    await act(async () => {
      testRenderer.update(<UsePublishedUserHabitPacksDataComponent />);
    });
   // expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});

    await act(async () => {
      testRenderer.update(<UsePublishedUserHabitPacksDataComponent />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
  });

  it('returns error and refetches the data on refresh button click', async () => {
    mockPublishedUserHabitPacksErrorSelector.mockReturnValue('Error');
    let testRenderer: any;
    await act(() => {
      testRenderer = renderer.create(<UsePublishedUserHabitPacksDataComponent />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "error"});
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    const refresh = testInstance.findByProps({"data-cy": "refresh"});
    expect(mockGetPublishedUserHabitPacks).toBeCalledTimes(1);

    mockPublishedUserHabitPacksErrorSelector.mockReturnValue(undefined);
    mockPublishedUserHabitPacksSelector.mockReturnValue({ data: 1 });

    refresh.props.onPress();

    await act(async () => {
      testRenderer.update(<UsePublishedUserHabitPacksDataComponent />);
    });

    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    testInstance.findByProps({"data-cy": "data"});
    expect(mockGetPublishedUserHabitPacks).toBeCalledTimes(2);
  });
});

