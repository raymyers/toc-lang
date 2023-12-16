import "./App.css"
import React from "react"
import { useLoaderData } from "react-router-dom"
import Editor from "./Editor"
import { Diagram } from "./Diagram"
import {exampleEvaporatingCloudText, exampleGoalTreeText, exampleProblemTreeText} from './examples';
import {
  parseTextToAst,
  parseGoalTreeSemantics,
  parseProblemTreeSemantics,
  type TreeSemantics
} from "./interpreter"

export async function loader({ params }) {
  const examplesByType = {
    "evaporating-cloud": exampleEvaporatingCloudText,
    "goal-tree": exampleGoalTreeText,
    "problem-tree": exampleProblemTreeText
  }

  return {
    diagramType: params.diagramType,
    example: examplesByType[params.diagramType]
  }
}

interface loadedExample {
  diagramType: string
  example: string
}

function Draw() {
  const { diagramType, example } = useLoaderData() as loadedExample
  console.log("diagramType", diagramType)
  const [ast, setAst] = React.useState<any>(null)
  const [semantics, setSemantics] = React.useState<TreeSemantics | null>(null)
  const [error, setError] = React.useState("")
  const [text, setText] = React.useState<string>()
  React.useEffect(() => {
    setText(example)
  }, [diagramType])

  const onEditorChange = async (value) => {
    try {
      const parsed = await parseTextToAst(diagramType, value)
      if (diagramType === "goal-tree") {
        setSemantics(parseGoalTreeSemantics(parsed))
      } else if (diagramType === "problem-tree") {
        setSemantics(parseProblemTreeSemantics(parsed))
      } else {
        setSemantics(null)
      }
      console.log(parsed)
      setAst(parsed)
      setError("")
    } catch (e) {
      console.error(e)
      setError(e.toString() as string)
    }
  }
  //   const changeDiagramType = async (type) => {
  //     setAst(null)
  //     setSemantics(null)

  //     setDiagramType(type)
  //     const examplesByType = {
  //       evaporatingCloud: exampleEvaporatingCloudText,
  //       goalTree: exampleGoalTreeText,
  //       problemTree: exampleProblemTreeText
  //     }
  //     setText(examplesByType[type])
  //     // onEditorChange(examplesByType[type])
  //   }
  return (
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
  )
}

export default Draw
