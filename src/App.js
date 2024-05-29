import "./App.css";
import React from "react";
import { ClerkProvider } from '@clerk/clerk-react'
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import Main from "./pages/Main.js";
import LoggedOut from "./pages/LoggedOut.js";

const PUBLISHABLE_KEY = process.env.REACT_APP_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}
function App() {
  //spending states


  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <header>
        <SignedOut>
          <LoggedOut />
        </SignedOut>
        <SignedIn>
          <Main />
        </SignedIn>
      </header>
    </ClerkProvider>
  );
}

export default App;
