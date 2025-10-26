/* eslint-disable prettier/prettier */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import useExerciseMediaKeysData from '../useExerciseMediaKeysData.hook';
import '@testing-library/jest-dom/extend-expect';
import { Pressable, View } from 'react-native';

type MockSelectorCallback = () => any;

const mockDispatch = jest.fn((f: any) => Promise.resolve(f));
let mockUseDispatch: any;
let mockUseSelector: any;
let mockGetExerciseMediaKeys: any;
let mockExerciseMediaKeysSelector: any;
let mockExerciseMediaKeysErrorSelector: any;

jest.mock('../collection-slice', () => {
  mockGetExerciseMediaKeys = jest.fn(() => Promise.resolve());
  mockExerciseMediaKeysSelector = jest.fn();
  mockExerciseMediaKeysErrorSelector = jest.fn();

  return {
    __esModule: true,
    default: jest.fn(),
    clearExerciseMediaKeyItems: jest.fn(),
    getExerciseMediaKeys: mockGetExerciseMediaKeys,
    exerciseMediaKeysSelector: mockExerciseMediaKeysSelector,
    exerciseMediaKeysErrorSelector: mockExerciseMediaKeysErrorSelector,
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

const UseExerciseMediaKeysDataComponent = () => {
  const { data, error, loading, refresh } = useExerciseMediaKeysData();

  return (
    <View>
      {loading && <View data-cy="loading">Loading</View>}
      {error && <View data-cy="error">Error</View>}
      {data && <View data-cy="data">Data</View>}
      <Pressable data-cy="refresh" onPress={refresh}>Refresh</Pressable>
    </View>
  );
};

describe('useExerciseMediaKeysData.hook', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockGetExerciseMediaKeys.mockClear();
    mockExerciseMediaKeysSelector.mockClear();
    mockExerciseMediaKeysErrorSelector.mockClear();
  });

  it('shows loading, fetches data', async () => {
    let testRenderer: any;
    act(() => {
      testRenderer = renderer.create(<UseExerciseMediaKeysDataComponent />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});
    expect(mockGetExerciseMediaKeys).toBeCalledTimes(1);

    mockExerciseMediaKeysSelector.mockReturnValueOnce({ data: 1 });
    await act(async () => {
      testRenderer.update(<UseExerciseMediaKeysDataComponent />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);

    // Rerender if data has changed
    mockExerciseMediaKeysSelector.mockReturnValueOnce({ data: 2 });
    await act(async () => {
      testRenderer.update(<UseExerciseMediaKeysDataComponent />);
    });
   // expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});

    await act(async () => {
      testRenderer.update(<UseExerciseMediaKeysDataComponent />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
  });

  it('returns error and refetches the data on refresh button click', async () => {
    mockExerciseMediaKeysErrorSelector.mockReturnValue('Error');
    let testRenderer: any;
    await act(() => {
      testRenderer = renderer.create(<UseExerciseMediaKeysDataComponent />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "error"});
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    const refresh = testInstance.findByProps({"data-cy": "refresh"});
    expect(mockGetExerciseMediaKeys).toBeCalledTimes(1);

    mockExerciseMediaKeysErrorSelector.mockReturnValue(undefined);
    mockExerciseMediaKeysSelector.mockReturnValue({ data: 1 });

    refresh.props.onPress();

    await act(async () => {
      testRenderer.update(<UseExerciseMediaKeysDataComponent />);
    });

    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    testInstance.findByProps({"data-cy": "data"});
    expect(mockGetExerciseMediaKeys).toBeCalledTimes(2);
  });
});

