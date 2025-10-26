/* eslint-disable prettier/prettier */
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useReminderCollection } from '../useReminderCollection';
import { View } from 'react-native';


//const remindersSelector = jest.fn();
const mockGetReminders = jest.fn();
jest.mock('../collection-slice', () => ({
    __esModule: true,
    default: jest.fn(),
    remindersSelector: jest.fn(),
    getReminders: () => mockGetReminders,
    remindersLoading: jest.fn(),
    remindersErrorSelector: jest.fn()
}));

const dispatch = (f:any) => f();
jest.mock('react-redux', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: () => dispatch,
    useSelector: jest.fn()
}));

const HookHarness = () => {
    const { LoadMoreRemindersButton } = useReminderCollection(1);
    return <View><LoadMoreRemindersButton /></View>;
};

describe('useReminderCollectionHook', () => {
    it('returns a load more button', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        testInstance.findByProps({"testID": "load-more-reminders"});
    });

    it('loads more on load more click', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        const loadMoreButton = testInstance.findByProps({"testID": "load-more-reminders"});

        loadMoreButton.props.onPress();

        expect(mockGetReminders).toBeCalled();
    });
});

