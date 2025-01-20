import peggy from "peggy"
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

const tocLangParserPromise = loadFile(tocLangGrammarUrl).then(
  (peggyGrammar) => {
    return peggy.generate(peggyGrammar)
  }
)

const parsersPromise = Promise.all([tocLangParserPromise]).then(([tocLang]) => {
  return {
    conflict: tocLang,
    goal: tocLang,
    problem: tocLang
  }
})

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

export type EDiagramType = "problem" | "conflict" | "goal"

export interface ParseResult {
  ast: Ast
  type: EDiagramType
}

const isGoalNodeStatement = (s) =>
  s.type === "node" && normalizeId(s.id) === "goal"
const normalizeId = (id) => (id && id.toLowerCase() === "goal" ? "Goal" : id)

export const parseGoalTreeSemantics = (ast): TreeSemantics => {
  const nodes = new Map<string, Node>()
  nodes.set("Goal", { key: "Goal", label: "", annotation: "G" })
  const edges = [] as Edge[]
  const goalStatement = ast.statements.find(isGoalNodeStatement)
  if (goalStatement) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    nodes.get("Goal")!.label = goalStatement.text
    // nodes.get("goal")!.statusPercentage = ast.goal.params.status
  }

  ast.statements
    .filter((s) => s.type === "node")
    .forEach((statement) => {
      const node: Node = {
        key: statement.id,
        label: statement.text
      }
      if (statement.params.class) {
        node.annotation = statement.params.class
      }
      if (statement.id === "Goal") {
        node.annotation = "G"
      }
      if (statement.params.status || statement.params.status === 0) {
        node.statusPercentage = statement.params.status
      }
      nodes.set(statement.id, node)
    })

  ast.statements
    .filter((s) => s.type === "edge")
    .forEach((statement) => {
      const nodeKey = statement.toId
      if (!nodes.has(nodeKey)) {
        throw new Error(`Node ${nodeKey} not found`)
      }
      if (statement.fromIds.length !== 1) {
        throw new Error(
          `Edges must have exactly one 'from' node in a Goal Tree`
        )
      }
      const reqKey = statement.fromIds[0]
      if (!nodes.has(reqKey)) {
        throw new Error(`Requirement ${reqKey} not found`)
      }
      if (nodeKey === "Goal") {
        nodes.get(reqKey)!.annotation = "CSF"
      }
      edges.push({ from: reqKey, to: nodeKey })
    })
  return { nodes, edges, rankdir: "BT" }
}

export const parseProblemTreeSemantics = (ast): TreeSemantics => {
  const nodes = new Map<string, Node>()
  const edges = [] as Edge[]
  const findNodeAnnotation = (statement: StatementAst) => {
    const pattern = /^(UDE|FOL|DE)/i
    if (
      typeof statement.params?.class === "string" &&
      statement.params?.class?.match(pattern)
    ) {
      return statement.params.class.match(pattern)![0].toUpperCase()
    }
    return undefined
  }
  ast.statements
    .filter((s) => s.type === "node")
    .forEach((statement) => {
      nodes.set(statement.id, {
        annotation: findNodeAnnotation(statement),
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

interface Ast {
  statements: StatementAst[]
}

interface StatementAst {
  type: "node" | "edge" | "comment"
  id?: string
  text: string
  fromIds?: string[]
  toId?: string
  biDir?: boolean
  params?: ParamsAst
}

type ParamsAst = Record<string, number | string>

const normalizeAstIds = (ast: Ast): Ast => {
  const { statements: oldStatments, ...etc } = ast
  const statements = oldStatments.map((s: StatementAst) => {
    const { id, fromIds, toId, ...etc } = s
    const result: StatementAst = {
      ...etc
    }
    if (id) {
      result.id = normalizeId(id)
    }
    if (toId) {
      result.toId = normalizeId(toId)
    }
    if (fromIds) {
      result.fromIds = fromIds.map(normalizeId)
    }
    return result
  })
  return {
    statements,
    ...etc
  }
}

export const parseTextToAst = async (
  code: string | unknown
): Promise<ParseResult> => {
  if (typeof code !== "string") {
    throw Error("Code missing")
  }
  // Since we don't have the full parsers yet, using a RegEx.
  // This could false match on a comment or something but fine for now.
  const typeMatch = code.match(/\btype:\s*(\w+)\b/)
  if (!typeMatch) {
    throw Error("Type declaration missing")
  }
  const parserType: string = typeMatch[1]
  if (["problem", "conflict", "goal"].includes(parserType)) {
    const parserEType = parserType as EDiagramType

    const parser: peggy.Parser = (await parsersPromise)[parserType]
    const ast = parser.parse(code)
    const normalizeAst = normalizeAstIds(ast)
    const statements = normalizeAst.statements.filter((s) => s.id !== "type")
    return { ast: { statements }, type: parserEType }
  } else {
    throw Error(
      `Invalid type '${parserType}'. Must be one of: problem, conflict, goal`
    )
  }
}
