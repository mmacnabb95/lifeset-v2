/* eslint-disable prettier/prettier */
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useUserHabitPackUseCollection } from '../useUserHabitPackUseCollection';
import { View } from 'react-native';


//const userHabitPackUsesSelector = jest.fn();
const mockGetUserHabitPackUses = jest.fn();
jest.mock('../collection-slice', () => ({
    __esModule: true,
    default: jest.fn(),
    userHabitPackUsesSelector: jest.fn(),
    getUserHabitPackUses: () => mockGetUserHabitPackUses,
    userhabitpackusesLoading: jest.fn(),
    userhabitpackusesErrorSelector: jest.fn()
}));

const dispatch = (f:any) => f();
jest.mock('react-redux', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: () => dispatch,
    useSelector: jest.fn()
}));

const HookHarness = () => {
    const { LoadMoreUserHabitPackUsesButton } = useUserHabitPackUseCollection(1);
    return <View><LoadMoreUserHabitPackUsesButton /></View>;
};

describe('useUserHabitPackUseCollectionHook', () => {
    it('returns a load more button', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        testInstance.findByProps({"testID": "load-more-userhabitpackuses"});
    });

    it('loads more on load more click', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        const loadMoreButton = testInstance.findByProps({"testID": "load-more-userhabitpackuses"});

        loadMoreButton.props.onPress();

        expect(mockGetUserHabitPackUses).toBeCalled();
    });
});

