import React, { Suspense } from "react";
import { Loading } from "src/components/common/loading/loading";

const ForumPostScreen = React.lazy(() => import("src/pages/user/communityForum/forumPost"));

export const LazyForumPostScreen = (props: any) => {
  return (
    <Suspense fallback={<Loading />}>
      <ForumPostScreen {...props} />
    </Suspense>
  );
}; 