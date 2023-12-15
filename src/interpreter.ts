import peggy from "peggy"
import goalTreeGrammarUrl from "./assets/grammars/goal-tree.peggy"
import evaporatingCloudGrammarUrl from "./assets/grammars/evaporating-cloud.peggy"
import problemTreeGrammarUrl from "./assets/grammars/problem-tree.peggy"

/* eslint @typescript-eslint/no-unsafe-argument: 0 */

const loadFile = async (url) => {
  if (process.env.NODE_ENV === "test") {
    // Load the file from the filesystem
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require("fs")
    // project root
    const root = process.cwd()
    const urlSubPath = url.replace(/^\/toc-lang/, "")
    return fs.readFileSync(root + urlSubPath, "utf8")
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

const problemTreeParserPromise = loadFile(problemTreeGrammarUrl).then(
  (peggyGrammar) => {
    return peggy.generate(peggyGrammar)
  }
)

const parsersPromise = Promise.all([
  evaporatingCloudParserPromise,
  goalTreeParserPromise,
  problemTreeParserPromise
]).then(([evaporatingCloud, goalTree, problemTree]) => {
  return {
    "evaporating-cloud": evaporatingCloud,
    "goal-tree": goalTree,
    "problem-tree": problemTree
  }
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
    .filter((statement) => statement.type === "NC" || statement.type === "CSF")
    .forEach((statement) => {
      if (nodeIds.has(statement.id)) {
        throw new Error(`Duplicate node id: ${statement.id}`)
      }
      nodeIds.add(statement.id)
      if (statement.type === "CSF") {
        csfNodeIds.add(statement.id)
      }
    })
  ast.statements
    .filter((statement) => statement.type === "requirement")
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
  annotation?: string
  intermediate?: boolean
}

export interface Edge {
  from: string
  to: string
}

export interface TreeSemantics {
  rankdir: "LR" | "RL" | "TB" | "BT"
  nodes: Map<string, Node>
  edges: Edge[]
}

export const parseGoalTreeSemantics = (ast): TreeSemantics => {
  const nodes = new Map<string, Node>()
  nodes.set("goal", { key: "goal", label: "", annotation: "G" })
  const edges = [] as Edge[]
  if (ast.goal) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
        label: statement.text,
        annotation: statement.type
      })
      edges.push({ from: statement.id, to: "goal" })
    })

  ast.statements
    .filter((s) => s.type === "requirement")
    .forEach((statement) => {
      const nodeKey = statement.id
      if (!nodes.has(nodeKey)) {
        throw new Error(`Node ${nodeKey} not found`)
      }
      for (const reqKey of statement.requirements) {
        if (!nodes.has(reqKey)) {
          throw new Error(`Requirement ${reqKey} not found`)
        }
        edges.push({ from: reqKey, to: nodeKey })
      }
    })
  ast.statements
    .filter((s) => s.type === "status")
    .forEach((statement) => {
      const nodeKey = statement.id
      const node = nodes.get(nodeKey)
      if (!node) {
        throw new Error(`Node ${nodeKey} not found`)
      }

      node.statusPercentage = statement.percentage
    })
  return { nodes, edges, rankdir: "BT" }
}

export const parseProblemTreeSemantics = (ast): TreeSemantics => {
  const nodes = new Map<string, Node>()
  const edges = [] as Edge[]

  ast.statements
    .filter((s) => s.type === "UDE" || s.type === "DE" || s.type === "FOL")
    .forEach((statement) => {
      nodes.set(statement.id, {
        annotation: statement.type,
        key: statement.id,
        label: statement.text
      })
    })
  ast.statements
    .filter((s) => s.type === "C")
    .forEach((statement) => {
      nodes.set(statement.id, {
        key: statement.id,
        label: statement.text
      })
    })

  ast.statements
    .filter((s) => s.type === "cause")
    .forEach((statement) => {
      const effectKey = statement.effectId
      let keyToConnect = effectKey
      if (statement.causes.length > 1) {
        const combinedId = statement.causes.join("_") + "_cause_" + effectKey
        keyToConnect = combinedId
        nodes.set(combinedId, {
          key: combinedId,
          label: "AND",
          intermediate: true
        })
        edges.push({ from: combinedId, to: effectKey })
      }
      for (const causeKey of statement.causes) {
        if (!nodes.has(causeKey)) {
          throw new Error(`Cause ${causeKey} not declared`)
        }
        if (!nodes.has(effectKey)) {
          throw new Error(`Effect ${effectKey} not declared`)
        }
        edges.push({ from: causeKey, to: keyToConnect })
      }
    })
  return { nodes, edges, rankdir: "BT" }
}

export const parseTextToAst = async (parserType, code) => {
  const parser = (await parsersPromise)[parserType]
  // handle null parser as unknown parser type
  const ast = parser.parse(code)
  return ast
}
