
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

statement = commentLine / nodeStatement / edgeStatement

commentLine = _ "#" text:([^\n\r]*)
{
  return {
    type: "comment",
    text: text.join("")
  };
}

nodeStatement = _ ident:ident _ ':' _ text:label _ params:nodeParams?
  {
    const lowerId = ident.toLowerCase();
    const nodeType = 'goal' === lowerId ? 'goal' : lowerId.startsWith('csf_') ? 'csf' : 'nc';
    return {
      type: "node",
      nodeType: nodeType,
      id: ident,
      text: text,
      params: params || {}
    };
  }
  
nodeParams = "{" nodeParam:nodeParam moreNodeParams:(EOL @nodeParam)* ','? "}" 
{
	return Object.fromEntries([nodeParam, ...moreNodeParams]);
}

nodeParam = _ EOL? _ ident:ident _ ':' _ expression:expression _ EOL? _
{
	return [ident, expression];
}
edgeStatement = _ toId:ident _ '<-' _ fromId:ident
  {
    return {
      type: "edge",
      toId: toId,
      fromId: fromId
    };
  }

requirements
  = _ ident:ident tail:(_ "and" _ @ident)*
  {
    return [ident, ...tail];
  }

expression = text:string / num:([0-9]+)
{ return num !== undefined ? makeInteger(num) : text.join(""); }

ident = id:([a-zA-Z0-9_]+)
{ return id.join(""); }

label = string / text:([^{\n]*)
{ return text.join(""); }

string = "\"" text:([^"]*) "\""
{ return text.join(""); }

EOL
  = [ \t]* [\n\r]+

_ "whitespace"
  = [ \t]*