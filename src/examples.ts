export const exampleGoalTreeText = `Goal: "Make money now and in the future"

revUp: "Generate more revenue" {
    class: CSF
}
costsDown: "Control costs" {
    class: CSF
}

Goal <- revUp
Goal <- costsDown

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

revUp <- newCust
revUp <- keepCust
costsDown <- reduceInfra
retain <- marketSalary
retain <- morale
`

export const exampleEvaporatingCloudText = `
A: Maximize business performance

B: Subordinate all decisions to the financial goal

C: Ensure people are in a state of optimal performance

D: Subordinate people's needs to the financial goal

B <- D: *inject* Psychological flow triggers

D': Attend to people's needs (& let people work)
`

export const exampleProblemTreeText = `
bad: "Bad user experience" {
    class: UDE
}
cluttered: "Cluttered interface" {
    class: UDE
}
bad <- cluttered
ux: "Low investment in UX design"
features: "Many features added"
cluttered <- ux && features
`
