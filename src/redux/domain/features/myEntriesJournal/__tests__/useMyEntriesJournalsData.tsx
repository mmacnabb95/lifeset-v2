/* eslint-disable prettier/prettier */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import useMyEntriesJournalsData from '../useMyEntriesJournalsData.hook';
import '@testing-library/jest-dom/extend-expect';
import { Pressable, View } from 'react-native';

interface UseMyEntriesJournalsDataProps {
  user?: number;
};
type MockSelectorCallback = () => any;

const mockDispatch = jest.fn((f: any) => Promise.resolve(f));
let mockUseDispatch: any;
let mockUseSelector: any;
let mockGetMyEntriesJournals: any;
let mockMyEntriesJournalsSelector: any;
let mockMyEntriesJournalsErrorSelector: any;

jest.mock('../collection-slice', () => {
  mockGetMyEntriesJournals = jest.fn(() => Promise.resolve());
  mockMyEntriesJournalsSelector = jest.fn();
  mockMyEntriesJournalsErrorSelector = jest.fn();

  return {
    __esModule: true,
    default: jest.fn(),
    clearMyEntriesJournalItems: jest.fn(),
    getMyEntriesJournals: mockGetMyEntriesJournals,
    myEntriesJournalsSelector: mockMyEntriesJournalsSelector,
    myEntriesJournalsErrorSelector: mockMyEntriesJournalsErrorSelector,
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

const UseMyEntriesJournalsDataComponent = (props: UseMyEntriesJournalsDataProps) => {
  const { user } = props;
  const { data, error, loading, refresh } = useMyEntriesJournalsData(user);

  return (
    <View>
      {loading && <View data-cy="loading">Loading</View>}
      {error && <View data-cy="error">Error</View>}
      {data && <View data-cy="data">Data</View>}
      <Pressable data-cy="refresh" onPress={refresh}>Refresh</Pressable>
    </View>
  );
};

describe('useMyEntriesJournalsData.hook', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockGetMyEntriesJournals.mockClear();
    mockMyEntriesJournalsSelector.mockClear();
    mockMyEntriesJournalsErrorSelector.mockClear();
  });

  it('does not trigger fetch if no needed data', () => {
    const testRenderer = renderer.create(<UseMyEntriesJournalsDataComponent />);
    const testInstance = testRenderer.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findByProps({"data-cy": "refresh"});
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    expect(mockGetMyEntriesJournals).toBeCalledTimes(0);
  });

  it('shows loading, fetches data', async () => {
    let testRenderer: any;
    act(() => {
      testRenderer = renderer.create(<UseMyEntriesJournalsDataComponent user={1} />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});
    expect(mockGetMyEntriesJournals).toBeCalledTimes(1);

    mockMyEntriesJournalsSelector.mockReturnValueOnce({ data: 1 });
    await act(async () => {
      testRenderer.update(<UseMyEntriesJournalsDataComponent user={1} />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);

    // Rerender if data has changed
    mockMyEntriesJournalsSelector.mockReturnValueOnce({ data: 2 });
    await act(async () => {
      testRenderer.update(<UseMyEntriesJournalsDataComponent user={2} />);
    });
   // expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});

    await act(async () => {
      testRenderer.update(<UseMyEntriesJournalsDataComponent user={2} />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
  });

  it('returns error and refetches the data on refresh button click', async () => {
    mockMyEntriesJournalsErrorSelector.mockReturnValue('Error');
    let testRenderer: any;
    await act(() => {
      testRenderer = renderer.create(<UseMyEntriesJournalsDataComponent user={1} />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "error"});
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    const refresh = testInstance.findByProps({"data-cy": "refresh"});
    expect(mockGetMyEntriesJournals).toBeCalledTimes(1);

    mockMyEntriesJournalsErrorSelector.mockReturnValue(undefined);
    mockMyEntriesJournalsSelector.mockReturnValue({ data: 1 });

    refresh.props.onPress();

    await act(async () => {
      testRenderer.update(<UseMyEntriesJournalsDataComponent user={1} />);
    });

    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    testInstance.findByProps({"data-cy": "data"});
    expect(mockGetMyEntriesJournals).toBeCalledTimes(2);
  });
});

