export const exampleGoalTreeText = `Goal: "Make money now and in the future"
CSF_revUp: "Generate more revenue"
CSF_costsDown: "Control costs"
keepCust: "Protect relationship with existing customers"
newCust: "Acquire new customers"

reduceInfra: "Reduce infrastructure spending"
retain: "Retain employees"
marketSalary: "Keep up with market salaries"

morale: "Maintain employee morale"
features: "Develop new features"

newCust <- features

# This is probably the wrong place for 'retain'
features <- retain

CSF_revUp <- newCust
CSF_revUp <- keepCust
CSF_costsDown <- reduceInfra
retain <- marketSalary
retain <- morale
`

export const exampleEvaporatingCloudText = `
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
