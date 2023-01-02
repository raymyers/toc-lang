
start
  = statement:statement? moreStatements:(EOL @statement)* EOL? _
{
  if (!statement) return { statements: moreStatements };
  return {
    statements: [statement, ...moreStatements]
  };
}

statement = commentLine / labelStatement / relationStatement / injectStatement / conflictStatement

commentLine = _ "#" text:([^\n\r]*)
{
  return {
    type: "comment",
    text: text.join("")
  };
}

labelStatement = _ ident:ident _ "is" _ str:string
  {
    return {
      type: "label",
      id: ident,
      text: str
    };
  }

relationStatement = 
  _ ident1:ident _ "requires" _ ident2:ident _ "," _ str:string
  {
    return {
      type: "requirement",
      id1: ident1,
      id2: ident2,
      id2Text: str
    };
  }

injectStatement = _ "inject" _ str:string
{
	return {
    	type: "inject",
      text: str
    };
}

conflictStatement = _ ident1:ident _ "conflicts" _ "with" _ ident2:ident
{
  return {
    	type: "conflict",
      id1: ident1,
      id2: ident2,
  };
}

ident = id:([a-zA-Z0-9']+)
{ return id.join(""); }

string = "\"" text:([^"]*) "\""
{ return text.join(""); }

EOL
  = [ \t]* [\n\r]+

_ "whitespace"
  = [ \t]*