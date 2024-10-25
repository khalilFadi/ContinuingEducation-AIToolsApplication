import * as React from "react"
import LoginPage  from "./loginpage"
import UploadDataset from "./uploadDataset"
const IndexPage = () => {
  return (
    <main >
      <LoginPage/>
    </main>
  )
}

export default IndexPage

export const Head = () => <title>Home Page</title>
