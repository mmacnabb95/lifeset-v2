/* eslint-disable prettier/prettier */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import useCompanyMediaKeysData from '../useCompanyMediaKeysData.hook';
import '@testing-library/jest-dom/extend-expect';
import { Pressable, View } from 'react-native';

type MockSelectorCallback = () => any;

const mockDispatch = jest.fn((f: any) => Promise.resolve(f));
let mockUseDispatch: any;
let mockUseSelector: any;
let mockGetCompanyMediaKeys: any;
let mockCompanyMediaKeysSelector: any;
let mockCompanyMediaKeysErrorSelector: any;

jest.mock('../collection-slice', () => {
  mockGetCompanyMediaKeys = jest.fn(() => Promise.resolve());
  mockCompanyMediaKeysSelector = jest.fn();
  mockCompanyMediaKeysErrorSelector = jest.fn();

  return {
    __esModule: true,
    default: jest.fn(),
    clearCompanyMediaKeyItems: jest.fn(),
    getCompanyMediaKeys: mockGetCompanyMediaKeys,
    companyMediaKeysSelector: mockCompanyMediaKeysSelector,
    companyMediaKeysErrorSelector: mockCompanyMediaKeysErrorSelector,
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

const UseCompanyMediaKeysDataComponent = () => {
  const { data, error, loading, refresh } = useCompanyMediaKeysData();

  return (
    <View>
      {loading && <View data-cy="loading">Loading</View>}
      {error && <View data-cy="error">Error</View>}
      {data && <View data-cy="data">Data</View>}
      <Pressable data-cy="refresh" onPress={refresh}>Refresh</Pressable>
    </View>
  );
};

describe('useCompanyMediaKeysData.hook', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockGetCompanyMediaKeys.mockClear();
    mockCompanyMediaKeysSelector.mockClear();
    mockCompanyMediaKeysErrorSelector.mockClear();
  });

  it('shows loading, fetches data', async () => {
    let testRenderer: any;
    act(() => {
      testRenderer = renderer.create(<UseCompanyMediaKeysDataComponent />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});
    expect(mockGetCompanyMediaKeys).toBeCalledTimes(1);

    mockCompanyMediaKeysSelector.mockReturnValueOnce({ data: 1 });
    await act(async () => {
      testRenderer.update(<UseCompanyMediaKeysDataComponent />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);

    // Rerender if data has changed
    mockCompanyMediaKeysSelector.mockReturnValueOnce({ data: 2 });
    await act(async () => {
      testRenderer.update(<UseCompanyMediaKeysDataComponent />);
    });
   // expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});

    await act(async () => {
      testRenderer.update(<UseCompanyMediaKeysDataComponent />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
  });

  it('returns error and refetches the data on refresh button click', async () => {
    mockCompanyMediaKeysErrorSelector.mockReturnValue('Error');
    let testRenderer: any;
    await act(() => {
      testRenderer = renderer.create(<UseCompanyMediaKeysDataComponent />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "error"});
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    const refresh = testInstance.findByProps({"data-cy": "refresh"});
    expect(mockGetCompanyMediaKeys).toBeCalledTimes(1);

    mockCompanyMediaKeysErrorSelector.mockReturnValue(undefined);
    mockCompanyMediaKeysSelector.mockReturnValue({ data: 1 });

    refresh.props.onPress();

    await act(async () => {
      testRenderer.update(<UseCompanyMediaKeysDataComponent />);
    });

    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    testInstance.findByProps({"data-cy": "data"});
    expect(mockGetCompanyMediaKeys).toBeCalledTimes(2);
  });
});

