/* eslint-disable prettier/prettier */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import useUserWorkoutExerciseSetsData from '../useUserWorkoutExerciseSetsData.hook';
import '@testing-library/jest-dom/extend-expect';
import { Pressable, View } from 'react-native';

interface UseUserWorkoutExerciseSetsDataProps {
  userworkout?: number;
};
type MockSelectorCallback = () => any;

const mockDispatch = jest.fn((f: any) => Promise.resolve(f));
let mockUseDispatch: any;
let mockUseSelector: any;
let mockGetUserWorkoutExerciseSets: any;
let mockUserWorkoutExerciseSetsSelector: any;
let mockUserWorkoutExerciseSetsErrorSelector: any;

jest.mock('../collection-slice', () => {
  mockGetUserWorkoutExerciseSets = jest.fn(() => Promise.resolve());
  mockUserWorkoutExerciseSetsSelector = jest.fn();
  mockUserWorkoutExerciseSetsErrorSelector = jest.fn();

  return {
    __esModule: true,
    default: jest.fn(),
    clearUserWorkoutExerciseSetItems: jest.fn(),
    getUserWorkoutExerciseSets: mockGetUserWorkoutExerciseSets,
    userWorkoutExerciseSetsSelector: mockUserWorkoutExerciseSetsSelector,
    userWorkoutExerciseSetsErrorSelector: mockUserWorkoutExerciseSetsErrorSelector,
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

const UseUserWorkoutExerciseSetsDataComponent = (props: UseUserWorkoutExerciseSetsDataProps) => {
  const { userworkout } = props;
  const { data, error, loading, refresh } = useUserWorkoutExerciseSetsData(userworkout);

  return (
    <View>
      {loading && <View data-cy="loading">Loading</View>}
      {error && <View data-cy="error">Error</View>}
      {data && <View data-cy="data">Data</View>}
      <Pressable data-cy="refresh" onPress={refresh}>Refresh</Pressable>
    </View>
  );
};

describe('useUserWorkoutExerciseSetsData.hook', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockGetUserWorkoutExerciseSets.mockClear();
    mockUserWorkoutExerciseSetsSelector.mockClear();
    mockUserWorkoutExerciseSetsErrorSelector.mockClear();
  });

  it('does not trigger fetch if no needed data', () => {
    const testRenderer = renderer.create(<UseUserWorkoutExerciseSetsDataComponent />);
    const testInstance = testRenderer.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findByProps({"data-cy": "refresh"});
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    expect(mockGetUserWorkoutExerciseSets).toBeCalledTimes(0);
  });

  it('shows loading, fetches data', async () => {
    let testRenderer: any;
    act(() => {
      testRenderer = renderer.create(<UseUserWorkoutExerciseSetsDataComponent userworkout={1} />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});
    expect(mockGetUserWorkoutExerciseSets).toBeCalledTimes(1);

    mockUserWorkoutExerciseSetsSelector.mockReturnValueOnce({ data: 1 });
    await act(async () => {
      testRenderer.update(<UseUserWorkoutExerciseSetsDataComponent userworkout={1} />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);

    // Rerender if data has changed
    mockUserWorkoutExerciseSetsSelector.mockReturnValueOnce({ data: 2 });
    await act(async () => {
      testRenderer.update(<UseUserWorkoutExerciseSetsDataComponent userworkout={2} />);
    });
   // expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});

    await act(async () => {
      testRenderer.update(<UseUserWorkoutExerciseSetsDataComponent userworkout={2} />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
  });

  it('returns error and refetches the data on refresh button click', async () => {
    mockUserWorkoutExerciseSetsErrorSelector.mockReturnValue('Error');
    let testRenderer: any;
    await act(() => {
      testRenderer = renderer.create(<UseUserWorkoutExerciseSetsDataComponent userworkout={1} />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "error"});
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    const refresh = testInstance.findByProps({"data-cy": "refresh"});
    expect(mockGetUserWorkoutExerciseSets).toBeCalledTimes(1);

    mockUserWorkoutExerciseSetsErrorSelector.mockReturnValue(undefined);
    mockUserWorkoutExerciseSetsSelector.mockReturnValue({ data: 1 });

    refresh.props.onPress();

    await act(async () => {
      testRenderer.update(<UseUserWorkoutExerciseSetsDataComponent userworkout={1} />);
    });

    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    testInstance.findByProps({"data-cy": "data"});
    expect(mockGetUserWorkoutExerciseSets).toBeCalledTimes(2);
  });
});

