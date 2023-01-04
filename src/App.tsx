import "./App.css"
import React from "react"

import Editor from "./Editor"

import {
  parseTextToAst,
  parseGoalTreeSemantics,
  parseProblemTreeSemantics,
  TreeSemantics
} from "./interpreter"
import { Diagram } from "./Diagram"

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

# This is probably the wrong place for 'retain'
features requires retain

revUp requires newCust and keepCust
costsDown requires reduceInfra
retain requires marketSalary and morale
`

const exampleEvaporatingCloudText = `
A is "Maximize business performance"

A requires B, "Subordinate all decisions to the financial goal"

A requires C, "Ensure people are in a state of optimal performance"

B requires D, "Subordinate people's needs to the financial goal"
inject "Psychological flow triggers"

C requires D', "Attend to people's needs (& let people work)"

D conflicts with D'
`

const exampleProblemTreeText = `
UDE bad is "Bad user experience"
C cluttered is "Cluttered interface"
cluttered causes bad
C ux is "Low investment in UX design"
C features is "Many features added"
ux and features cause cluttered
`

function App () {
  const [ast, setAst] = React.useState(null)
  const [semantics, setSemantics] = React.useState<TreeSemantics | null>(null)
  const [error, setError] = React.useState("")
  const [text, setText] = React.useState(exampleEvaporatingCloudText)
  const [diagramType, setDiagramType] = React.useState("evaporatingCloud")
  const onEditorChange = async (value) => {
    try {
      const parsed = await parseTextToAst(diagramType, value)
      if (diagramType === "goalTree") {
        setSemantics(parseGoalTreeSemantics(parsed))
      }
      if (diagramType === "problemTree") {
        setSemantics(parseProblemTreeSemantics(parsed))
      }
      console.log(parsed)
      setAst(parsed)
      setError("")
    } catch (e) {
      setError(e.toString())
    }
  }
  const changeDiagramType = async (type) => {
    setAst(null)
    setSemantics(null)

    setDiagramType(type)
    const examplesByType = {
      evaporatingCloud: exampleEvaporatingCloudText,
      goalTree: exampleGoalTreeText,
      problemTree: exampleProblemTreeText
    }
    setText(examplesByType[type])
    // onEditorChange(examplesByType[type])
  }
  return (
    <div className="App">
      <div className="flex-row nav">
        <div className="nav-item">
          <button
            onClick={() => {
              changeDiagramType("evaporatingCloud")
            }}
          >
            Evaporating Cloud
          </button>
        </div>
        <div className="nav-item">
          <button
            onClick={() => {
              changeDiagramType("goalTree")
            }}
          >
            Goal Tree
          </button>
        </div>
        <div className="nav-item">
          <button
            onClick={() => {
              changeDiagramType("problemTree")
            }}
          >
            Problem Tree
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
          <Diagram ast={ast} semantics={semantics} diagramType={diagramType} />
        </div>
      </div>
    </div>
  )
}
export default App
