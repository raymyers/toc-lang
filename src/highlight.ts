import { parser } from "./generated/tocLangLezerParser"
import {
  LRLanguage,
  LanguageSupport,
  indentNodeProp,
  foldNodeProp,
  foldInside,
  delimitedIndent,
  HighlightStyle,
  syntaxHighlighting,
  defaultHighlightStyle,
  syntaxTree
} from "@codemirror/language"
import { CompletionSource, CompletionContext } from "@codemirror/autocomplete"
import { styleTags, tags as t } from "@lezer/highlight"

export const TocLangLanguage = LRLanguage.define({
  parser: parser.configure({
    props: [
      indentNodeProp.add({
        Application: delimitedIndent({ closing: "}", align: false })
      }),
      foldNodeProp.add({
        Application: foldInside
      }),
      styleTags({
        Ident: t.variableName,
        Boolean: t.bool,
        String: t.string,
        Label: t.string,
        ":": t.punctuation,
        "->": t.arithmeticOperator,
        "--": t.arithmeticOperator,
        "<-": t.arithmeticOperator,
        LineComment: t.lineComment,
        "{ }": t.brace
      })
    ]
  }),
  languageData: {
    commentTokens: { line: "#" }
  }
})

export const TOC_LANG_HIGHLIGHT = syntaxHighlighting(
  HighlightStyle.define(
    [
      ...defaultHighlightStyle.specs,
      { tag: t.punctuation, color: "#99b" },
      { tag: t.arithmeticOperator, color: "#686" },
      { tag: t.variableName, color: "#55a" },
      { tag: t.string, color: "#677", fontStyle: "italic" }
    ],
    { themeType: "light" }
  )
)

export function TOC_LANG(options: { idents: string[] }) {
  const autocomplete: CompletionSource = (context: CompletionContext) => {
    let word = context.matchBefore(/\w*/)
    if (word && word.from == word.to && !context.explicit) {
      return null
    }
    return {
      from: word?.from || context.pos,
      options: options.idents.map((ident) => ({ label: ident, type: "Ident" })),
      validFor: /^(\w+)?$/
    }
  }
  const support = [
    TocLangLanguage.data.of({
      autocomplete
    })
  ]
  return new LanguageSupport(TocLangLanguage, support)
}
