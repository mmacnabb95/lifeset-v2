/* eslint-disable prettier/prettier */
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useHabitMediaKeyCollection } from '../useHabitMediaKeyCollection';
import { View } from 'react-native';


//const habitMediaKeysSelector = jest.fn();
const mockGetHabitMediaKeys = jest.fn();
jest.mock('../collection-slice', () => ({
    __esModule: true,
    default: jest.fn(),
    habitMediaKeysSelector: jest.fn(),
    getHabitMediaKeys: () => mockGetHabitMediaKeys,
    habitmediakeysLoading: jest.fn(),
    habitmediakeysErrorSelector: jest.fn()
}));

const dispatch = (f:any) => f();
jest.mock('react-redux', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: () => dispatch,
    useSelector: jest.fn()
}));

const HookHarness = () => {
    const { LoadMoreHabitMediaKeysButton } = useHabitMediaKeyCollection();
    return <View><LoadMoreHabitMediaKeysButton /></View>;
};

describe('useHabitMediaKeyCollectionHook', () => {
    it('returns a load more button', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        testInstance.findByProps({"testID": "load-more-habitmediakeys"});
    });

    it('loads more on load more click', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        const loadMoreButton = testInstance.findByProps({"testID": "load-more-habitmediakeys"});

        loadMoreButton.props.onPress();

        expect(mockGetHabitMediaKeys).toBeCalled();
    });
});

