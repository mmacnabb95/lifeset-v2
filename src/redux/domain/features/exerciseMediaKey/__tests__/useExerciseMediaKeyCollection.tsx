/* eslint-disable prettier/prettier */
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useExerciseMediaKeyCollection } from '../useExerciseMediaKeyCollection';
import { View } from 'react-native';


//const exerciseMediaKeysSelector = jest.fn();
const mockGetExerciseMediaKeys = jest.fn();
jest.mock('../collection-slice', () => ({
    __esModule: true,
    default: jest.fn(),
    exerciseMediaKeysSelector: jest.fn(),
    getExerciseMediaKeys: () => mockGetExerciseMediaKeys,
    exercisemediakeysLoading: jest.fn(),
    exercisemediakeysErrorSelector: jest.fn()
}));

const dispatch = (f:any) => f();
jest.mock('react-redux', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: () => dispatch,
    useSelector: jest.fn()
}));

const HookHarness = () => {
    const { LoadMoreExerciseMediaKeysButton } = useExerciseMediaKeyCollection();
    return <View><LoadMoreExerciseMediaKeysButton /></View>;
};

describe('useExerciseMediaKeyCollectionHook', () => {
    it('returns a load more button', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        testInstance.findByProps({"testID": "load-more-exercisemediakeys"});
    });

    it('loads more on load more click', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        const loadMoreButton = testInstance.findByProps({"testID": "load-more-exercisemediakeys"});

        loadMoreButton.props.onPress();

        expect(mockGetExerciseMediaKeys).toBeCalled();
    });
});

