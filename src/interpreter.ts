import peggy from "peggy"
import goalTreeGrammarUrl from "./assets/grammars/goal-tree.peggy"
import evaporatingCloudGrammarUrl from "./assets/grammars/evaporating-cloud.peggy"

const loadFile = async (url) => {
  if (process.env.NODE_ENV === "test") {
    // Load the file from the filesystem
    const fs = require("fs")
    // project root
    const root = process.cwd()
    return fs.readFileSync(root + url, "utf8")
  } else {
    const response = await fetch(url)
    return await response.text()
  }
}

const evaporatingCloudParserPromise = loadFile(evaporatingCloudGrammarUrl).then(
  (peggyGrammar) => {
    return peggy.generate(peggyGrammar)
  }
)

const goalTreeParserPromise = loadFile(goalTreeGrammarUrl).then(
  (peggyGrammar) => {
    return peggy.generate(peggyGrammar)
  }
)

const parsersPromise = Promise.all([
  evaporatingCloudParserPromise,
  goalTreeParserPromise
]).then(([evaporatingCloud, goalTree]) => {
  return { evaporatingCloud, goalTree }
})

const checkGoalTreeSemantics = (ast) => {
  if (!ast) {
    throw new Error("ast is null")
  }
  if (!ast.goal) {
    throw new Error("Goal must be specified")
  }
  const nodeIds = new Set()
  const csfNodeIds = new Set()
  ast.statements
    .filter((statement) => statement.type == "NC" || statement.type == "CSF")
    .forEach((statement) => {
      if (nodeIds.has(statement.id)) {
        throw new Error(`Duplicate node id: ${statement.id}`)
      }
      nodeIds.add(statement.id)
      if (statement.type == "CSF") {
        csfNodeIds.add(statement.id)
      }
    })
  ast.statements
    .filter((statement) => statement.type == "requirement")
    .forEach((statement) => {
      const nodeId = statement.id
      if (!nodeIds.has(nodeId)) {
        throw new Error(`Requirement ${nodeId} not found`)
      }
      statement.requirements.forEach((reqId) => {
        if (nodeId === reqId) {
          throw new Error(`${nodeId} cannot require itself`)
        }
        if (!nodeIds.has(reqId)) {
          throw new Error(`Requirement ${reqId} not found for node ${nodeId}`)
        }
        if (csfNodeIds.has(reqId)) {
          throw new Error(
            `${nodeId} cannot require ${reqId}, because CSFs are only required by the Goal`
          )
        }
      })
    })
  nodeIds.add("goal")
}

const parseTextToAst = async (parserType, code) => {
  const parser = (await parsersPromise)[parserType]
  // handle null parser as unknown parser type
  const ast = parser.parse(code)
  return ast
}

export { parseTextToAst, checkGoalTreeSemantics }
