/* eslint-disable prettier/prettier */
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useHabitPackCollection } from '../useHabitPackCollection';
import { View } from 'react-native';


//const habitPacksSelector = jest.fn();
const mockGetHabitPacks = jest.fn();
jest.mock('../collection-slice', () => ({
    __esModule: true,
    default: jest.fn(),
    habitPacksSelector: jest.fn(),
    getHabitPacks: () => mockGetHabitPacks,
    habitpacksLoading: jest.fn(),
    habitpacksErrorSelector: jest.fn()
}));

const dispatch = (f:any) => f();
jest.mock('react-redux', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: () => dispatch,
    useSelector: jest.fn()
}));

const HookHarness = () => {
    const { LoadMoreHabitPacksButton } = useHabitPackCollection(1);
    return <View><LoadMoreHabitPacksButton /></View>;
};

describe('useHabitPackCollectionHook', () => {
    it('returns a load more button', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        testInstance.findByProps({"testID": "load-more-habitpacks"});
    });

    it('loads more on load more click', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        const loadMoreButton = testInstance.findByProps({"testID": "load-more-habitpacks"});

        loadMoreButton.props.onPress();

        expect(mockGetHabitPacks).toBeCalled();
    });
});

