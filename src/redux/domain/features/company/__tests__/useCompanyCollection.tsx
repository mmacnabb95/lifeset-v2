/* eslint-disable prettier/prettier */
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useCompanyCollection } from '../useCompanyCollection';
import { View } from 'react-native';


//const companysSelector = jest.fn();
const mockGetCompanys = jest.fn();
jest.mock('../collection-slice', () => ({
    __esModule: true,
    default: jest.fn(),
    companysSelector: jest.fn(),
    getCompanys: () => mockGetCompanys,
    companysLoading: jest.fn(),
    companysErrorSelector: jest.fn()
}));

const dispatch = (f:any) => f();
jest.mock('react-redux', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: () => dispatch,
    useSelector: jest.fn()
}));

const HookHarness = () => {
    const { LoadMoreCompanysButton } = useCompanyCollection();
    return <View><LoadMoreCompanysButton /></View>;
};

describe('useCompanyCollectionHook', () => {
    it('returns a load more button', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        testInstance.findByProps({"testID": "load-more-companys"});
    });

    it('loads more on load more click', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        const loadMoreButton = testInstance.findByProps({"testID": "load-more-companys"});

        loadMoreButton.props.onPress();

        expect(mockGetCompanys).toBeCalled();
    });
});

