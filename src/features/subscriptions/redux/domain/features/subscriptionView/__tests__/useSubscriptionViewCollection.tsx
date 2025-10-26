/* eslint-disable prettier/prettier */
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useSubscriptionViewCollection } from '../useSubscriptionViewCollection';
import { View } from 'react-native';


//const subscriptionViewsSelector = jest.fn();
const mockGetSubscriptionViews = jest.fn();
jest.mock('../collection-slice', () => ({
    __esModule: true,
    default: jest.fn(),
    subscriptionViewsSelector: jest.fn(),
    getSubscriptionViews: () => mockGetSubscriptionViews,
    subscriptionviewsLoading: jest.fn(),
    subscriptionviewsErrorSelector: jest.fn()
}));

const dispatch = (f:any) => f();
jest.mock('react-redux', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: () => dispatch,
    useSelector: jest.fn()
}));

const HookHarness = () => {
    const { LoadMoreSubscriptionViewsButton } = useSubscriptionViewCollection(1);
    return <View><LoadMoreSubscriptionViewsButton /></View>;
};

describe('useSubscriptionViewCollectionHook', () => {
    it('returns a load more button', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        testInstance.findByProps({"testID": "load-more-subscriptionviews"});
    });

    it('loads more on load more click', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        const loadMoreButton = testInstance.findByProps({"testID": "load-more-subscriptionviews"});

        loadMoreButton.props.onPress();

        expect(mockGetSubscriptionViews).toBeCalled();
    });
});

