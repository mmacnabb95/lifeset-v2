/* eslint-disable prettier/prettier */
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useCompanyMediaKeyCollection } from '../useCompanyMediaKeyCollection';
import { View } from 'react-native';


//const companyMediaKeysSelector = jest.fn();
const mockGetCompanyMediaKeys = jest.fn();
jest.mock('../collection-slice', () => ({
    __esModule: true,
    default: jest.fn(),
    companyMediaKeysSelector: jest.fn(),
    getCompanyMediaKeys: () => mockGetCompanyMediaKeys,
    companymediakeysLoading: jest.fn(),
    companymediakeysErrorSelector: jest.fn()
}));

const dispatch = (f:any) => f();
jest.mock('react-redux', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: () => dispatch,
    useSelector: jest.fn()
}));

const HookHarness = () => {
    const { LoadMoreCompanyMediaKeysButton } = useCompanyMediaKeyCollection();
    return <View><LoadMoreCompanyMediaKeysButton /></View>;
};

describe('useCompanyMediaKeyCollectionHook', () => {
    it('returns a load more button', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        testInstance.findByProps({"testID": "load-more-companymediakeys"});
    });

    it('loads more on load more click', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        const loadMoreButton = testInstance.findByProps({"testID": "load-more-companymediakeys"});

        loadMoreButton.props.onPress();

        expect(mockGetCompanyMediaKeys).toBeCalled();
    });
});

