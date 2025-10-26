/* eslint-disable prettier/prettier */
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useBenefitCollection } from '../useBenefitCollection';
import { View } from 'react-native';


//const benefitsSelector = jest.fn();
const mockGetBenefits = jest.fn();
jest.mock('../collection-slice', () => ({
    __esModule: true,
    default: jest.fn(),
    benefitsSelector: jest.fn(),
    getBenefits: () => mockGetBenefits,
    benefitsLoading: jest.fn(),
    benefitsErrorSelector: jest.fn()
}));

const dispatch = (f:any) => f();
jest.mock('react-redux', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: () => dispatch,
    useSelector: jest.fn()
}));

const HookHarness = () => {
    const { LoadMoreBenefitsButton } = useBenefitCollection(1);
    return <View><LoadMoreBenefitsButton /></View>;
};

describe('useBenefitCollectionHook', () => {
    it('returns a load more button', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        testInstance.findByProps({"testID": "load-more-benefits"});
    });

    it('loads more on load more click', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        const loadMoreButton = testInstance.findByProps({"testID": "load-more-benefits"});

        loadMoreButton.props.onPress();

        expect(mockGetBenefits).toBeCalled();
    });
});

