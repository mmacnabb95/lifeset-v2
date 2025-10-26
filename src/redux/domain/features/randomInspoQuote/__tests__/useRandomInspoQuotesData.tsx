/* eslint-disable prettier/prettier */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import useRandomInspoQuotesData from '../useRandomInspoQuotesData.hook';
import '@testing-library/jest-dom/extend-expect';
import { Pressable, View } from 'react-native';

type MockSelectorCallback = () => any;

const mockDispatch = jest.fn((f: any) => Promise.resolve(f));
let mockUseDispatch: any;
let mockUseSelector: any;
let mockGetRandomInspoQuotes: any;
let mockRandomInspoQuotesSelector: any;
let mockRandomInspoQuotesErrorSelector: any;

jest.mock('../collection-slice', () => {
  mockGetRandomInspoQuotes = jest.fn(() => Promise.resolve());
  mockRandomInspoQuotesSelector = jest.fn();
  mockRandomInspoQuotesErrorSelector = jest.fn();

  return {
    __esModule: true,
    default: jest.fn(),
    clearRandomInspoQuoteItems: jest.fn(),
    getRandomInspoQuotes: mockGetRandomInspoQuotes,
    randomInspoQuotesSelector: mockRandomInspoQuotesSelector,
    randomInspoQuotesErrorSelector: mockRandomInspoQuotesErrorSelector,
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

const UseRandomInspoQuotesDataComponent = () => {
  const { data, error, loading, refresh } = useRandomInspoQuotesData();

  return (
    <View>
      {loading && <View data-cy="loading">Loading</View>}
      {error && <View data-cy="error">Error</View>}
      {data && <View data-cy="data">Data</View>}
      <Pressable data-cy="refresh" onPress={refresh}>Refresh</Pressable>
    </View>
  );
};

describe('useRandomInspoQuotesData.hook', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockGetRandomInspoQuotes.mockClear();
    mockRandomInspoQuotesSelector.mockClear();
    mockRandomInspoQuotesErrorSelector.mockClear();
  });

  it('shows loading, fetches data', async () => {
    let testRenderer: any;
    act(() => {
      testRenderer = renderer.create(<UseRandomInspoQuotesDataComponent />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});
    expect(mockGetRandomInspoQuotes).toBeCalledTimes(1);

    mockRandomInspoQuotesSelector.mockReturnValueOnce({ data: 1 });
    await act(async () => {
      testRenderer.update(<UseRandomInspoQuotesDataComponent />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);

    // Rerender if data has changed
    mockRandomInspoQuotesSelector.mockReturnValueOnce({ data: 2 });
    await act(async () => {
      testRenderer.update(<UseRandomInspoQuotesDataComponent />);
    });
   // expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});

    await act(async () => {
      testRenderer.update(<UseRandomInspoQuotesDataComponent />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
  });

  it('returns error and refetches the data on refresh button click', async () => {
    mockRandomInspoQuotesErrorSelector.mockReturnValue('Error');
    let testRenderer: any;
    await act(() => {
      testRenderer = renderer.create(<UseRandomInspoQuotesDataComponent />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "error"});
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    const refresh = testInstance.findByProps({"data-cy": "refresh"});
    expect(mockGetRandomInspoQuotes).toBeCalledTimes(1);

    mockRandomInspoQuotesErrorSelector.mockReturnValue(undefined);
    mockRandomInspoQuotesSelector.mockReturnValue({ data: 1 });

    refresh.props.onPress();

    await act(async () => {
      testRenderer.update(<UseRandomInspoQuotesDataComponent />);
    });

    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    testInstance.findByProps({"data-cy": "data"});
    expect(mockGetRandomInspoQuotes).toBeCalledTimes(2);
  });
});

