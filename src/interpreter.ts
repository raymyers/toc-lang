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
  const validTypes = ["node", "edge", "comment"]
  const validNodeTypes = ["nc", "goal", "csf"]
  ast.statements.forEach((statement) => {
    if (!validTypes.includes(statement.type)) {
      throw new Error(
        `Invalid statement type: ${statement.type}, must be in ${validTypes}`
      )
    }
    if (
      statement.type === "node" &&
      !validNodeTypes.includes(statement.nodeType)
    ) {
      throw new Error(
        `Invalid node type: ${statement.nodeType}, must be in ${validNodeTypes}`
      )
    }
  })
  ast.statements
    .filter(
      (statement) => statement.type === "node" && statement.nodeType != "goal"
    )
    .forEach((statement) => {
      if (nodeIds.has(statement.id)) {
        throw new Error(`Duplicate node id: ${statement.id}`)
      }
      nodeIds.add(statement.id)
      if (statement.nodeType === "csf") {
        csfNodeIds.add(statement.id)
      }
    })
  ast.statements
    .filter((statement) => statement.type === "edge")
    .forEach((statement) => {
      const nodeId = statement.toId
      if (!nodeIds.has(nodeId)) {
        throw new Error(`Requirement ${nodeId} not found`)
      }
      const reqId = statement.fromId
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
    nodes.get("goal")!.statusPercentage = ast.goal.params.status
  }

  ast.statements
    .filter((s) => s.type === "node" && s.nodeType === "nc")
    .forEach((statement) => {
      nodes.set(statement.id, {
        key: statement.id,
        label: statement.text,
        statusPercentage: statement.params.status
      })
    })

  ast.statements
    .filter((s) => s.type === "node" && s.nodeType === "csf")
    .forEach((statement) => {
      nodes.set(statement.id, {
        key: statement.id,
        label: statement.text,
        annotation: "CSF",
        statusPercentage: statement.params.status
      })
      edges.push({ from: statement.id, to: "goal" })
    })

  ast.statements
    .filter((s) => s.type === "edge")
    .forEach((statement) => {
      const nodeKey = statement.toId
      if (!nodes.has(nodeKey)) {
        throw new Error(`Node ${nodeKey} not found`)
      }
      const reqKey = statement.fromId
      if (!nodes.has(reqKey)) {
        throw new Error(`Requirement ${reqKey} not found`)
      }
      edges.push({ from: reqKey, to: nodeKey })
    })
  return { nodes, edges, rankdir: "BT" }
}

export const parseProblemTreeSemantics = (ast): TreeSemantics => {
  const nodes = new Map<string, Node>()
  const edges = [] as Edge[]
  const findNodeAnnotation = (id) => {
    const pattern = /^(UDE|FOL|DE)/i
    if (id.match(pattern)) {
      return id.match(pattern)[0].toUpperCase();
    }
    return undefined;
  }
  ast.statements
    .filter((s) => s.type === "node")
    .forEach((statement) => {
      nodes.set(statement.id, {
        annotation: findNodeAnnotation(statement.id),
        key: statement.id,
        label: statement.text
      })
    }) 

  ast.statements
    .filter((s) => s.type === "edge")
    .forEach((statement) => {
      const effectKey = statement.toId
      let keyToConnect = effectKey
      if (statement.fromIds.length > 1) {
        const combinedId = statement.fromIds.join("_") + "_cause_" + effectKey
        keyToConnect = combinedId
        nodes.set(combinedId, {
          key: combinedId,
          label: "AND",
          intermediate: true
        })
        edges.push({ from: combinedId, to: effectKey })
      }
      for (const causeKey of statement.fromIds) {
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
