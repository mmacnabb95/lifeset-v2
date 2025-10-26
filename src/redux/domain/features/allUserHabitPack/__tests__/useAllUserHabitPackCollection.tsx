/* eslint-disable prettier/prettier */
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useAllUserHabitPackCollection } from '../useAllUserHabitPackCollection';
import { View } from 'react-native';


//const allUserHabitPacksSelector = jest.fn();
const mockGetAllUserHabitPacks = jest.fn();
jest.mock('../collection-slice', () => ({
    __esModule: true,
    default: jest.fn(),
    allUserHabitPacksSelector: jest.fn(),
    getAllUserHabitPacks: () => mockGetAllUserHabitPacks,
    alluserhabitpacksLoading: jest.fn(),
    alluserhabitpacksErrorSelector: jest.fn()
}));

const dispatch = (f:any) => f();
jest.mock('react-redux', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: () => dispatch,
    useSelector: jest.fn()
}));

const HookHarness = () => {
    const { LoadMoreAllUserHabitPacksButton } = useAllUserHabitPackCollection();
    return <View><LoadMoreAllUserHabitPacksButton /></View>;
};

describe('useAllUserHabitPackCollectionHook', () => {
    it('returns a load more button', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        testInstance.findByProps({"testID": "load-more-alluserhabitpacks"});
    });

    it('loads more on load more click', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        const loadMoreButton = testInstance.findByProps({"testID": "load-more-alluserhabitpacks"});

        loadMoreButton.props.onPress();

        expect(mockGetAllUserHabitPacks).toBeCalled();
    });
});

