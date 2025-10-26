/* eslint-disable prettier/prettier */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import useWorkoutExerciseSetsData from '../useWorkoutExerciseSetsData.hook';
import '@testing-library/jest-dom/extend-expect';
import { Pressable, View } from 'react-native';

interface UseWorkoutExerciseSetsDataProps {
  workoutdayexercise?: number;
};
type MockSelectorCallback = () => any;

const mockDispatch = jest.fn((f: any) => Promise.resolve(f));
let mockUseDispatch: any;
let mockUseSelector: any;
let mockGetWorkoutExerciseSets: any;
let mockWorkoutExerciseSetsSelector: any;
let mockWorkoutExerciseSetsErrorSelector: any;

jest.mock('../collection-slice', () => {
  mockGetWorkoutExerciseSets = jest.fn(() => Promise.resolve());
  mockWorkoutExerciseSetsSelector = jest.fn();
  mockWorkoutExerciseSetsErrorSelector = jest.fn();

  return {
    __esModule: true,
    default: jest.fn(),
    clearWorkoutExerciseSetItems: jest.fn(),
    getWorkoutExerciseSets: mockGetWorkoutExerciseSets,
    workoutExerciseSetsSelector: mockWorkoutExerciseSetsSelector,
    workoutExerciseSetsErrorSelector: mockWorkoutExerciseSetsErrorSelector,
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

const UseWorkoutExerciseSetsDataComponent = (props: UseWorkoutExerciseSetsDataProps) => {
  const { workoutdayexercise } = props;
  const { data, error, loading, refresh } = useWorkoutExerciseSetsData(workoutdayexercise);

  return (
    <View>
      {loading && <View data-cy="loading">Loading</View>}
      {error && <View data-cy="error">Error</View>}
      {data && <View data-cy="data">Data</View>}
      <Pressable data-cy="refresh" onPress={refresh}>Refresh</Pressable>
    </View>
  );
};

describe('useWorkoutExerciseSetsData.hook', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockGetWorkoutExerciseSets.mockClear();
    mockWorkoutExerciseSetsSelector.mockClear();
    mockWorkoutExerciseSetsErrorSelector.mockClear();
  });

  it('does not trigger fetch if no needed data', () => {
    const testRenderer = renderer.create(<UseWorkoutExerciseSetsDataComponent />);
    const testInstance = testRenderer.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findByProps({"data-cy": "refresh"});
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    expect(mockGetWorkoutExerciseSets).toBeCalledTimes(0);
  });

  it('shows loading, fetches data', async () => {
    let testRenderer: any;
    act(() => {
      testRenderer = renderer.create(<UseWorkoutExerciseSetsDataComponent workoutdayexercise={1} />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});
    expect(mockGetWorkoutExerciseSets).toBeCalledTimes(1);

    mockWorkoutExerciseSetsSelector.mockReturnValueOnce({ data: 1 });
    await act(async () => {
      testRenderer.update(<UseWorkoutExerciseSetsDataComponent workoutdayexercise={1} />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);

    // Rerender if data has changed
    mockWorkoutExerciseSetsSelector.mockReturnValueOnce({ data: 2 });
    await act(async () => {
      testRenderer.update(<UseWorkoutExerciseSetsDataComponent workoutdayexercise={2} />);
    });
   // expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});

    await act(async () => {
      testRenderer.update(<UseWorkoutExerciseSetsDataComponent workoutdayexercise={2} />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
  });

  it('returns error and refetches the data on refresh button click', async () => {
    mockWorkoutExerciseSetsErrorSelector.mockReturnValue('Error');
    let testRenderer: any;
    await act(() => {
      testRenderer = renderer.create(<UseWorkoutExerciseSetsDataComponent workoutdayexercise={1} />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "error"});
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    const refresh = testInstance.findByProps({"data-cy": "refresh"});
    expect(mockGetWorkoutExerciseSets).toBeCalledTimes(1);

    mockWorkoutExerciseSetsErrorSelector.mockReturnValue(undefined);
    mockWorkoutExerciseSetsSelector.mockReturnValue({ data: 1 });

    refresh.props.onPress();

    await act(async () => {
      testRenderer.update(<UseWorkoutExerciseSetsDataComponent workoutdayexercise={1} />);
    });

    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    testInstance.findByProps({"data-cy": "data"});
    expect(mockGetWorkoutExerciseSets).toBeCalledTimes(2);
  });
});

