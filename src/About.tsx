import "./App.css"
import React from "react"

export function About({}) {
  return (
    <div id="about-page">
      <h1>TOC-Lang</h1>
      <p>
        Generate{" "}
        <a href="https://en.wikipedia.org/wiki/Theory_of_constraints">
          Theory of Constraints
        </a>{" "}
        diagrams from text-based notation. Learn more{" "}
        <a href="https://github.com/raymyers/toc-lang/">on GitHub!</a>
      </p>
    </div>
  )
}
