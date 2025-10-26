/* eslint-disable prettier/prettier */
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useHabitResourceCollection } from '../useHabitResourceCollection';
import { View } from 'react-native';


//const habitResourcesSelector = jest.fn();
const mockGetHabitResources = jest.fn();
jest.mock('../collection-slice', () => ({
    __esModule: true,
    default: jest.fn(),
    habitResourcesSelector: jest.fn(),
    getHabitResources: () => mockGetHabitResources,
    habitresourcesLoading: jest.fn(),
    habitresourcesErrorSelector: jest.fn()
}));

const dispatch = (f:any) => f();
jest.mock('react-redux', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: () => dispatch,
    useSelector: jest.fn()
}));

const HookHarness = () => {
    const { LoadMoreHabitResourcesButton } = useHabitResourceCollection(1);
    return <View><LoadMoreHabitResourcesButton /></View>;
};

describe('useHabitResourceCollectionHook', () => {
    it('returns a load more button', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        testInstance.findByProps({"testID": "load-more-habitresources"});
    });

    it('loads more on load more click', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        const loadMoreButton = testInstance.findByProps({"testID": "load-more-habitresources"});

        loadMoreButton.props.onPress();

        expect(mockGetHabitResources).toBeCalled();
    });
});

