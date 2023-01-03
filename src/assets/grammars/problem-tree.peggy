start
  = statement:statement? moreStatements:(EOL _ @statement)* EOL? _
{
  const statements = statement ? [statement, ...moreStatements] : moreStatements;
  return {
    statements: statements
  };
}

statement = commentLine / labelStatement / causeStatement

commentLine = _ "#" text:([^\n\r]*)
{
  return {
    type: "comment",
    text: text.join("")
  };
}

labelStatement = _ type:("C" / "UDE" / "DE" / "FOL") __ ident:ident __ "is" __ str:string
  {
    return {
      type,
      id: ident,
      text: str
    };
  }
causeStatement = _  idents:identList __ "cause" "s"? __ effectId:ident
  {
    return {
      type: "cause",
      causes: idents,
      effectId: effectId
    };
  }

identList
  = ident:ident tail:(__ "and" __ @ident)*
  {
    return [ident, ...tail];
  }

ident = id:([a-zA-Z0-9]+)
{ return id.join(""); }

string = "\"" text:([^"]*) "\""
{ return text.join(""); }

percentage 
    = _ digits:([0-9]+)"%" _ { return makeInteger(digits); }
  

EOL
  = [ \t]* [\n\r]+

_ "optional whitespace"
  = [ \t]*

__ "whitespace"
  = [ \t]+