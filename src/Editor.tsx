import React from "react";

const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    const later = () => {
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

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

export const Editor = ({
  onChange,
  placeholder = "",
  rows = 20,
  disabled = false,
  autoFocus = false,
  text,
  setText,
  error,
}) => {
  React.useEffect(() => {
    // Run once.
    onChange(text);
  }, []);
  const handleChange = (event) => {
    setText(event.target.value);
    // Call the onChange function with the new text, debounced by 500ms
    // debounce(onChange, 500)(event.target.value);
    onChange(event.target.value);
  };

  return (
    <div className="editor">
      <textarea
        style={{ width: "100%", height: "100%", resize: "none" }}
        rows={rows}
        value={text}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
      />
      <p className={`edit-result ${error ? "error" : ""}`}>{error}</p>
    </div>
  );
};

export default Editor;
