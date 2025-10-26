/* eslint-disable prettier/prettier */
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useUserHabitPackStatusCollection } from '../useUserHabitPackStatusCollection';
import { View } from 'react-native';


//const userHabitPackStatussSelector = jest.fn();
const mockGetUserHabitPackStatuss = jest.fn();
jest.mock('../collection-slice', () => ({
    __esModule: true,
    default: jest.fn(),
    userHabitPackStatussSelector: jest.fn(),
    getUserHabitPackStatuss: () => mockGetUserHabitPackStatuss,
    userhabitpackstatussLoading: jest.fn(),
    userhabitpackstatussErrorSelector: jest.fn()
}));

const dispatch = (f:any) => f();
jest.mock('react-redux', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: () => dispatch,
    useSelector: jest.fn()
}));

const HookHarness = () => {
    const { LoadMoreUserHabitPackStatussButton } = useUserHabitPackStatusCollection();
    return <View><LoadMoreUserHabitPackStatussButton /></View>;
};

describe('useUserHabitPackStatusCollectionHook', () => {
    it('returns a load more button', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        testInstance.findByProps({"testID": "load-more-userhabitpackstatuss"});
    });

    it('loads more on load more click', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        const loadMoreButton = testInstance.findByProps({"testID": "load-more-userhabitpackstatuss"});

        loadMoreButton.props.onPress();

        expect(mockGetUserHabitPackStatuss).toBeCalled();
    });
});

