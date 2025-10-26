import React, { Suspense } from "react";
import { Loading } from "src/components/common/loading/loading";

const RecipeScreen = React.lazy(() => import("../../../../pages/user/nutrition/recipe"));

export const LazyRecipeScreen = (props: any) => {
  return (
    <Suspense fallback={<Loading />}>
      <RecipeScreen {...props} />
    </Suspense>
  );
}; 