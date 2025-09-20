import { getLocales } from "expo-localization";
import { languages } from "../locales";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

const config = {
  SUPPORTED_LANGUAGES: Object.keys(languages),
  DEFAULT_LANGUAGE: "en",
  APP_LANGUAGE: "APP_LANGUAGE",
};

const getDeviceLanguage = () => {
  const locale = getLocales();
  return locale[0]?.languageCode || config.DEFAULT_LANGUAGE;
};

const initialLang = config.SUPPORTED_LANGUAGES.includes(getDeviceLanguage())
  ? getDeviceLanguage()
  : config.DEFAULT_LANGUAGE;

i18next.use(initReactI18next).init({
  resources: languages,
  lng: initialLang,
  fallbackLng: config.DEFAULT_LANGUAGE,
  interpolation: {
    escapeValue: false,
  },
});

export const changeLanguage = async (lang) => {
  try {
    if (!config.SUPPORTED_LANGUAGES.includes(lang)) {
      throw new Error("Language not supported");
    }

    await i18next.changeLanguage(lang);
    await AsyncStorage.setItem(config.APP_LANGUAGE, lang);

    if (__DEV__) {
      console.log("Language changed to: ", lang);
    }
  } catch (error) {
    console.log("Error changing language: ", error);
  }
};

export const loadLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem(config.APP_LANGUAGE);

    if (savedLanguage && config.SUPPORTED_LANGUAGES.includes(savedLanguage)) {
      await i18next.changeLanguage(savedLanguage);

      if (__DEV__) {
        console.log("Loaded saved language: ", savedLanguage);
      }
    }
  } catch (error) {
    console.log("Error loading language: ", error);
  }
};