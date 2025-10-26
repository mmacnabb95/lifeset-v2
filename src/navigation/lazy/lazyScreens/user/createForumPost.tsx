import React, { Suspense } from "react";
import { Loading } from "src/components/common/loading/loading";

const CreateForumPostScreen = React.lazy(() => import("src/pages/user/communityForum/createForumPost"));

export const LazyCreateForumPostScreen = (props: any) => {
  return (
    <Suspense fallback={<Loading />}>
      <CreateForumPostScreen {...props} />
    </Suspense>
  );
}; 