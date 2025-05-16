import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "../public/locales/en/common.json";
import skCommon from "../public/locales/sk/common.json";

export const resources = {
  en: {
    common: enCommon,
  },
  sk: {
    common: skCommon,
  },
} as const; // as const for type inference

i18n
  // detection of user language
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next
  .use(initReactI18next)
  //  i18next initialization
  .init({
    debug: process.env.NODE_ENV === "development", // enable debug mode in development
    fallbackLng: "en",
    lng: "sk", // default language
    defaultNS: "common", // default namespace
    ns: ["common"], // default namespace
    resources,
    interpolation: {
      escapeValue: false, // react does escaping by default to prevent XSS attacks
    },
    detection: {
      // order and from where user language should be detected
      order: [
        "querystring",
        "cookie",
        "localStorage",
        "sessionStorage",
        "navigator",
        "htmlTag",
        "path",
        "subdomain",
      ],
      // keys to lookup language from
      caches: ["cookie", "localStorage"],
    },
  });

export default i18n;
