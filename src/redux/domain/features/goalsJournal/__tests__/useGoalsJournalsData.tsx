/* eslint-disable prettier/prettier */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import useGoalsJournalsData from '../useGoalsJournalsData.hook';
import '@testing-library/jest-dom/extend-expect';
import { Pressable, View } from 'react-native';

interface UseGoalsJournalsDataProps {
  user?: number;
};
type MockSelectorCallback = () => any;

const mockDispatch = jest.fn((f: any) => Promise.resolve(f));
let mockUseDispatch: any;
let mockUseSelector: any;
let mockGetGoalsJournals: any;
let mockGoalsJournalsSelector: any;
let mockGoalsJournalsErrorSelector: any;

jest.mock('../collection-slice', () => {
  mockGetGoalsJournals = jest.fn(() => Promise.resolve());
  mockGoalsJournalsSelector = jest.fn();
  mockGoalsJournalsErrorSelector = jest.fn();

  return {
    __esModule: true,
    default: jest.fn(),
    clearGoalsJournalItems: jest.fn(),
    getGoalsJournals: mockGetGoalsJournals,
    goalsJournalsSelector: mockGoalsJournalsSelector,
    goalsJournalsErrorSelector: mockGoalsJournalsErrorSelector,
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

const UseGoalsJournalsDataComponent = (props: UseGoalsJournalsDataProps) => {
  const { user } = props;
  const { data, error, loading, refresh } = useGoalsJournalsData(user);

  return (
    <View>
      {loading && <View data-cy="loading">Loading</View>}
      {error && <View data-cy="error">Error</View>}
      {data && <View data-cy="data">Data</View>}
      <Pressable data-cy="refresh" onPress={refresh}>Refresh</Pressable>
    </View>
  );
};

describe('useGoalsJournalsData.hook', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockGetGoalsJournals.mockClear();
    mockGoalsJournalsSelector.mockClear();
    mockGoalsJournalsErrorSelector.mockClear();
  });

  it('does not trigger fetch if no needed data', () => {
    const testRenderer = renderer.create(<UseGoalsJournalsDataComponent />);
    const testInstance = testRenderer.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findByProps({"data-cy": "refresh"});
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    expect(mockGetGoalsJournals).toBeCalledTimes(0);
  });

  it('shows loading, fetches data', async () => {
    let testRenderer: any;
    act(() => {
      testRenderer = renderer.create(<UseGoalsJournalsDataComponent user={1} />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});
    expect(mockGetGoalsJournals).toBeCalledTimes(1);

    mockGoalsJournalsSelector.mockReturnValueOnce({ data: 1 });
    await act(async () => {
      testRenderer.update(<UseGoalsJournalsDataComponent user={1} />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);

    // Rerender if data has changed
    mockGoalsJournalsSelector.mockReturnValueOnce({ data: 2 });
    await act(async () => {
      testRenderer.update(<UseGoalsJournalsDataComponent user={2} />);
    });
   // expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});

    await act(async () => {
      testRenderer.update(<UseGoalsJournalsDataComponent user={2} />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
  });

  it('returns error and refetches the data on refresh button click', async () => {
    mockGoalsJournalsErrorSelector.mockReturnValue('Error');
    let testRenderer: any;
    await act(() => {
      testRenderer = renderer.create(<UseGoalsJournalsDataComponent user={1} />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "error"});
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    const refresh = testInstance.findByProps({"data-cy": "refresh"});
    expect(mockGetGoalsJournals).toBeCalledTimes(1);

    mockGoalsJournalsErrorSelector.mockReturnValue(undefined);
    mockGoalsJournalsSelector.mockReturnValue({ data: 1 });

    refresh.props.onPress();

    await act(async () => {
      testRenderer.update(<UseGoalsJournalsDataComponent user={1} />);
    });

    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    testInstance.findByProps({"data-cy": "data"});
    expect(mockGetGoalsJournals).toBeCalledTimes(2);
  });
});

