import React from "react"
import CodeMirror from "@uiw/react-codemirror"
import { fileOpen, directoryOpen, fileSave, supported } from "browser-fs-access"
import FileControls from "./FileControls"
import {
  exampleEvaporatingCloudText,
  exampleGoalTreeText,
  exampleProblemTreeText
} from "./examples"
import { TOC_LANG, TOC_LANG_HIGHLIGHT } from "./highlight"
/* eslint react/prop-types: 0 */

// const debounce = (func, wait) => {
//   let timeout
//   return (...args) => {
//     const later = () => {
//       func(...args)
//     }
//     clearTimeout(timeout)
//     timeout = setTimeout(later, wait)
//   }
// }

// React functional component to edit text and make the result available to the parent

// Props:
// - text: the text to edit
// - onChange: a function to call when the text changes
// - placeholder: the placeholder text to display when the text is empty
// - style: the CSS style to apply to the text area
// - rows: the number of rows to display
// - cols: the number of columns to display
// - disabled: whether the text area is disabled
// - autoFocus: whether the text area should be focused when the component is mounted
export const EditorContainer = ({
  onChange,
  placeholder = "",
  rows = 20,
  disabled = false,
  autoFocus = false,
  text,
  setText,
  error
}) => {
  React.useEffect(() => {
    onChange(text)
  }, [text])

  function handleEditorChange(value, event) {
    console.log("here is the current model value:", value)
    setText(value)
    onChange(value)
  }

  async function handleLoad() {
    const file = await fileOpen()
    const text = await file.text()
    setText(text)
    onChange(text)
  }

  async function handleSave() {
    await fileSave(new Blob([text], { type: "text/plain" }), {
      fileName: "document.txt",
      extensions: [".txt"]
    })
  }

  const examplesByType = {
    conflict: exampleEvaporatingCloudText,
    goal: exampleGoalTreeText,
    problem: exampleProblemTreeText
  }
  async function handleSelectExample(example) {
    if (example in examplesByType) {
      handleEditorChange(examplesByType[example], undefined)
    }
  }

  React.useEffect(() => {
    handleSelectExample("goal")
  }, [])

  return (
    <div className="editor">
      <FileControls
        onLoad={handleLoad}
        onSave={handleSave}
        onSelectExample={handleSelectExample}
      />
      <CodeMirror
        value={text}
        height="80vh"
        extensions={[TOC_LANG(), TOC_LANG_HIGHLIGHT]}
        onChange={handleEditorChange}
      />
      <p className={`edit-result ${error ? "error" : ""}`}>{error}</p>
    </div>
  )
}

export default EditorContainer
