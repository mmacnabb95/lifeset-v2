/**
 * useBranding - Provides organisation brand colours and logo for theming the app.
 * When the user is in organisation mode, returns the organisation's brand colours.
 * Otherwise returns default LifeSet colours so consumer users see the standard app.
 */
import { useMode } from "./useMode";

const DEFAULT_PRIMARY = "#4e8fea";
const DEFAULT_SECONDARY = "#FFFFFF";

export function useBranding() {
  const { organisation, isConsumerMode } = useMode();

  const isBranded = !isConsumerMode && !!organisation;

  return {
    /** Primary brand colour - used for buttons, accents, headers */
    primaryColor: isBranded && organisation?.brandColours?.primary
      ? organisation.brandColours.primary
      : DEFAULT_PRIMARY,
    /** Secondary brand colour - used for contrast, backgrounds */
    secondaryColor: isBranded && organisation?.brandColours?.secondary
      ? organisation.brandColours.secondary
      : DEFAULT_SECONDARY,
    /** Organisation logo URL - undefined if not set or consumer mode */
    logoUrl: isBranded ? organisation?.logoUrl : undefined,
    /** Organisation name - for display when branded */
    organisationName: isBranded ? organisation?.name : undefined,
    /** True when user is in organisation mode (branding should be applied) */
    isBranded,
  };
}
