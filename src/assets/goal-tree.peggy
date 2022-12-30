
{
  function makeInteger(o) {
    return parseInt(o.join(""), 10);
  }
}

start
  = EOL? goalStatement:goalStatement statement:(EOL @statement)* EOL? _
{
  return {
    goal: goalStatement,
    statements: statement
  };
}

goalStatement = "The"? _ "Goal" _ "is" _ str:string
{
  return {text: str};
}

statement = CSFStatement / NCStatement / requirementStatement / statusStatement

CSFStatement = _ "CSF" _ ident:ident _ "is" _ str:string
  {
    return {
      type: "CSF",
      id: ident,
      text: str
    };
  }
NCStatement = _ "NC" _ ident:ident _ "is" _ str:string
  {
    return {
      type: "NC",
      id: ident,
      text: str
    };
  }
requirementStatement = _ ident:ident _ "requires" _ requirements:requirements
  {
    return {
      type: "requirement",
      id: ident,
      requirements: requirements
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

ident = id:([a-zA-Z0-9]+)
{ return id.join(""); }

string = "\"" text:([^"]*) "\""
{ return text.join(""); }

percentage 
    = _ digits:([0-9]+)"%" _ { return makeInteger(digits); }
  

EOL
  = [ \t]* [\n\r]+

_ "whitespace"
  = [ \t]*