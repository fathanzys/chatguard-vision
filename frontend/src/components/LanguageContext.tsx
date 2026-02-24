'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from './translations';

type LanguageContextType = {
    language: Language;
    setLanguage: (lang: Language) => void;
    langConfig: typeof translations['id'];
};

const LanguageContext = createContext<LanguageContextType>({
    language: 'id',
    setLanguage: () => { },
    langConfig: translations['id'],
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [language, setLanguage] = useState<Language>('id');

    // Load language from localStorage on mount
    useEffect(() => {
        const savedLang = localStorage.getItem('site_language') as Language;
        if (savedLang === 'en' || savedLang === 'id') {
            setLanguage(savedLang);
        }
    }, []);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('site_language', lang);
    };

    return (
        <LanguageContext.Provider
            value={{
                language,
                setLanguage: handleSetLanguage,
                langConfig: translations[language]
            }}
        >
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
