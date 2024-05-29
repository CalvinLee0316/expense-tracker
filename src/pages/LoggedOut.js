import { SignInButton } from "@clerk/clerk-react";

function LoggedOut() {
    return (
        <div class="SignIn">
            <h1>Welcome to Expense Tracker!</h1>
            <SignInButton>
                <button class="log">Sign In / Sign Up</button>
            </SignInButton>
        </div>
    )
}

export default LoggedOut;