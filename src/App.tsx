import "./App.css"
import React from "react"
import { Outlet, NavLink } from "react-router-dom"

const navLinkClass = ({ isActive, isPending }) =>
  isActive ? "active" : isPending ? "pending" : ""

function App() {
  return (
    <div className="App">
      <div className="flex-row nav">
        <div className="nav-item">
          <NavLink className={navLinkClass} to={`draw/evaporating-cloud`}>
            Evaporating Cloud
          </NavLink>
        </div>
        |&nbsp;
        <div className="nav-item">
          <NavLink className={navLinkClass} to={`draw/goal-tree`}>
            Goal Tree
          </NavLink>
        </div>
        |&nbsp;
        <div className="nav-item">
          <NavLink className={navLinkClass} to={`draw/problem-tree`}>
            Problem Tree
          </NavLink>
        </div>
        |&nbsp;
        <div className="nav-item">
          <NavLink className={navLinkClass} to={`about`}>
            About
          </NavLink>
        </div>
      </div>
      <Outlet />
    </div>
  )
}
export default App
