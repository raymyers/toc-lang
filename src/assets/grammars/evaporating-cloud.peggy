
start
  = EOL? statement:statement moreStatements:(EOL @statement)* EOL? _
{
  return {
    statements: [statement, ...moreStatements]
  };
}

statement = labelStatement / relationStatement / injectStatement

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
injectStatement = "inject" _ str:string
{
	return {
    	type: "inject",
        text: str
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