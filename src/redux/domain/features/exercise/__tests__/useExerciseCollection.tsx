/* eslint-disable prettier/prettier */
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useExerciseCollection } from '../useExerciseCollection';
import { View } from 'react-native';


//const exercisesSelector = jest.fn();
const mockGetExercises = jest.fn();
jest.mock('../collection-slice', () => ({
    __esModule: true,
    default: jest.fn(),
    exercisesSelector: jest.fn(),
    getExercises: () => mockGetExercises,
    exercisesLoading: jest.fn(),
    exercisesErrorSelector: jest.fn()
}));

const dispatch = (f:any) => f();
jest.mock('react-redux', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: () => dispatch,
    useSelector: jest.fn()
}));

const HookHarness = () => {
    const { LoadMoreExercisesButton } = useExerciseCollection();
    return <View><LoadMoreExercisesButton /></View>;
};

describe('useExerciseCollectionHook', () => {
    it('returns a load more button', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        testInstance.findByProps({"testID": "load-more-exercises"});
    });

    it('loads more on load more click', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        const loadMoreButton = testInstance.findByProps({"testID": "load-more-exercises"});

        loadMoreButton.props.onPress();

        expect(mockGetExercises).toBeCalled();
    });
});

