
start
  = statement:statement? moreStatements:(EOL @statement)* EOL? _
{
  if (!statement) return { statements: moreStatements };
  return {
    statements: [statement, ...moreStatements]
  };
}

statement = commentLine / labelStatement / relationStatement

commentLine = _ "#" text:([^\n\r]*)
{
  return {
    type: "comment",
    text: text.join("")
  };
}

labelStatement = _ ident:ident _ ":" _ label:label
  {
    return {
      type: "label",
      id: ident,
      text: label
    };
  }

relationStatement = 
  _ ident1:ident _ direction:direction _ ident2:ident _ ':' _ label:label
  {
    return {
      type: "edgeLabel",
      id1: ident1,
      id2: ident2,
      text: label
    };
  }

label = string / text:([^{\n]*)
{ return text.join(""); }


ident = id:([a-zA-Z0-9']+)
{ return id.join(""); }

string = "\"" text:([^"]*) "\""
{ return text.join(""); }

direction = "<-" ">"? / "->"

EOL
  = [ \t]* [\n\r]+

_ "whitespace"
  = [ \t]*
  
 