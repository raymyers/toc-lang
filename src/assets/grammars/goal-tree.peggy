
{
  function makeInteger(o) {
    return parseInt(o.join(""), 10);
  }
}

start
  = statement:statement? moreStatements:(EOL @statement)* EOL? _
{
  const statements = statement ? [statement, ...moreStatements] : moreStatements;
  return {
    goal: statements.find(s => s.type === "node" && s.nodeType === "goal") || null,
    statements: statements
  };
}

statement = commentLine / nodeStatement / edgeStatement / statusStatement

commentLine = _ "#" text:([^\n\r]*)
{
  return {
    type: "comment",
    text: text.join("")
  };
}

nodeStatement = _ ident:ident _ ':' _ text:label
  {
    const lowerId = ident.toLowerCase();
    const nodeType = 'goal' === lowerId ? 'goal' : lowerId.startsWith('csf_') ? 'csf' : 'nc';
    return {
      type: "node",
      nodeType: nodeType,
      id: ident,
      text: text
    };
  }
edgeStatement = _ toId:ident _ '<-' _ fromId:ident
  {
    return {
      type: "edge",
      toId: toId,
      fromId: fromId
    };
  }

statusStatement = _ ident:ident _ "has" _ "status" _ percentage:percentage
  {
    return {
      type: "status",
      id: ident,
      percentage: percentage
    };
}

requirements
  = _ ident:ident tail:(_ "and" _ @ident)*
  {
    return [ident, ...tail];
  }

ident = id:([a-zA-Z0-9_]+)
{ return id.join(""); }

label = string / text:([^{\n]*)
{ return text.join(""); }

string = "\"" text:([^"]*) "\""
{ return text.join(""); }

percentage 
    = _ digits:([0-9]+)"%" _ { return makeInteger(digits); }
  

EOL
  = [ \t]* [\n\r]+

_ "whitespace"
  = [ \t]*