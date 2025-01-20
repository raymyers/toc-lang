import { parser } from "./generated/tocLangLezerParser"
import {
  LRLanguage,
  LanguageSupport,
  indentNodeProp,
  foldNodeProp,
  foldInside,
  delimitedIndent
} from "@codemirror/language"
import { styleTags, tags as t } from "@lezer/highlight"

export const TocLangLanguage = LRLanguage.define({
  parser: parser.configure({
    props: [
      indentNodeProp.add({
        Application: delimitedIndent({ closing: ")", align: false })
      }),
      foldNodeProp.add({
        Application: foldInside
      }),
      styleTags({
        Identifier: t.variableName,
        Boolean: t.bool,
        String: t.string,
        Label: t.string,
        LineComment: t.lineComment,
        "( )": t.paren
      })
    ]
  }),
  languageData: {
    commentTokens: { line: "#" }
  }
})

export function TOC_LANG() {
  return new LanguageSupport(TocLangLanguage)
}
