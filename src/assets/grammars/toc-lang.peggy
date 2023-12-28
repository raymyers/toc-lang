{
  function makeInteger(o) {
    return parseInt(o.join(""), 10);
  }
}

start
  = statement:statement? moreStatements:(EOL _ @statement)* EOL? _
{
  const statements = statement ? [statement, ...moreStatements] : moreStatements;
  return {
    statements: statements
  };
}

statement = commentLine / nodeStatement / edgeStatement

commentLine = _ "#" text:([^\n\r]*)
{
  return {
    type: "comment",
    text: text.join("")
  };
}

nodeStatement = _ ident:ident _ label:colonLabel _ params:paramBlock? _
  {
    return {
      type: "node",
      id: ident,
      text: label,
      params: params || {}
    };
  }

colonLabel = ":" __ label:label
  {
    return label
  }

edgeStatement = leftEdgeStatement / rightEdgeStatement

leftEdgeStatement = _  toId:ident _ "<-" _ fromIds:ident|.., _ "&&" _| _ label:colonLabel?
  {
    return {
      type: "edge",
      toId: toId,
      text: label || undefined,
      fromIds: fromIds
    };
  }

rightEdgeStatement = _  fromId:ident _ "->" _ toId:ident _ label:colonLabel?
  {
    return {
      type: "edge",
      toId: toId,
      text: label || undefined,
      fromIds: [fromId]
    };
  }

paramBlock = "{"  _ EOL? _ params:param|.., _ "EOL" _| "}" 
{
	return Object.fromEntries(params);
}

param = ident:ident _ ':' _ expression:expression _ EOL? _
{
	return [ident, expression];
}

expression = text:string / num:([0-9]+)
{ return num !== undefined ? makeInteger(num) : text.join(""); }

ident = id:([a-zA-Z0-9_']+)
{ return id.join(""); }

label = str:string / text:([^{\n]*)
{ return text.join(""); }

string = "\"" text:([^"]*) "\""
{ return text.join(""); }

EOL
  = [ \t]* [\n\r]+

_ "optional whitespace"
  = [ \t]*

__ "whitespace"
  = [ \t]+
