import peggy from "peggy"
import goalTreeGrammarUrl from "./assets/grammars/goal-tree.peggy"
import evaporatingCloudGrammarUrl from "./assets/grammars/evaporating-cloud.peggy"
import tocLangGrammarUrl from "./assets/grammars/toc-lang.peggy"
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

const tocLangParserPromise = loadFile(tocLangGrammarUrl).then(
  (peggyGrammar) => {
    return peggy.generate(peggyGrammar)
  }
)

const parsersPromise = Promise.all([
  evaporatingCloudParserPromise,
  tocLangParserPromise,
  tocLangParserPromise
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
  
  const nodeType = goalTreeNodeType;
  const goalStatement = ast.statements.find((s) => nodeType(s) == 'goal')
  if (!goalStatement) {
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
    const curNodeType = nodeType(statement);
    if (
      statement.type === "node" && !validNodeTypes.includes(curNodeType || '')
    ) {
      throw new Error(
        `Invalid node type: ${curNodeType} for label ${statement.text} must be in ${validNodeTypes}`
      )
    }
  })
  ast.statements
    .filter(
      (statement) => statement.type === "node" && nodeType(statement) != "goal"
    )
    .forEach((statement) => {
      if (nodeIds.has(statement.id)) {
        throw new Error(`Duplicate node id: ${statement.id}`)
      }
      nodeIds.add(statement.id)
      if (nodeType(statement) === "csf") {
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
      const reqId = statement.fromIds[0]
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

const goalTreeNodeType = (statement) => {
  if (statement.type != "node") {
    return null;
  }
  const lowerId = statement.id.toLowerCase();
  return  'goal' === lowerId ? 'goal' : lowerId.startsWith('csf_') ? 'csf' : 'nc';
} 

export const parseGoalTreeSemantics = (ast): TreeSemantics => {
  const nodes = new Map<string, Node>()
  nodes.set("goal", { key: "goal", label: "", annotation: "G" })
  const edges = [] as Edge[]
  const nodeType = goalTreeNodeType;
  const goalStatement = ast.statements.find((s) => nodeType(s) == 'goal')
  if (goalStatement) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    nodes.get("goal")!.label = goalStatement.text
    // nodes.get("goal")!.statusPercentage = ast.goal.params.status
  }

  ast.statements
    .filter((s) => s.type === "node" && nodeType(s) === "nc")
    .forEach((statement) => {
      nodes.set(statement.id, {
        key: statement.id,
        label: statement.text,
        statusPercentage: statement.params.status
      })
    })

  ast.statements
    .filter((s) => s.type === "node" && nodeType(s) === "csf")
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
      if (statement.fromIds.length !== 1) {
        throw new Error(`Edges must have exactly one 'from' node in a Goal Tree`)
      }
      const reqKey = statement.fromIds[0]
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
      return id.match(pattern)[0].toUpperCase()
    }
    return undefined
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
