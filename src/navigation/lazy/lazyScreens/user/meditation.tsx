import React, { Suspense } from "react";
import { Loading } from "src/components/common/loading/loading";

const MeditationScreen = React.lazy(() => import("src/pages/user/meditation/meditation"));

export const LazyMeditationScreen = (props: any) => {
  return (
    <Suspense fallback={<Loading />}>
      <MeditationScreen {...props} />
    </Suspense>
  );
}; 