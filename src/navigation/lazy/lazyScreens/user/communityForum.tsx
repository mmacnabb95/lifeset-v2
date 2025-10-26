import React, { Suspense } from "react";
import { Loading } from "src/components/common/loading/loading";

const CommunityForumScreen = React.lazy(() => import("src/pages/user/communityForum/communityForum"));

export const LazyCommunityForumScreen = (props: any) => {
  return (
    <Suspense fallback={<Loading />}>
      <CommunityForumScreen {...props} />
    </Suspense>
  );
}; 