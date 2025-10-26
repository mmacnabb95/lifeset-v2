/* eslint-disable prettier/prettier */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import useStreakLeaderBoardsData from '../useStreakLeaderBoardsData.hook';
import '@testing-library/jest-dom/extend-expect';
import { Pressable, View } from 'react-native';

interface UseStreakLeaderBoardsDataProps {
  company?: number;
};
type MockSelectorCallback = () => any;

const mockDispatch = jest.fn((f: any) => Promise.resolve(f));
let mockUseDispatch: any;
let mockUseSelector: any;
let mockGetStreakLeaderBoards: any;
let mockStreakLeaderBoardsSelector: any;
let mockStreakLeaderBoardsErrorSelector: any;

jest.mock('../collection-slice', () => {
  mockGetStreakLeaderBoards = jest.fn(() => Promise.resolve());
  mockStreakLeaderBoardsSelector = jest.fn();
  mockStreakLeaderBoardsErrorSelector = jest.fn();

  return {
    __esModule: true,
    default: jest.fn(),
    clearStreakLeaderBoardItems: jest.fn(),
    getStreakLeaderBoards: mockGetStreakLeaderBoards,
    streakLeaderBoardsSelector: mockStreakLeaderBoardsSelector,
    streakLeaderBoardsErrorSelector: mockStreakLeaderBoardsErrorSelector,
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

const UseStreakLeaderBoardsDataComponent = (props: UseStreakLeaderBoardsDataProps) => {
  const { company } = props;
  const { data, error, loading, refresh } = useStreakLeaderBoardsData(company);

  return (
    <View>
      {loading && <View data-cy="loading">Loading</View>}
      {error && <View data-cy="error">Error</View>}
      {data && <View data-cy="data">Data</View>}
      <Pressable data-cy="refresh" onPress={refresh}>Refresh</Pressable>
    </View>
  );
};

describe('useStreakLeaderBoardsData.hook', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockGetStreakLeaderBoards.mockClear();
    mockStreakLeaderBoardsSelector.mockClear();
    mockStreakLeaderBoardsErrorSelector.mockClear();
  });

  it('does not trigger fetch if no needed data', () => {
    const testRenderer = renderer.create(<UseStreakLeaderBoardsDataComponent />);
    const testInstance = testRenderer.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findByProps({"data-cy": "refresh"});
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    expect(mockGetStreakLeaderBoards).toBeCalledTimes(0);
  });

  it('shows loading, fetches data', async () => {
    let testRenderer: any;
    act(() => {
      testRenderer = renderer.create(<UseStreakLeaderBoardsDataComponent company={1} />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});
    expect(mockGetStreakLeaderBoards).toBeCalledTimes(1);

    mockStreakLeaderBoardsSelector.mockReturnValueOnce({ data: 1 });
    await act(async () => {
      testRenderer.update(<UseStreakLeaderBoardsDataComponent company={1} />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);

    // Rerender if data has changed
    mockStreakLeaderBoardsSelector.mockReturnValueOnce({ data: 2 });
    await act(async () => {
      testRenderer.update(<UseStreakLeaderBoardsDataComponent company={2} />);
    });
   // expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});

    await act(async () => {
      testRenderer.update(<UseStreakLeaderBoardsDataComponent company={2} />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
  });

  it('returns error and refetches the data on refresh button click', async () => {
    mockStreakLeaderBoardsErrorSelector.mockReturnValue('Error');
    let testRenderer: any;
    await act(() => {
      testRenderer = renderer.create(<UseStreakLeaderBoardsDataComponent company={1} />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "error"});
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    const refresh = testInstance.findByProps({"data-cy": "refresh"});
    expect(mockGetStreakLeaderBoards).toBeCalledTimes(1);

    mockStreakLeaderBoardsErrorSelector.mockReturnValue(undefined);
    mockStreakLeaderBoardsSelector.mockReturnValue({ data: 1 });

    refresh.props.onPress();

    await act(async () => {
      testRenderer.update(<UseStreakLeaderBoardsDataComponent company={1} />);
    });

    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    testInstance.findByProps({"data-cy": "data"});
    expect(mockGetStreakLeaderBoards).toBeCalledTimes(2);
  });
});

