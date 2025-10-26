/* eslint-disable prettier/prettier */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import useUserHabitPacksData from '../useUserHabitPacksData.hook';
import '@testing-library/jest-dom/extend-expect';
import { Pressable, View } from 'react-native';

interface UseUserHabitPacksDataProps {
  user?: number;
};
type MockSelectorCallback = () => any;

const mockDispatch = jest.fn((f: any) => Promise.resolve(f));
let mockUseDispatch: any;
let mockUseSelector: any;
let mockGetUserHabitPacks: any;
let mockUserHabitPacksSelector: any;
let mockUserHabitPacksErrorSelector: any;

jest.mock('../collection-slice', () => {
  mockGetUserHabitPacks = jest.fn(() => Promise.resolve());
  mockUserHabitPacksSelector = jest.fn();
  mockUserHabitPacksErrorSelector = jest.fn();

  return {
    __esModule: true,
    default: jest.fn(),
    clearUserHabitPackItems: jest.fn(),
    getUserHabitPacks: mockGetUserHabitPacks,
    userHabitPacksSelector: mockUserHabitPacksSelector,
    userHabitPacksErrorSelector: mockUserHabitPacksErrorSelector,
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

const UseUserHabitPacksDataComponent = (props: UseUserHabitPacksDataProps) => {
  const { user } = props;
  const { data, error, loading, refresh } = useUserHabitPacksData(user);

  return (
    <View>
      {loading && <View data-cy="loading">Loading</View>}
      {error && <View data-cy="error">Error</View>}
      {data && <View data-cy="data">Data</View>}
      <Pressable data-cy="refresh" onPress={refresh}>Refresh</Pressable>
    </View>
  );
};

describe('useUserHabitPacksData.hook', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockGetUserHabitPacks.mockClear();
    mockUserHabitPacksSelector.mockClear();
    mockUserHabitPacksErrorSelector.mockClear();
  });

  it('does not trigger fetch if no needed data', () => {
    const testRenderer = renderer.create(<UseUserHabitPacksDataComponent />);
    const testInstance = testRenderer.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findByProps({"data-cy": "refresh"});
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    expect(mockGetUserHabitPacks).toBeCalledTimes(0);
  });

  it('shows loading, fetches data', async () => {
    let testRenderer: any;
    act(() => {
      testRenderer = renderer.create(<UseUserHabitPacksDataComponent user={1} />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});
    expect(mockGetUserHabitPacks).toBeCalledTimes(1);

    mockUserHabitPacksSelector.mockReturnValueOnce({ data: 1 });
    await act(async () => {
      testRenderer.update(<UseUserHabitPacksDataComponent user={1} />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);

    // Rerender if data has changed
    mockUserHabitPacksSelector.mockReturnValueOnce({ data: 2 });
    await act(async () => {
      testRenderer.update(<UseUserHabitPacksDataComponent user={2} />);
    });
   // expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});

    await act(async () => {
      testRenderer.update(<UseUserHabitPacksDataComponent user={2} />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
  });

  it('returns error and refetches the data on refresh button click', async () => {
    mockUserHabitPacksErrorSelector.mockReturnValue('Error');
    let testRenderer: any;
    await act(() => {
      testRenderer = renderer.create(<UseUserHabitPacksDataComponent user={1} />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "error"});
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    const refresh = testInstance.findByProps({"data-cy": "refresh"});
    expect(mockGetUserHabitPacks).toBeCalledTimes(1);

    mockUserHabitPacksErrorSelector.mockReturnValue(undefined);
    mockUserHabitPacksSelector.mockReturnValue({ data: 1 });

    refresh.props.onPress();

    await act(async () => {
      testRenderer.update(<UseUserHabitPacksDataComponent user={1} />);
    });

    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    testInstance.findByProps({"data-cy": "data"});
    expect(mockGetUserHabitPacks).toBeCalledTimes(2);
  });
});

