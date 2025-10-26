/* eslint-disable prettier/prettier */
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useCompanyUserCollection } from '../useCompanyUserCollection';
import { View } from 'react-native';


//const companyUsersSelector = jest.fn();
const mockGetCompanyUsers = jest.fn();
jest.mock('../collection-slice', () => ({
    __esModule: true,
    default: jest.fn(),
    companyUsersSelector: jest.fn(),
    getCompanyUsers: () => mockGetCompanyUsers,
    companyusersLoading: jest.fn(),
    companyusersErrorSelector: jest.fn()
}));

const dispatch = (f:any) => f();
jest.mock('react-redux', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: () => dispatch,
    useSelector: jest.fn()
}));

const HookHarness = () => {
    const { LoadMoreCompanyUsersButton } = useCompanyUserCollection(1);
    return <View><LoadMoreCompanyUsersButton /></View>;
};

describe('useCompanyUserCollectionHook', () => {
    it('returns a load more button', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        testInstance.findByProps({"testID": "load-more-companyusers"});
    });

    it('loads more on load more click', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        const loadMoreButton = testInstance.findByProps({"testID": "load-more-companyusers"});

        loadMoreButton.props.onPress();

        expect(mockGetCompanyUsers).toBeCalled();
    });
});

