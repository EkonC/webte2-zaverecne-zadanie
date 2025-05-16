"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

type Language = {
  code: string;
  name: string;
  flagUrl: string;
};

const languages: Language[] = [
  { code: "en", name: "English", flagUrl: "/flags/gb.svg" },
  { code: "sk", name: "Slovak", flagUrl: "/flags/sk.svg" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const [currentLanguageDisplay, setCurrentLanguageDisplay] = useState<
    Language | undefined
  >(
    () =>
      languages.find((lang) => lang.code === i18n.language) ||
      languages.find(
        (l) =>
          l.code ===
          (Array.isArray(i18n.options.fallbackLng)
            ? i18n.options.fallbackLng[0]
            : undefined)
      ) ||
      languages[0]
  );

  useEffect(() => {
    const activeLangObject = languages.find(
      (lang) => lang.code === i18n.language
    );
    if (activeLangObject) {
      setCurrentLanguageDisplay(activeLangObject);
    }

    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  // Funkcia na zmenu jazyka
  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode).then(() => {});
  };

  if (!currentLanguageDisplay) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-sm focus-visible:ring-offset-0 focus-visible:ring-0"
        >
          <Image
            src={currentLanguageDisplay.flagUrl}
            alt={`${currentLanguageDisplay.name} flag`}
            width={20}
            height={15}
            className="rounded-sm"
          />
          <span className="hidden sm:inline-block">
            {currentLanguageDisplay.name}
          </span>

          <span className="sm:hidden uppercase">
            {currentLanguageDisplay.code}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`cursor-pointer ${
              i18n.language === language.code
                ? "font-semibold bg-accent text-accent-foreground"
                : ""
            }`}
            aria-current={i18n.language === language.code ? "true" : undefined}
          >
            <Image
              src={language.flagUrl}
              alt={`${language.name} flag`}
              width={20}
              height={15}
              className="mr-2 rounded-sm"
            />
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
