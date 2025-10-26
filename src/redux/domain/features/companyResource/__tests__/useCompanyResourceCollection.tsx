/* eslint-disable prettier/prettier */
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useCompanyResourceCollection } from '../useCompanyResourceCollection';
import { View } from 'react-native';


//const companyResourcesSelector = jest.fn();
const mockGetCompanyResources = jest.fn();
jest.mock('../collection-slice', () => ({
    __esModule: true,
    default: jest.fn(),
    companyResourcesSelector: jest.fn(),
    getCompanyResources: () => mockGetCompanyResources,
    companyresourcesLoading: jest.fn(),
    companyresourcesErrorSelector: jest.fn()
}));

const dispatch = (f:any) => f();
jest.mock('react-redux', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: () => dispatch,
    useSelector: jest.fn()
}));

const HookHarness = () => {
    const { LoadMoreCompanyResourcesButton } = useCompanyResourceCollection(1);
    return <View><LoadMoreCompanyResourcesButton /></View>;
};

describe('useCompanyResourceCollectionHook', () => {
    it('returns a load more button', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        testInstance.findByProps({"testID": "load-more-companyresources"});
    });

    it('loads more on load more click', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        const loadMoreButton = testInstance.findByProps({"testID": "load-more-companyresources"});

        loadMoreButton.props.onPress();

        expect(mockGetCompanyResources).toBeCalled();
    });
});

