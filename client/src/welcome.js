import Registration from "./registration.js";
import Login from "./login.js";
import ResetPassword from "./resetpassword.js";

import { BrowserRouter, Route} from "react-router-dom";

export default function Welcome() {
    return (
        <BrowserRouter>
            <div className="welcome">
                <div className='welcome-row1'>
                    {/* <img className="logo" src="/logo2.jpg" alt="logo" /> */}
                </div>

                <div className='welcome-row2'>
                    <h1>Let's play Truth or Dare!</h1>
                    <Route exact path="/">
                        <Registration />
                    </Route>
                    <Route path="/login">
                        <Login />
                    </Route>
                    <Route path="/ResetPassword">
                        <ResetPassword />
                    </Route>
                </div>
            </div>
        </BrowserRouter>
    );
}