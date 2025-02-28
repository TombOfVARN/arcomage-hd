import React, { createContext, useEffect, useState } from 'react'
import { i18n as defaultTrans } from './en'
import { cardsI18n } from '../../src/i18n/cards.en'
import { tavernsI18n } from '../../src/i18n/taverns.en'
import { defaultLang } from './langs'
import {
  AvailableLangType,
  I18nContextType,
  TranslationFullType,
} from './types'
import { useAppSelector } from '../utils/useAppDispatch'

const allDefault = {
  i18n: defaultTrans,
  cards: cardsI18n,
  taverns: tavernsI18n,
}

const transObjDefault = { i18n: () => '', cards: () => '', taverns: () => '' }

export const I18nContext = createContext<I18nContextType>(transObjDefault)

const translationDefault: TranslationFullType = {
  [defaultLang]: allDefault,
}

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [translation, setTranslation] = useState<TranslationFullType>(
    translationDefault,
  )
  const lang = useAppSelector((state): AvailableLangType => state.lang.code)
  useEffect(() => {
    if (!translation[lang]) {
      setTranslation({ ...translation, [lang]: null })
      ;(async () => {
        const [{ i18n }, { cardsI18n }, { tavernsI18n }] = await Promise.all([
          import(
            /* webpackChunkName: "i18n" */
            /* webpackMode: "lazy" */
            /* webpackPrefetch: true */
            /* webpackPreload: false */
            `./${lang}`
          ),
          import(
            /* webpackChunkName: "cardi18n" */
            /* webpackMode: "lazy" */
            /* webpackPrefetch: true */
            /* webpackPreload: false */
            `./cards.${lang}`
          ),
          import(
            /* webpackChunkName: "taverni18n" */
            /* webpackMode: "lazy" */
            /* webpackPrefetch: true */
            /* webpackPreload: false */
            `./taverns.${lang}`
          ),
        ])
        setTranslation({
          ...translation,
          [lang]: { i18n, cards: cardsI18n, taverns: tavernsI18n },
        })
      })()
    }
  }, [lang])

  return (
    <I18nContext.Provider
      value={{
        i18n: (str: string): string => {
          const t = translation[lang] ?? translation[defaultLang]
          return t.i18n?.[str] ?? ''
        },
        cards: (n: number, cardI18nProp: 'name' | 'desc'): string => {
          const t = translation[lang] ?? translation[defaultLang]
          const c = t.cards
          const card = c?.[n]
          return card?.[cardI18nProp] ?? ''
        },
        taverns: (i: number, tavernI18nProp: 'name' | 'location'): string => {
          const t = translation[lang] ?? translation[defaultLang]
          const c = t.taverns
          const tavern = c?.[i]
          return tavern?.[tavernI18nProp] ?? ''
        },
      }}
    >
      {children}
    </I18nContext.Provider>
  )
}

export const upper1st = (s: string | undefined): string | undefined =>
  s && s.charAt(0).toUpperCase() + s.slice(1)
