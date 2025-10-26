/* eslint-disable prettier/prettier */
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useAllTimeStreakCollection } from '../useAllTimeStreakCollection';
import { View } from 'react-native';


//const allTimeStreaksSelector = jest.fn();
const mockGetAllTimeStreaks = jest.fn();
jest.mock('../collection-slice', () => ({
    __esModule: true,
    default: jest.fn(),
    allTimeStreaksSelector: jest.fn(),
    getAllTimeStreaks: () => mockGetAllTimeStreaks,
    alltimestreaksLoading: jest.fn(),
    alltimestreaksErrorSelector: jest.fn()
}));

const dispatch = (f:any) => f();
jest.mock('react-redux', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: () => dispatch,
    useSelector: jest.fn()
}));

const HookHarness = () => {
    const { LoadMoreAllTimeStreaksButton } = useAllTimeStreakCollection(1);
    return <View><LoadMoreAllTimeStreaksButton /></View>;
};

describe('useAllTimeStreakCollectionHook', () => {
    it('returns a load more button', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        testInstance.findByProps({"testID": "load-more-alltimestreaks"});
    });

    it('loads more on load more click', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        const loadMoreButton = testInstance.findByProps({"testID": "load-more-alltimestreaks"});

        loadMoreButton.props.onPress();

        expect(mockGetAllTimeStreaks).toBeCalled();
    });
});

