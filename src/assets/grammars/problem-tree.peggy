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

nodeStatement = _ ident:ident _ ":" __ label:label
  {
    return {
      type: "node",
      id: ident,
      text: label
    };
  }
edgeStatement = _  toId:ident _ "<-" _ fromIds:ident|.., _ "&&" _|
  {
    return {
      type: "edge",
      toId: toId,
      fromIds: fromIds
    };
  }

ident = id:([a-zA-Z0-9_]+)
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
