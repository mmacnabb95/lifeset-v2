/* eslint-disable prettier/prettier */
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useUserHabitPackCollection } from '../useUserHabitPackCollection';
import { View } from 'react-native';


//const userHabitPacksSelector = jest.fn();
const mockGetUserHabitPacks = jest.fn();
jest.mock('../collection-slice', () => ({
    __esModule: true,
    default: jest.fn(),
    userHabitPacksSelector: jest.fn(),
    getUserHabitPacks: () => mockGetUserHabitPacks,
    userhabitpacksLoading: jest.fn(),
    userhabitpacksErrorSelector: jest.fn()
}));

const dispatch = (f:any) => f();
jest.mock('react-redux', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: () => dispatch,
    useSelector: jest.fn()
}));

const HookHarness = () => {
    const { LoadMoreUserHabitPacksButton } = useUserHabitPackCollection(1);
    return <View><LoadMoreUserHabitPacksButton /></View>;
};

describe('useUserHabitPackCollectionHook', () => {
    it('returns a load more button', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        testInstance.findByProps({"testID": "load-more-userhabitpacks"});
    });

    it('loads more on load more click', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        const loadMoreButton = testInstance.findByProps({"testID": "load-more-userhabitpacks"});

        loadMoreButton.props.onPress();

        expect(mockGetUserHabitPacks).toBeCalled();
    });
});

