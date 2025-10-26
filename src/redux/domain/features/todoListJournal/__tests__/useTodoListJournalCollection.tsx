/* eslint-disable prettier/prettier */
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useTodoListJournalCollection } from '../useTodoListJournalCollection';
import { View } from 'react-native';


//const todoListJournalsSelector = jest.fn();
const mockGetTodoListJournals = jest.fn();
jest.mock('../collection-slice', () => ({
    __esModule: true,
    default: jest.fn(),
    todoListJournalsSelector: jest.fn(),
    getTodoListJournals: () => mockGetTodoListJournals,
    todolistjournalsLoading: jest.fn(),
    todolistjournalsErrorSelector: jest.fn()
}));

const dispatch = (f:any) => f();
jest.mock('react-redux', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: () => dispatch,
    useSelector: jest.fn()
}));

const HookHarness = () => {
    const { LoadMoreTodoListJournalsButton } = useTodoListJournalCollection(1);
    return <View><LoadMoreTodoListJournalsButton /></View>;
};

describe('useTodoListJournalCollectionHook', () => {
    it('returns a load more button', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        testInstance.findByProps({"testID": "load-more-todolistjournals"});
    });

    it('loads more on load more click', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        const loadMoreButton = testInstance.findByProps({"testID": "load-more-todolistjournals"});

        loadMoreButton.props.onPress();

        expect(mockGetTodoListJournals).toBeCalled();
    });
});

