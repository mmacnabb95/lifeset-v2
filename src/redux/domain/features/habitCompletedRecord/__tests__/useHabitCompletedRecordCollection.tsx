/* eslint-disable prettier/prettier */
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useHabitCompletedRecordCollection } from '../useHabitCompletedRecordCollection';
import { View } from 'react-native';


//const habitCompletedRecordsSelector = jest.fn();
const mockGetHabitCompletedRecords = jest.fn();
jest.mock('../collection-slice', () => ({
    __esModule: true,
    default: jest.fn(),
    habitCompletedRecordsSelector: jest.fn(),
    getHabitCompletedRecords: () => mockGetHabitCompletedRecords,
    habitcompletedrecordsLoading: jest.fn(),
    habitcompletedrecordsErrorSelector: jest.fn()
}));

const dispatch = (f:any) => f();
jest.mock('react-redux', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: () => dispatch,
    useSelector: jest.fn()
}));

const HookHarness = () => {
    const { LoadMoreHabitCompletedRecordsButton } = useHabitCompletedRecordCollection(1);
    return <View><LoadMoreHabitCompletedRecordsButton /></View>;
};

describe('useHabitCompletedRecordCollectionHook', () => {
    it('returns a load more button', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        testInstance.findByProps({"testID": "load-more-habitcompletedrecords"});
    });

    it('loads more on load more click', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        const loadMoreButton = testInstance.findByProps({"testID": "load-more-habitcompletedrecords"});

        loadMoreButton.props.onPress();

        expect(mockGetHabitCompletedRecords).toBeCalled();
    });
});

