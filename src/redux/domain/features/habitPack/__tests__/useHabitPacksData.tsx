/* eslint-disable prettier/prettier */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import useHabitPacksData from '../useHabitPacksData.hook';
import '@testing-library/jest-dom/extend-expect';
import { Pressable, View } from 'react-native';

interface UseHabitPacksDataProps {
  company?: number;
};
type MockSelectorCallback = () => any;

const mockDispatch = jest.fn((f: any) => Promise.resolve(f));
let mockUseDispatch: any;
let mockUseSelector: any;
let mockGetHabitPacks: any;
let mockHabitPacksSelector: any;
let mockHabitPacksErrorSelector: any;

jest.mock('../collection-slice', () => {
  mockGetHabitPacks = jest.fn(() => Promise.resolve());
  mockHabitPacksSelector = jest.fn();
  mockHabitPacksErrorSelector = jest.fn();

  return {
    __esModule: true,
    default: jest.fn(),
    clearHabitPackItems: jest.fn(),
    getHabitPacks: mockGetHabitPacks,
    habitPacksSelector: mockHabitPacksSelector,
    habitPacksErrorSelector: mockHabitPacksErrorSelector,
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

const UseHabitPacksDataComponent = (props: UseHabitPacksDataProps) => {
  const { company } = props;
  const { data, error, loading, refresh } = useHabitPacksData(company);

  return (
    <View>
      {loading && <View data-cy="loading">Loading</View>}
      {error && <View data-cy="error">Error</View>}
      {data && <View data-cy="data">Data</View>}
      <Pressable data-cy="refresh" onPress={refresh}>Refresh</Pressable>
    </View>
  );
};

describe('useHabitPacksData.hook', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockGetHabitPacks.mockClear();
    mockHabitPacksSelector.mockClear();
    mockHabitPacksErrorSelector.mockClear();
  });

  it('does not trigger fetch if no needed data', () => {
    const testRenderer = renderer.create(<UseHabitPacksDataComponent />);
    const testInstance = testRenderer.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findByProps({"data-cy": "refresh"});
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    expect(mockGetHabitPacks).toBeCalledTimes(0);
  });

  it('shows loading, fetches data', async () => {
    let testRenderer: any;
    act(() => {
      testRenderer = renderer.create(<UseHabitPacksDataComponent company={1} />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});
    expect(mockGetHabitPacks).toBeCalledTimes(1);

    mockHabitPacksSelector.mockReturnValueOnce({ data: 1 });
    await act(async () => {
      testRenderer.update(<UseHabitPacksDataComponent company={1} />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);

    // Rerender if data has changed
    mockHabitPacksSelector.mockReturnValueOnce({ data: 2 });
    await act(async () => {
      testRenderer.update(<UseHabitPacksDataComponent company={2} />);
    });
   // expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});

    await act(async () => {
      testRenderer.update(<UseHabitPacksDataComponent company={2} />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
  });

  it('returns error and refetches the data on refresh button click', async () => {
    mockHabitPacksErrorSelector.mockReturnValue('Error');
    let testRenderer: any;
    await act(() => {
      testRenderer = renderer.create(<UseHabitPacksDataComponent company={1} />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "error"});
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    const refresh = testInstance.findByProps({"data-cy": "refresh"});
    expect(mockGetHabitPacks).toBeCalledTimes(1);

    mockHabitPacksErrorSelector.mockReturnValue(undefined);
    mockHabitPacksSelector.mockReturnValue({ data: 1 });

    refresh.props.onPress();

    await act(async () => {
      testRenderer.update(<UseHabitPacksDataComponent company={1} />);
    });

    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    testInstance.findByProps({"data-cy": "data"});
    expect(mockGetHabitPacks).toBeCalledTimes(2);
  });
});

