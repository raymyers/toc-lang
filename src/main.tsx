import React from "react"
import { BrowserRouter } from "react-router-dom"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
import ErrorPage from "./ErrorPage"

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <App />,
      errorElement: <ErrorPage />
    }
  ],
  { basename: "/toc-lang" }
)

ReactDOM.createRoot(document.getElementById("root-reset")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
