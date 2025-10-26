/* eslint-disable prettier/prettier */
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useAdminViewUserCollection } from '../useAdminViewUserCollection';
import { View } from 'react-native';


//const adminViewUsersSelector = jest.fn();
const mockGetAdminViewUsers = jest.fn();
jest.mock('../collection-slice', () => ({
    __esModule: true,
    default: jest.fn(),
    adminViewUsersSelector: jest.fn(),
    getAdminViewUsers: () => mockGetAdminViewUsers,
    adminviewusersLoading: jest.fn(),
    adminviewusersErrorSelector: jest.fn()
}));

const dispatch = (f:any) => f();
jest.mock('react-redux', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: () => dispatch,
    useSelector: jest.fn()
}));

const HookHarness = () => {
    const { LoadMoreAdminViewUsersButton } = useAdminViewUserCollection();
    return <View><LoadMoreAdminViewUsersButton /></View>;
};

describe('useAdminViewUserCollectionHook', () => {
    it('returns a load more button', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        testInstance.findByProps({"testID": "load-more-adminviewusers"});
    });

    it('loads more on load more click', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        const loadMoreButton = testInstance.findByProps({"testID": "load-more-adminviewusers"});

        loadMoreButton.props.onPress();

        expect(mockGetAdminViewUsers).toBeCalled();
    });
});

