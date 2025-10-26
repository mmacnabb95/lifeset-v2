/* eslint-disable prettier/prettier */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import useAllTimeStreaksData from '../useAllTimeStreaksData.hook';
import '@testing-library/jest-dom/extend-expect';
import { Pressable, View } from 'react-native';

interface UseAllTimeStreaksDataProps {
  user?: number;
};
type MockSelectorCallback = () => any;

const mockDispatch = jest.fn((f: any) => Promise.resolve(f));
let mockUseDispatch: any;
let mockUseSelector: any;
let mockGetAllTimeStreaks: any;
let mockAllTimeStreaksSelector: any;
let mockAllTimeStreaksErrorSelector: any;

jest.mock('../collection-slice', () => {
  mockGetAllTimeStreaks = jest.fn(() => Promise.resolve());
  mockAllTimeStreaksSelector = jest.fn();
  mockAllTimeStreaksErrorSelector = jest.fn();

  return {
    __esModule: true,
    default: jest.fn(),
    clearAllTimeStreakItems: jest.fn(),
    getAllTimeStreaks: mockGetAllTimeStreaks,
    allTimeStreaksSelector: mockAllTimeStreaksSelector,
    allTimeStreaksErrorSelector: mockAllTimeStreaksErrorSelector,
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

const UseAllTimeStreaksDataComponent = (props: UseAllTimeStreaksDataProps) => {
  const { user } = props;
  const { data, error, loading, refresh } = useAllTimeStreaksData(user);

  return (
    <View>
      {loading && <View data-cy="loading">Loading</View>}
      {error && <View data-cy="error">Error</View>}
      {data && <View data-cy="data">Data</View>}
      <Pressable data-cy="refresh" onPress={refresh}>Refresh</Pressable>
    </View>
  );
};

describe('useAllTimeStreaksData.hook', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockGetAllTimeStreaks.mockClear();
    mockAllTimeStreaksSelector.mockClear();
    mockAllTimeStreaksErrorSelector.mockClear();
  });

  it('does not trigger fetch if no needed data', () => {
    const testRenderer = renderer.create(<UseAllTimeStreaksDataComponent />);
    const testInstance = testRenderer.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findByProps({"data-cy": "refresh"});
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    expect(mockGetAllTimeStreaks).toBeCalledTimes(0);
  });

  it('shows loading, fetches data', async () => {
    let testRenderer: any;
    act(() => {
      testRenderer = renderer.create(<UseAllTimeStreaksDataComponent user={1} />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});
    expect(mockGetAllTimeStreaks).toBeCalledTimes(1);

    mockAllTimeStreaksSelector.mockReturnValueOnce({ data: 1 });
    await act(async () => {
      testRenderer.update(<UseAllTimeStreaksDataComponent user={1} />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);

    // Rerender if data has changed
    mockAllTimeStreaksSelector.mockReturnValueOnce({ data: 2 });
    await act(async () => {
      testRenderer.update(<UseAllTimeStreaksDataComponent user={2} />);
    });
   // expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});

    await act(async () => {
      testRenderer.update(<UseAllTimeStreaksDataComponent user={2} />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
  });

  it('returns error and refetches the data on refresh button click', async () => {
    mockAllTimeStreaksErrorSelector.mockReturnValue('Error');
    let testRenderer: any;
    await act(() => {
      testRenderer = renderer.create(<UseAllTimeStreaksDataComponent user={1} />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "error"});
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    const refresh = testInstance.findByProps({"data-cy": "refresh"});
    expect(mockGetAllTimeStreaks).toBeCalledTimes(1);

    mockAllTimeStreaksErrorSelector.mockReturnValue(undefined);
    mockAllTimeStreaksSelector.mockReturnValue({ data: 1 });

    refresh.props.onPress();

    await act(async () => {
      testRenderer.update(<UseAllTimeStreaksDataComponent user={1} />);
    });

    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    testInstance.findByProps({"data-cy": "data"});
    expect(mockGetAllTimeStreaks).toBeCalledTimes(2);
  });
});

