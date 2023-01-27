import React from "react"
import { BrowserRouter } from "react-router-dom"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
import ErrorPage from "./ErrorPage"
import Draw, { loader } from "./Draw"
import { About } from "./About"

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <App />,
      errorElement: <ErrorPage />,
      children: [
        {
          path: "draw/:diagramType",
          element: <Draw />,
          loader: loader
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

ReactDOM.createRoot(document.getElementById("root-reset")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
