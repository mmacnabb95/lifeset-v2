import AsyncStorageMock from "@react-native-async-storage/async-storage/jest/async-storage-mock";
import {
  renderHook,
  RenderResult,
  WaitForNextUpdate,
} from "@testing-library/react-hooks";
import { act } from "react-test-renderer";
import { useAuthed } from "../useAuthed";
import { mockClientEnvironmentVariables } from "../__mocks__/clientEnvironmentVariables";
jest.mock("expo-file-system", () => ({
  downloadAsync: jest.fn(() => Promise.resolve({ md5: "md5", uri: "uri" })),
  getInfoAsync: jest.fn(() =>
    Promise.resolve({ exists: true, md5: "md5", uri: "uri" }),
  ),
  readAsStringAsync: jest.fn(() => Promise.resolve()),
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
  deleteAsync: jest.fn(() => Promise.resolve()),
  moveAsync: jest.fn(() => Promise.resolve()),
  copyAsync: jest.fn(() => Promise.resolve()),
  makeDirectoryAsync: jest.fn(() => Promise.resolve()),
  readDirectoryAsync: jest.fn(() => Promise.resolve()),
  createDownloadResumable: jest.fn(() => Promise.resolve()),
  documentDirectory: "file:///test-directory/",
}));

const setAuthTokenMock = () => {
  AsyncStorageMock.getItem = jest.fn(async (key) => {
    if (key === "token") {
      return "some_auth_token";
    }
    return null;
  });
};

const removeAuthTokenMock = () => {
  AsyncStorageMock.getItem = jest.fn(async (key) => {
    if (key === "token") {
      return null;
    }
    return null;
  });
};

let _rejected = false;
const _isRejected = () => {
  return _rejected;
};

jest.mock("src/redux/features/auth/slice", () => ({
  __esModule: true,
  default: jest.fn(() => null),
  invalidateAuth: () => {
    _rejected = true; //simulate an auth call being rejected by the API
    removeAuthTokenMock();
  },
  authUser: jest.fn(),
  reAuth: jest.fn(),
  createPinAuth: jest.fn(),
  isFulfilled: jest.fn(),
  isRejected: _isRejected,
  isTwoFactorAuthEnabled: false,
}));

//client\src\redux\middlewares\authMiddleware.ts
jest.mock("src/redux/middlewares/authMiddleware", () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

jest.mock("src/redux/features/misc/slice", () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

jest.mock(
  "src/redux/domain/features/clientEnvironment/collection-slice.ts",
  () => ({
    __esModule: true,
    default: jest.fn(() => null),
    getClientEnvironments: () => {
      return {
        type: "get/client-environments",
        payload: mockClientEnvironmentVariables,
      };
    },
  }),
);

const dispatch = (f: any) => {
  if (typeof f?.onsubmit === "function") {
    f();
  }
};
jest.mock("react-redux", () => ({
  __esModule: true,
  default: "mockedDefaultExport",
  useDispatch: () => dispatch,
  useSelector: (func: any) => {
    if ((func.name = "_isRejected")) {
      return _isRejected();
    }
  },
}));

jest.mock("src/redux/stores/store.tsx", () => ({
  __esModule: true,
  default: {
    dispatch: dispatch,
    getState: () => {
      return {
        clientEnvironments: {
          items: mockClientEnvironmentVariables,
        },
      };
    },
  },
}));

const _shutdown = async (
  rerender: (props?: unknown) => void,
  waitForNextUpdate: WaitForNextUpdate,
  result: RenderResult<{
    authed: boolean | undefined;
    noteActivity: () => void;
  }>,
) => {
  await act(async () => {
    _rejected = true; //simulate an auth call being rejected by the API
    removeAuthTokenMock(); //the system will remove the invalid auth token
    rerender(); //the hook stops the inactivity timer
    await waitForNextUpdate();
  });
  expect(result.current.authed).toBe(false);
};

// https://react-hooks-testing-library.com/

jest.setTimeout(30000);

describe("useAuthed hook", () => {
  beforeEach(() => {
    _rejected = false;
  });

  it("return authed false when no auth token exists", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useAuthed());

    await waitForNextUpdate();

    expect(result.current.authed).toBe(false);
  });

  it("return authed true when an auth token exists", async () => {
    setAuthTokenMock();

    const { result, waitForNextUpdate, rerender } = renderHook(() =>
      useAuthed(),
    );

    await act(async () => {
      await waitForNextUpdate();
    });

    expect(result.current.authed).toBe(true);

    await _shutdown(rerender, waitForNextUpdate, result);
  });

  it("logs the user out after a period of inactivity", async () => {
    setAuthTokenMock();

    const { result, waitForNextUpdate, rerender } = renderHook(() =>
      useAuthed({ inactiveMillisecondsLogout: 2000 }),
    );

    await act(async () => {
      await waitForNextUpdate();
    });

    expect(result.current.authed).toBe(true);

    // the check on inactivity is every 10s
    // default inactivity is 5mins but set to 2s in tests
    await new Promise((r) => setTimeout(r, 12000));

    // await new Promise(r => setTimeout(r, 2000));
    await act(async () => {
      rerender();
      await waitForNextUpdate();
    });

    expect(result.current.authed).toBe(false);
  });

  it("notes user activity and resets the inactivity timer", async () => {
    setAuthTokenMock();

    const { result, waitForNextUpdate, rerender } = renderHook(() =>
      useAuthed({ inactiveMillisecondsLogout: 12000 }),
    );

    await act(async () => {
      await waitForNextUpdate();
    });

    expect(result.current.authed).toBe(true);

    //timer = 0
    await new Promise((r) => setTimeout(r, 9000));

    //timer = 9
    result.current.noteActivity(); //this resets the inactivity timer to 0

    //timer = 0
    await new Promise((r) => setTimeout(r, 4000));
    //first inactivity check at 10
    //timer = 4
    //total time past = 13 >= inactiveMillisecondsLogout i.e. 12

    //testing now that we are still authed proves timer was reset
    await act(async () => {
      rerender();
      await waitForNextUpdate();
    });
    expect(result.current.authed).toBe(true);

    await _shutdown(rerender, waitForNextUpdate, result);
  });
});
