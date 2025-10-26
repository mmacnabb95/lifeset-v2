/* eslint-disable prettier/prettier */
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { usePublishedUserHabitPackCollection } from '../usePublishedUserHabitPackCollection';
import { View } from 'react-native';


//const publishedUserHabitPacksSelector = jest.fn();
const mockGetPublishedUserHabitPacks = jest.fn();
jest.mock('../collection-slice', () => ({
    __esModule: true,
    default: jest.fn(),
    publishedUserHabitPacksSelector: jest.fn(),
    getPublishedUserHabitPacks: () => mockGetPublishedUserHabitPacks,
    publisheduserhabitpacksLoading: jest.fn(),
    publisheduserhabitpacksErrorSelector: jest.fn()
}));

const dispatch = (f:any) => f();
jest.mock('react-redux', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: () => dispatch,
    useSelector: jest.fn()
}));

const HookHarness = () => {
    const { LoadMorePublishedUserHabitPacksButton } = usePublishedUserHabitPackCollection();
    return <View><LoadMorePublishedUserHabitPacksButton /></View>;
};

describe('usePublishedUserHabitPackCollectionHook', () => {
    it('returns a load more button', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        testInstance.findByProps({"testID": "load-more-publisheduserhabitpacks"});
    });

    it('loads more on load more click', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        const loadMoreButton = testInstance.findByProps({"testID": "load-more-publisheduserhabitpacks"});

        loadMoreButton.props.onPress();

        expect(mockGetPublishedUserHabitPacks).toBeCalled();
    });
});

