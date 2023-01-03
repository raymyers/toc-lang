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

export const checkGoalTreeSemantics = (ast) => {
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

export interface Node {
  key: string
  label: string
  statusPercentage?: number
}

export interface Edge {
  from: string
  to: string
}

export const parseGoalTreeSemantics = (ast) => {
  const nodes = new Map<string, Node>()
  nodes.set("goal", { key: "goal", label: "" })
  const edges = [] as Edge[]
  if (ast.goal) {
    nodes.get("goal")!.label = ast.goal.text
  }

  ast.statements
    .filter((s) => s.type === "NC")
    .forEach((statement) => {
      nodes.set(statement.id, {
        key: statement.id,
        label: statement.text
      })
    })

  ast.statements
    .filter((s) => s.type === "CSF")
    .forEach((statement) => {
      nodes.set(statement.id, {
        key: statement.id,
        label: statement.text
      })
      edges.push({ from: "goal", to: statement.id })
    })

  ast.statements
    .filter((s) => s.type === "requirement")
    .forEach((statement) => {
      const nodeKey = statement.id
      for (const reqKey of statement.requirements) {
        edges.push({ from: nodeKey, to: reqKey })
      }
    })
  ast.statements
    .filter((s) => s.type === "status")
    .forEach((statement) => {
      const nodeKey = statement.id
      const node = nodes[nodeKey]
      node.statusPercentage = statement.percentage
    })
  return { nodes, edges }
}

export const parseTextToAst = async (parserType, code) => {
  const parser = (await parsersPromise)[parserType]
  // handle null parser as unknown parser type
  const ast = parser.parse(code)
  return ast
}
