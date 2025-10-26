import { useEffect, useState } from "react";

// quick fix for forced re-render (if getAppendees was a hook we wouldn't need this)
export const useReRenderOnFormRef = ({ formRef }: { formRef: any }) => {
  const [renderableItem, setRendererableItem] = useState("a");

  useEffect(() => {
    if (formRef) {
      setRendererableItem("b");
    }
  }, [formRef]);

  return renderableItem;
};
