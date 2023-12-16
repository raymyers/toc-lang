export const exampleGoalTreeText = `Goal is "Make money now and in the future"
CSF revUp is "Generate more revenue"
CSF costsDown is "Control costs"
NC keepCust is "Protect relationship with existing customers"
NC newCust is "Acquire new customers"

NC reduceInfra is "Reduce infrastructure spending"
NC retain is "Retain employees"
NC marketSalary is "Keep up with market salaries"

NC morale is "Maintain employee morale"
NC features is "Develop new features"

newCust requires features

# This is probably the wrong place for 'retain'
features requires retain

revUp requires newCust and keepCust
costsDown requires reduceInfra
retain requires marketSalary and morale
`

export const  exampleEvaporatingCloudText = `
A: Maximize business performance

B: Subordinate all decisions to the financial goal

C: Ensure people are in a state of optimal performance

D: Subordinate people's needs to the financial goal

D -> B: *inject* Psychological flow triggers

D': Attend to people's needs (& let people work)
`

export const exampleProblemTreeText = `
UDE bad is "Bad user experience"
C cluttered is "Cluttered interface"
cluttered causes bad
C ux is "Low investment in UX design"
C features is "Many features added"
ux and features cause cluttered
`
