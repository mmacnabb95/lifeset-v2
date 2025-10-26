/* eslint-disable prettier/prettier */
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useClientEnvironmentCollection } from '../useClientEnvironmentCollection';
import { View } from 'react-native';


//const clientEnvironmentsSelector = jest.fn();
const mockGetClientEnvironments = jest.fn();
jest.mock('../collection-slice', () => ({
    __esModule: true,
    default: jest.fn(),
    clientEnvironmentsSelector: jest.fn(),
    getClientEnvironments: () => mockGetClientEnvironments,
    clientenvironmentsLoading: jest.fn(),
    clientenvironmentsErrorSelector: jest.fn()
}));

const dispatch = (f:any) => f();
jest.mock('react-redux', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: () => dispatch,
    useSelector: jest.fn()
}));

const HookHarness = () => {
    const { LoadMoreClientEnvironmentsButton } = useClientEnvironmentCollection();
    return <View><LoadMoreClientEnvironmentsButton /></View>;
};

describe('useClientEnvironmentCollectionHook', () => {
    it('returns a load more button', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        testInstance.findByProps({"testID": "load-more-clientenvironments"});
    });

    it('loads more on load more click', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        const loadMoreButton = testInstance.findByProps({"testID": "load-more-clientenvironments"});

        loadMoreButton.props.onPress();

        expect(mockGetClientEnvironments).toBeCalled();
    });
});

