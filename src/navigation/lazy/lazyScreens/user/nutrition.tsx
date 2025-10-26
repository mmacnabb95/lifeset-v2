import React, { Suspense } from "react";
import { Loading } from "src/components/common/loading/loading";

const NutritionScreen = React.lazy(() => 
  import("../../../../pages/user/nutrition/nutrition")
);

export const LazyNutritionScreen = (props: any) => {
  return (
    <Suspense fallback={<Loading />}>
      <NutritionScreen {...props} />
    </Suspense>
  );
}; 