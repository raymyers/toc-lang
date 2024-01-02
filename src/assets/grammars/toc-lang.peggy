// Debug with PeggyJs sandbox
// https://peggyjs.org/online.html

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

edgeStatement = leftEdgeStatement / rightEdgeStatement / biDirEdgeStatement

leftEdgeStatement = _  toId:ident _ "<-" _ fromIds:ident|.., _ "&&" _| _ label:colonLabel?
  {
    return {
      type: "edge",
      toId: toId,
      text: label || undefined,
      fromIds: fromIds
    };
  }

rightEdgeStatement = _  fromIds:ident|.., _ "&&" _| _ "->" _ toId:ident _ label:colonLabel?
  {
    return {
      type: "edge",
      toId: toId,
      text: label || undefined,
      fromIds: fromIds
    };
  }

biDirEdgeStatement = _  fromId:ident _ "--" _ toId:ident _ label:colonLabel?
  {
    return {
      type: "edge",
      toId: toId,
      text: label || undefined,
      fromIds: [fromId],
      biDirectional: true
    };
  }


paramBlock = "{"  _ EOL? _ params:param|.., _ "EOL" _| "}" 
{
	return Object.fromEntries(params);
}

param = ident:ident _ ':' _ expression:(num/label) _ EOL? _
{
	return [ident, expression];
}

num =  num:([0-9]+)
{ return makeInteger(num); }

ident = id:([a-zA-Z0-9_']+)
{ return id.join(""); }

label = str:string / text:([^{}\n]*)
{ return text.join("").trim(); }

string = "\"" text:([^"]*) "\""
{ return text.join(""); }

EOL
  = [ \t]* [\n\r]+

_ "optional whitespace"
  = [ \t]*

__ "whitespace"
  = [ \t]+
