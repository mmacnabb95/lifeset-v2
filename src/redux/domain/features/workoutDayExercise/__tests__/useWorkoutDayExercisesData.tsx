/* eslint-disable prettier/prettier */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import useWorkoutDayExercisesData from '../useWorkoutDayExercisesData.hook';
import '@testing-library/jest-dom/extend-expect';
import { Pressable, View } from 'react-native';

interface UseWorkoutDayExercisesDataProps {
  workoutday?: number;
};
type MockSelectorCallback = () => any;

const mockDispatch = jest.fn((f: any) => Promise.resolve(f));
let mockUseDispatch: any;
let mockUseSelector: any;
let mockGetWorkoutDayExercises: any;
let mockWorkoutDayExercisesSelector: any;
let mockWorkoutDayExercisesErrorSelector: any;

jest.mock('../collection-slice', () => {
  mockGetWorkoutDayExercises = jest.fn(() => Promise.resolve());
  mockWorkoutDayExercisesSelector = jest.fn();
  mockWorkoutDayExercisesErrorSelector = jest.fn();

  return {
    __esModule: true,
    default: jest.fn(),
    clearWorkoutDayExerciseItems: jest.fn(),
    getWorkoutDayExercises: mockGetWorkoutDayExercises,
    workoutDayExercisesSelector: mockWorkoutDayExercisesSelector,
    workoutDayExercisesErrorSelector: mockWorkoutDayExercisesErrorSelector,
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

const UseWorkoutDayExercisesDataComponent = (props: UseWorkoutDayExercisesDataProps) => {
  const { workoutday } = props;
  const { data, error, loading, refresh } = useWorkoutDayExercisesData(workoutday);

  return (
    <View>
      {loading && <View data-cy="loading">Loading</View>}
      {error && <View data-cy="error">Error</View>}
      {data && <View data-cy="data">Data</View>}
      <Pressable data-cy="refresh" onPress={refresh}>Refresh</Pressable>
    </View>
  );
};

describe('useWorkoutDayExercisesData.hook', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockGetWorkoutDayExercises.mockClear();
    mockWorkoutDayExercisesSelector.mockClear();
    mockWorkoutDayExercisesErrorSelector.mockClear();
  });

  it('does not trigger fetch if no needed data', () => {
    const testRenderer = renderer.create(<UseWorkoutDayExercisesDataComponent />);
    const testInstance = testRenderer.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findByProps({"data-cy": "refresh"});
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    expect(mockGetWorkoutDayExercises).toBeCalledTimes(0);
  });

  it('shows loading, fetches data', async () => {
    let testRenderer: any;
    act(() => {
      testRenderer = renderer.create(<UseWorkoutDayExercisesDataComponent workoutday={1} />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});
    expect(mockGetWorkoutDayExercises).toBeCalledTimes(1);

    mockWorkoutDayExercisesSelector.mockReturnValueOnce({ data: 1 });
    await act(async () => {
      testRenderer.update(<UseWorkoutDayExercisesDataComponent workoutday={1} />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);

    // Rerender if data has changed
    mockWorkoutDayExercisesSelector.mockReturnValueOnce({ data: 2 });
    await act(async () => {
      testRenderer.update(<UseWorkoutDayExercisesDataComponent workoutday={2} />);
    });
   // expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});

    await act(async () => {
      testRenderer.update(<UseWorkoutDayExercisesDataComponent workoutday={2} />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
  });

  it('returns error and refetches the data on refresh button click', async () => {
    mockWorkoutDayExercisesErrorSelector.mockReturnValue('Error');
    let testRenderer: any;
    await act(() => {
      testRenderer = renderer.create(<UseWorkoutDayExercisesDataComponent workoutday={1} />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "error"});
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    const refresh = testInstance.findByProps({"data-cy": "refresh"});
    expect(mockGetWorkoutDayExercises).toBeCalledTimes(1);

    mockWorkoutDayExercisesErrorSelector.mockReturnValue(undefined);
    mockWorkoutDayExercisesSelector.mockReturnValue({ data: 1 });

    refresh.props.onPress();

    await act(async () => {
      testRenderer.update(<UseWorkoutDayExercisesDataComponent workoutday={1} />);
    });

    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    testInstance.findByProps({"data-cy": "data"});
    expect(mockGetWorkoutDayExercises).toBeCalledTimes(2);
  });
});

