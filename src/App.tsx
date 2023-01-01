import "./App.css";
import React from "react";
import Tree from "./Tree";
import Editor from "./Editor";
import Cloud from "./Cloud";
import { parseTextToAst, checkGoalTreeSemantics } from "./interpreter";

const exampleGoalTreeText = `Goal is "Make money now and in the future"
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
`;

const exampleEvaporatingCloudText = `
A is "Maximize business performance"

A requires B, "Subordinate all decisions to the financial goal"

A requires C, "Ensure people are in a state of optimal performance"

B requires D, "Subordinate people's needs to the financial goal"
inject "Psychological flow triggers"

C requires D', "Attend to people's needs (& let people work)"

D conflicts with D'
`;

function App() {
  const [ast, setAst] = React.useState(null);
  const [error, setError] = React.useState("");
  const [text, setText] = React.useState(exampleEvaporatingCloudText);
  const [diagramType, setDiagramType] = React.useState("evaporatingCloud");
  const onEditorChange = async (value) => {
    try {
      const parsed = await parseTextToAst(diagramType, value);
      if (diagramType === "goalTree") {
        checkGoalTreeSemantics(parsed);
      }
      console.log(parsed);
      setAst(parsed);
      setError("");
    } catch (e) {
      setError(e.toString());
    }
  };
  const changeDiagramType = (type) => {
    const examplesByType = {
      evaporatingCloud: exampleEvaporatingCloudText,
      goalTree: exampleGoalTreeText,
    };
    setAst(null);
    setText(examplesByType[type]);
    setDiagramType(type);
    onEditorChange(examplesByType[type]);
  };

  return (
    <div className="App">
      <div className="flex-row nav">
        <div className="flex-1">
          <button
            onClick={() => {
              changeDiagramType("evaporatingCloud");
            }}
          >
            Evaporating Cloud
          </button>
        </div>
        <div className="flex-1">
          <button
            onClick={() => {
              changeDiagramType("goalTree");
            }}
          >
            Goal Tree
          </button>
        </div>
      </div>
      <div className="flex-row">
        <div className="flex-1">
          <Editor
            onChange={onEditorChange}
            rows={20}
            text={text}
            setText={setText}
            error={error}
          />
        </div>
        <div className="flex-1">
          {diagramType === "evaporatingCloud" && <Cloud ast={ast} />}
          {diagramType === "goalTree" && <Tree ast={ast} />}
        </div>
      </div>
    </div>
  );
}
export default App;
