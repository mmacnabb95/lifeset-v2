import jp from "jsonpath";
import { useSelector } from "react-redux";
import english from "./english.json";
import portuguese from "./portuguese.json";
import { languagePreference } from "src/redux/features/misc/slice";

export const useTranslation = () => {
  const language = useSelector(languagePreference);

  let text = (path: string): string => {
    try {
      return jp.query(
        language === 2 ? portuguese : english,
        `$.${path}`,
      ) as unknown as string;
    } catch (e) {
      console.log("error: ", e);
      return "";
    }
  };

  const t = (path: string) => {
    return (text(path) as string[])[0];
  };

  return {
    text,
    t,
  };
};
