import React from "react"
import Editor from '@monaco-editor/react';

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
    // At some point we disabled debounce... why?
    // debounce(onChange, 500)(evnt.target.value);
    console.log('here is the current model value:', value);
    setText(value)
    onChange(value)
  }
  return (
    <div className="editor">
      <Editor
        theme="vs-light"
        height="60vh"
        defaultValue={text}
        onChange={handleEditorChange}
      />
      <p className={`edit-result ${error ? "error" : ""}`}>{error}</p>
    </div>
  )
}

export default EditorContainer
