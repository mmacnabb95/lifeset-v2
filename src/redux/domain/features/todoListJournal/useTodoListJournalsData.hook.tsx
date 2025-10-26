import { useCallback, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getTodoListJournals,
  todoListJournalsSelector,
  clearTodoListJournalItems,
  todoListJournalsErrorSelector,
} from "./collection-slice";

const useTodoListJournalsData = (user?: number) => {
  const dispatch = useDispatch();
  const error: string | undefined = useSelector(todoListJournalsErrorSelector);
  const data = useSelector(todoListJournalsSelector);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const response: any = await dispatch(
      getTodoListJournals({
        limit: 0,
        user,
      }),
    );
    setLoading(false);
    return response;
  }, [setLoading, dispatch, user]);

  const clearData = useCallback(() => {
    dispatch(clearTodoListJournalItems());
  }, [dispatch]);

  const refresh = useCallback(async () => {
    clearData();
    return await fetchData();
  }, [clearData, fetchData]);

  useEffect(() => {
    clearData();
  }, [clearData]);

  useEffect(() => {
    if (!user) {
      return;
    }
    refresh();
  }, [refresh, user]);

  return useMemo(() => ({
    error,
    loading,
    refresh,
    data: data || null,
  }), [data, loading, error, refresh]);
};

export default useTodoListJournalsData;
