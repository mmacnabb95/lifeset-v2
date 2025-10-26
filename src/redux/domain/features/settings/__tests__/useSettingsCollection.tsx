/* eslint-disable prettier/prettier */
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { useSettingsCollection } from '../useSettingsCollection';
import { View } from 'react-native';


//const settingssSelector = jest.fn();
const mockGetSettingss = jest.fn();
jest.mock('../collection-slice', () => ({
    __esModule: true,
    default: jest.fn(),
    settingssSelector: jest.fn(),
    getSettingss: () => mockGetSettingss,
    settingssLoading: jest.fn(),
    settingssErrorSelector: jest.fn()
}));

const dispatch = (f:any) => f();
jest.mock('react-redux', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    useDispatch: () => dispatch,
    useSelector: jest.fn()
}));

const HookHarness = () => {
    const { LoadMoreSettingssButton } = useSettingsCollection(1);
    return <View><LoadMoreSettingssButton /></View>;
};

describe('useSettingsCollectionHook', () => {
    it('returns a load more button', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        testInstance.findByProps({"testID": "load-more-settingss"});
    });

    it('loads more on load more click', () => {
        const testRenderer = renderer.create(<HookHarness />);
        const testInstance = testRenderer.root;

        const loadMoreButton = testInstance.findByProps({"testID": "load-more-settingss"});

        loadMoreButton.props.onPress();

        expect(mockGetSettingss).toBeCalled();
    });
});

