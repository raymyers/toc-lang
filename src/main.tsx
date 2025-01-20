import React from "react"
import { createBrowserRouter, RouterProvider, redirect } from "react-router-dom"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
import ErrorPage from "./ErrorPage"
import Draw from "./Draw"
import { About } from "./About"

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <App />,
      errorElement: <ErrorPage />,

      children: [
        {
          index: true,
          loader: async () => redirect("/draw/goal-tree")
        },
        {
          path: "draw",
          element: <Draw />,
        },
        {
          path: "draw/:diagramType", // param not used anymore, redirecting
          loader:  async () => redirect("/draw")
        },
        {
          path: "about",
          element: <About />
        }
      ]
    }
  ],
  { basename: "/toc-lang" }
)
const rootResetElt = document.getElementById("root-reset")
if (rootResetElt) {
  ReactDOM.createRoot(rootResetElt).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  )
}
