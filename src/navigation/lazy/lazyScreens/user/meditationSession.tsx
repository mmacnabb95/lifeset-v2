import React, { Suspense } from "react";
import { Loading } from "src/components/common/loading/loading";

const MeditationSessionScreen = React.lazy(() => import("src/pages/user/meditation/meditationSession"));

export const LazyMeditationSessionScreen = (props: any) => {
  return (
    <Suspense fallback={<Loading />}>
      <MeditationSessionScreen {...props} />
    </Suspense>
  );
}; 