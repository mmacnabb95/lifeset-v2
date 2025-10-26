/* eslint-disable prettier/prettier */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import usePublishedWorkoutsData from '../usePublishedWorkoutsData.hook';
import '@testing-library/jest-dom/extend-expect';
import { Pressable, View } from 'react-native';

type MockSelectorCallback = () => any;

const mockDispatch = jest.fn((f: any) => Promise.resolve(f));
let mockUseDispatch: any;
let mockUseSelector: any;
let mockGetPublishedWorkouts: any;
let mockPublishedWorkoutsSelector: any;
let mockPublishedWorkoutsErrorSelector: any;

jest.mock('../collection-slice', () => {
  mockGetPublishedWorkouts = jest.fn(() => Promise.resolve());
  mockPublishedWorkoutsSelector = jest.fn();
  mockPublishedWorkoutsErrorSelector = jest.fn();

  return {
    __esModule: true,
    default: jest.fn(),
    clearPublishedWorkoutItems: jest.fn(),
    getPublishedWorkouts: mockGetPublishedWorkouts,
    publishedWorkoutsSelector: mockPublishedWorkoutsSelector,
    publishedWorkoutsErrorSelector: mockPublishedWorkoutsErrorSelector,
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

const UsePublishedWorkoutsDataComponent = () => {
  const { data, error, loading, refresh } = usePublishedWorkoutsData();

  return (
    <View>
      {loading && <View data-cy="loading">Loading</View>}
      {error && <View data-cy="error">Error</View>}
      {data && <View data-cy="data">Data</View>}
      <Pressable data-cy="refresh" onPress={refresh}>Refresh</Pressable>
    </View>
  );
};

describe('usePublishedWorkoutsData.hook', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockGetPublishedWorkouts.mockClear();
    mockPublishedWorkoutsSelector.mockClear();
    mockPublishedWorkoutsErrorSelector.mockClear();
  });

  it('shows loading, fetches data', async () => {
    let testRenderer: any;
    act(() => {
      testRenderer = renderer.create(<UsePublishedWorkoutsDataComponent />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});
    expect(mockGetPublishedWorkouts).toBeCalledTimes(1);

    mockPublishedWorkoutsSelector.mockReturnValueOnce({ data: 1 });
    await act(async () => {
      testRenderer.update(<UsePublishedWorkoutsDataComponent />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);

    // Rerender if data has changed
    mockPublishedWorkoutsSelector.mockReturnValueOnce({ data: 2 });
    await act(async () => {
      testRenderer.update(<UsePublishedWorkoutsDataComponent />);
    });
   // expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});

    await act(async () => {
      testRenderer.update(<UsePublishedWorkoutsDataComponent />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
  });

  it('returns error and refetches the data on refresh button click', async () => {
    mockPublishedWorkoutsErrorSelector.mockReturnValue('Error');
    let testRenderer: any;
    await act(() => {
      testRenderer = renderer.create(<UsePublishedWorkoutsDataComponent />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "error"});
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    const refresh = testInstance.findByProps({"data-cy": "refresh"});
    expect(mockGetPublishedWorkouts).toBeCalledTimes(1);

    mockPublishedWorkoutsErrorSelector.mockReturnValue(undefined);
    mockPublishedWorkoutsSelector.mockReturnValue({ data: 1 });

    refresh.props.onPress();

    await act(async () => {
      testRenderer.update(<UsePublishedWorkoutsDataComponent />);
    });

    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    testInstance.findByProps({"data-cy": "data"});
    expect(mockGetPublishedWorkouts).toBeCalledTimes(2);
  });
});

