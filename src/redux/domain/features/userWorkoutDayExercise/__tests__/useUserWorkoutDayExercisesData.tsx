/* eslint-disable prettier/prettier */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import useUserWorkoutDayExercisesData from '../useUserWorkoutDayExercisesData.hook';
import '@testing-library/jest-dom/extend-expect';
import { Pressable, View } from 'react-native';

interface UseUserWorkoutDayExercisesDataProps {
  userworkout?: number;
};
type MockSelectorCallback = () => any;

const mockDispatch = jest.fn((f: any) => Promise.resolve(f));
let mockUseDispatch: any;
let mockUseSelector: any;
let mockGetUserWorkoutDayExercises: any;
let mockUserWorkoutDayExercisesSelector: any;
let mockUserWorkoutDayExercisesErrorSelector: any;

jest.mock('../collection-slice', () => {
  mockGetUserWorkoutDayExercises = jest.fn(() => Promise.resolve());
  mockUserWorkoutDayExercisesSelector = jest.fn();
  mockUserWorkoutDayExercisesErrorSelector = jest.fn();

  return {
    __esModule: true,
    default: jest.fn(),
    clearUserWorkoutDayExerciseItems: jest.fn(),
    getUserWorkoutDayExercises: mockGetUserWorkoutDayExercises,
    userWorkoutDayExercisesSelector: mockUserWorkoutDayExercisesSelector,
    userWorkoutDayExercisesErrorSelector: mockUserWorkoutDayExercisesErrorSelector,
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

const UseUserWorkoutDayExercisesDataComponent = (props: UseUserWorkoutDayExercisesDataProps) => {
  const { userworkout } = props;
  const { data, error, loading, refresh } = useUserWorkoutDayExercisesData(userworkout);

  return (
    <View>
      {loading && <View data-cy="loading">Loading</View>}
      {error && <View data-cy="error">Error</View>}
      {data && <View data-cy="data">Data</View>}
      <Pressable data-cy="refresh" onPress={refresh}>Refresh</Pressable>
    </View>
  );
};

describe('useUserWorkoutDayExercisesData.hook', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockGetUserWorkoutDayExercises.mockClear();
    mockUserWorkoutDayExercisesSelector.mockClear();
    mockUserWorkoutDayExercisesErrorSelector.mockClear();
  });

  it('does not trigger fetch if no needed data', () => {
    const testRenderer = renderer.create(<UseUserWorkoutDayExercisesDataComponent />);
    const testInstance = testRenderer.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findByProps({"data-cy": "refresh"});
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    expect(mockGetUserWorkoutDayExercises).toBeCalledTimes(0);
  });

  it('shows loading, fetches data', async () => {
    let testRenderer: any;
    act(() => {
      testRenderer = renderer.create(<UseUserWorkoutDayExercisesDataComponent userworkout={1} />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});
    expect(mockGetUserWorkoutDayExercises).toBeCalledTimes(1);

    mockUserWorkoutDayExercisesSelector.mockReturnValueOnce({ data: 1 });
    await act(async () => {
      testRenderer.update(<UseUserWorkoutDayExercisesDataComponent userworkout={1} />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);

    // Rerender if data has changed
    mockUserWorkoutDayExercisesSelector.mockReturnValueOnce({ data: 2 });
    await act(async () => {
      testRenderer.update(<UseUserWorkoutDayExercisesDataComponent userworkout={2} />);
    });
   // expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});

    await act(async () => {
      testRenderer.update(<UseUserWorkoutDayExercisesDataComponent userworkout={2} />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
  });

  it('returns error and refetches the data on refresh button click', async () => {
    mockUserWorkoutDayExercisesErrorSelector.mockReturnValue('Error');
    let testRenderer: any;
    await act(() => {
      testRenderer = renderer.create(<UseUserWorkoutDayExercisesDataComponent userworkout={1} />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "error"});
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    const refresh = testInstance.findByProps({"data-cy": "refresh"});
    expect(mockGetUserWorkoutDayExercises).toBeCalledTimes(1);

    mockUserWorkoutDayExercisesErrorSelector.mockReturnValue(undefined);
    mockUserWorkoutDayExercisesSelector.mockReturnValue({ data: 1 });

    refresh.props.onPress();

    await act(async () => {
      testRenderer.update(<UseUserWorkoutDayExercisesDataComponent userworkout={1} />);
    });

    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    testInstance.findByProps({"data-cy": "data"});
    expect(mockGetUserWorkoutDayExercises).toBeCalledTimes(2);
  });
});

