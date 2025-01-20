import "./App.css"
import React from "react"
import Editor from "./Editor"
import { Diagram } from "./Diagram"
import { Container, Section, Bar } from "@column-resizer/react"
import {
  parseTextToAst,
  parseGoalTreeSemantics,
  parseProblemTreeSemantics,
  type TreeSemantics
} from "./interpreter"

function Draw() {
  const [ast, setAst] = React.useState<any>(null)
  const [semantics, setSemantics] = React.useState<TreeSemantics | null>(null)
  const [error, setError] = React.useState("")
  const [text, setText] = React.useState<string>()
  const [diagramType, setDiagramType] = React.useState<string | null>()

  const onEditorChange = async (value) => {
    try {
      const { ast, type } = await parseTextToAst(value)
      console.log("diagramType", type)
      if (type === "goal") {
        setSemantics(parseGoalTreeSemantics(ast))
      } else if (type === "problem") {
        setSemantics(parseProblemTreeSemantics(ast))
      } else {
        setSemantics(null)
        setDiagramType(null)
      }
      console.log(ast)
      setAst(ast)
      setDiagramType(type)
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
    <Container>
      <Section minSize={50}>
        <Editor
          onChange={onEditorChange}
          rows={20}
          text={text}
          setText={setText}
          error={error}
        />
      </Section>
      <Bar size={4} style={{ background: "#ddd", cursor: "col-resize" }} />
      <Section minSize={100}>
        <Diagram ast={ast} semantics={semantics} diagramType={diagramType} />
      </Section>
    </Container>
  )
}

export default Draw
