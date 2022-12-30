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
const exampleText = 
`Goal is "Make money now and in the future"
CSF revUp is "Generate more revenue"
CSF costsDown is "Control costs"
NC keepCust is "Protect relationship with existing customers"
NC newCust is "Acquire new customers"

NC reduceInfra is "Reduce infrastructure spending"
NC retain is "Retain employees"
NC marketSalary is "Keep up with market salaries"

NC morale is "Maintain employee morale"
NC features is "Develop new features"

newCust requires features
features requires retain
revUp requires newCust and keepCust
costsDown requires reduceInfra
retain requires marketSalary and morale
`
// React functional component to edit text and make the result available to the parent

// Props:
// - text: the text to edit
// - onChange: a function to call when the text changes
// - placeholder: the placeholder text to display when the text is empty
// - className: the CSS class to apply to the text area
// - style: the CSS style to apply to the text area
// - rows: the number of rows to display
// - cols: the number of columns to display
// - disabled: whether the text area is disabled
// - autoFocus: whether the text area should be focused when the component is mounted

export const Editor = ({ onChange, placeholder, className, rows, cols, disabled, autoFocus, error }) => {
    const [text, setText] = React.useState(exampleText);
    React.useEffect(() => {
        // Run once.
        onChange(exampleText);
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
                className={className}
                style={{width: "100%", height: "100%", resize: "none"}}
                rows={rows}
                // cols={cols}
                value={text}
                onChange={handleChange}
                placeholder={placeholder}
                disabled={disabled}
                autoFocus={autoFocus}
            />
            <p className={`edit-result ${error ? 'error': ''}`}>
                {error}
            </p>
            
        </div>
    );
}

export default Editor;