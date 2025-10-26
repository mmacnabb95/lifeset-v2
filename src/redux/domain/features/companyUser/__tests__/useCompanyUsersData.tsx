/* eslint-disable prettier/prettier */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import useCompanyUsersData from '../useCompanyUsersData.hook';
import '@testing-library/jest-dom/extend-expect';
import { Pressable, View } from 'react-native';

interface UseCompanyUsersDataProps {
  company?: number;
};
type MockSelectorCallback = () => any;

const mockDispatch = jest.fn((f: any) => Promise.resolve(f));
let mockUseDispatch: any;
let mockUseSelector: any;
let mockGetCompanyUsers: any;
let mockCompanyUsersSelector: any;
let mockCompanyUsersErrorSelector: any;

jest.mock('../collection-slice', () => {
  mockGetCompanyUsers = jest.fn(() => Promise.resolve());
  mockCompanyUsersSelector = jest.fn();
  mockCompanyUsersErrorSelector = jest.fn();

  return {
    __esModule: true,
    default: jest.fn(),
    clearCompanyUserItems: jest.fn(),
    getCompanyUsers: mockGetCompanyUsers,
    companyUsersSelector: mockCompanyUsersSelector,
    companyUsersErrorSelector: mockCompanyUsersErrorSelector,
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

const UseCompanyUsersDataComponent = (props: UseCompanyUsersDataProps) => {
  const { company } = props;
  const { data, error, loading, refresh } = useCompanyUsersData(company);

  return (
    <View>
      {loading && <View data-cy="loading">Loading</View>}
      {error && <View data-cy="error">Error</View>}
      {data && <View data-cy="data">Data</View>}
      <Pressable data-cy="refresh" onPress={refresh}>Refresh</Pressable>
    </View>
  );
};

describe('useCompanyUsersData.hook', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockGetCompanyUsers.mockClear();
    mockCompanyUsersSelector.mockClear();
    mockCompanyUsersErrorSelector.mockClear();
  });

  it('does not trigger fetch if no needed data', () => {
    const testRenderer = renderer.create(<UseCompanyUsersDataComponent />);
    const testInstance = testRenderer.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findByProps({"data-cy": "refresh"});
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    expect(mockGetCompanyUsers).toBeCalledTimes(0);
  });

  it('shows loading, fetches data', async () => {
    let testRenderer: any;
    act(() => {
      testRenderer = renderer.create(<UseCompanyUsersDataComponent company={1} />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});
    expect(mockGetCompanyUsers).toBeCalledTimes(1);

    mockCompanyUsersSelector.mockReturnValueOnce({ data: 1 });
    await act(async () => {
      testRenderer.update(<UseCompanyUsersDataComponent company={1} />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);

    // Rerender if data has changed
    mockCompanyUsersSelector.mockReturnValueOnce({ data: 2 });
    await act(async () => {
      testRenderer.update(<UseCompanyUsersDataComponent company={2} />);
    });
   // expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});

    await act(async () => {
      testRenderer.update(<UseCompanyUsersDataComponent company={2} />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
  });

  it('returns error and refetches the data on refresh button click', async () => {
    mockCompanyUsersErrorSelector.mockReturnValue('Error');
    let testRenderer: any;
    await act(() => {
      testRenderer = renderer.create(<UseCompanyUsersDataComponent company={1} />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "error"});
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    const refresh = testInstance.findByProps({"data-cy": "refresh"});
    expect(mockGetCompanyUsers).toBeCalledTimes(1);

    mockCompanyUsersErrorSelector.mockReturnValue(undefined);
    mockCompanyUsersSelector.mockReturnValue({ data: 1 });

    refresh.props.onPress();

    await act(async () => {
      testRenderer.update(<UseCompanyUsersDataComponent company={1} />);
    });

    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    testInstance.findByProps({"data-cy": "data"});
    expect(mockGetCompanyUsers).toBeCalledTimes(2);
  });
});

