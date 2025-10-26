/* eslint-disable prettier/prettier */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import useInspoQuotesData from '../useInspoQuotesData.hook';
import '@testing-library/jest-dom/extend-expect';
import { Pressable, View } from 'react-native';

type MockSelectorCallback = () => any;

const mockDispatch = jest.fn((f: any) => Promise.resolve(f));
let mockUseDispatch: any;
let mockUseSelector: any;
let mockGetInspoQuotes: any;
let mockInspoQuotesSelector: any;
let mockInspoQuotesErrorSelector: any;

jest.mock('../collection-slice', () => {
  mockGetInspoQuotes = jest.fn(() => Promise.resolve());
  mockInspoQuotesSelector = jest.fn();
  mockInspoQuotesErrorSelector = jest.fn();

  return {
    __esModule: true,
    default: jest.fn(),
    clearInspoQuoteItems: jest.fn(),
    getInspoQuotes: mockGetInspoQuotes,
    inspoQuotesSelector: mockInspoQuotesSelector,
    inspoQuotesErrorSelector: mockInspoQuotesErrorSelector,
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

const UseInspoQuotesDataComponent = () => {
  const { data, error, loading, refresh } = useInspoQuotesData();

  return (
    <View>
      {loading && <View data-cy="loading">Loading</View>}
      {error && <View data-cy="error">Error</View>}
      {data && <View data-cy="data">Data</View>}
      <Pressable data-cy="refresh" onPress={refresh}>Refresh</Pressable>
    </View>
  );
};

describe('useInspoQuotesData.hook', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockGetInspoQuotes.mockClear();
    mockInspoQuotesSelector.mockClear();
    mockInspoQuotesErrorSelector.mockClear();
  });

  it('shows loading, fetches data', async () => {
    let testRenderer: any;
    act(() => {
      testRenderer = renderer.create(<UseInspoQuotesDataComponent />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});
    expect(mockGetInspoQuotes).toBeCalledTimes(1);

    mockInspoQuotesSelector.mockReturnValueOnce({ data: 1 });
    await act(async () => {
      testRenderer.update(<UseInspoQuotesDataComponent />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);

    // Rerender if data has changed
    mockInspoQuotesSelector.mockReturnValueOnce({ data: 2 });
    await act(async () => {
      testRenderer.update(<UseInspoQuotesDataComponent />);
    });
   // expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});

    await act(async () => {
      testRenderer.update(<UseInspoQuotesDataComponent />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
  });

  it('returns error and refetches the data on refresh button click', async () => {
    mockInspoQuotesErrorSelector.mockReturnValue('Error');
    let testRenderer: any;
    await act(() => {
      testRenderer = renderer.create(<UseInspoQuotesDataComponent />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "error"});
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    const refresh = testInstance.findByProps({"data-cy": "refresh"});
    expect(mockGetInspoQuotes).toBeCalledTimes(1);

    mockInspoQuotesErrorSelector.mockReturnValue(undefined);
    mockInspoQuotesSelector.mockReturnValue({ data: 1 });

    refresh.props.onPress();

    await act(async () => {
      testRenderer.update(<UseInspoQuotesDataComponent />);
    });

    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    testInstance.findByProps({"data-cy": "data"});
    expect(mockGetInspoQuotes).toBeCalledTimes(2);
  });
});

