/* eslint-disable prettier/prettier */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import useAdminViewUsersData from '../useAdminViewUsersData.hook';
import '@testing-library/jest-dom/extend-expect';
import { Pressable, View } from 'react-native';

type MockSelectorCallback = () => any;

const mockDispatch = jest.fn((f: any) => Promise.resolve(f));
let mockUseDispatch: any;
let mockUseSelector: any;
let mockGetAdminViewUsers: any;
let mockAdminViewUsersSelector: any;
let mockAdminViewUsersErrorSelector: any;

jest.mock('../collection-slice', () => {
  mockGetAdminViewUsers = jest.fn(() => Promise.resolve());
  mockAdminViewUsersSelector = jest.fn();
  mockAdminViewUsersErrorSelector = jest.fn();

  return {
    __esModule: true,
    default: jest.fn(),
    clearAdminViewUserItems: jest.fn(),
    getAdminViewUsers: mockGetAdminViewUsers,
    adminViewUsersSelector: mockAdminViewUsersSelector,
    adminViewUsersErrorSelector: mockAdminViewUsersErrorSelector,
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

const UseAdminViewUsersDataComponent = () => {
  const { data, error, loading, refresh } = useAdminViewUsersData();

  return (
    <View>
      {loading && <View data-cy="loading">Loading</View>}
      {error && <View data-cy="error">Error</View>}
      {data && <View data-cy="data">Data</View>}
      <Pressable data-cy="refresh" onPress={refresh}>Refresh</Pressable>
    </View>
  );
};

describe('useAdminViewUsersData.hook', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockGetAdminViewUsers.mockClear();
    mockAdminViewUsersSelector.mockClear();
    mockAdminViewUsersErrorSelector.mockClear();
  });

  it('shows loading, fetches data', async () => {
    let testRenderer: any;
    act(() => {
      testRenderer = renderer.create(<UseAdminViewUsersDataComponent />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});
    expect(mockGetAdminViewUsers).toBeCalledTimes(1);

    mockAdminViewUsersSelector.mockReturnValueOnce({ data: 1 });
    await act(async () => {
      testRenderer.update(<UseAdminViewUsersDataComponent />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);

    // Rerender if data has changed
    mockAdminViewUsersSelector.mockReturnValueOnce({ data: 2 });
    await act(async () => {
      testRenderer.update(<UseAdminViewUsersDataComponent />);
    });
   // expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "loading"});

    await act(async () => {
      testRenderer.update(<UseAdminViewUsersDataComponent />);
    });
    testInstance.findAllByProps({"data-cy": "data"});
    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
  });

  it('returns error and refetches the data on refresh button click', async () => {
    mockAdminViewUsersErrorSelector.mockReturnValue('Error');
    let testRenderer: any;
    await act(() => {
      testRenderer = renderer.create(<UseAdminViewUsersDataComponent />);
    });

    let testInstance = testRenderer!.root;

    expect(testInstance.findAllByProps({"data-cy": "data"})).toHaveLength(0);
    testInstance.findAllByProps({"data-cy": "error"});
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    const refresh = testInstance.findByProps({"data-cy": "refresh"});
    expect(mockGetAdminViewUsers).toBeCalledTimes(1);

    mockAdminViewUsersErrorSelector.mockReturnValue(undefined);
    mockAdminViewUsersSelector.mockReturnValue({ data: 1 });

    refresh.props.onPress();

    await act(async () => {
      testRenderer.update(<UseAdminViewUsersDataComponent />);
    });

    expect(testInstance.findAllByProps({"data-cy": "error"})).toHaveLength(0);
    expect(testInstance.findAllByProps({"data-cy": "loading"})).toHaveLength(0);
    testInstance.findByProps({"data-cy": "data"});
    expect(mockGetAdminViewUsers).toBeCalledTimes(2);
  });
});

