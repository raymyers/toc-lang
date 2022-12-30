import './App.css'
import React from 'react'
import Tree from "./Tree";
import Editor from "./Editor";
import { parseTextToAst, checkSemantics } from "./interpreter";

function App() {
  const [ast, setAst] = React.useState(null);
  const [error, setError] = React.useState("");
  const onEditorChange = async (value) => {
    try {
    const parsed = await parseTextToAst(value);
    checkSemantics(parsed);
    console.log(parsed);
    setAst(parsed);
    setError("");
    } catch (e) {
      setError(e.toString());
    }
  };
  return (
    <div className="App">
      <div className="flex-row">
        <div className="flex-1">
          <Editor onChange={onEditorChange} cols="50" rows="20" error={error}/>
        </div>
        <div className="flex-1">
          <Tree ast={ast} />
        </div>
        
      </div>
      
    </div>
  );
}
//   return (
//     <div className="App">
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.tsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </div>
//   )
// }

export default App
