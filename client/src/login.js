import { useHistory } from 'react-router-dom';

import { useEffect } from 'react';
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { errormsg } from "./redux/errormsg/slice.js";
import { loggeduser } from "./redux/loggeduser/slice.js";


export default function Login() {
    const history = useHistory();
    const dispatch = useDispatch();
    const errMsg = useSelector(
        (state) => {
            return state.errormsg && state.errormsg;
        }
    );

    let inputsObj = {};
    let showError = "";

    useEffect(() => {
        console.log("Login just mounted");
    });


    function handleChange(e) {
        // console.log("input changed", e.target.name, e.target.value);
        inputsObj[e.target.name] = e.target.value;
    };

    function handleLogin(e) {
        e.preventDefault();
        console.log("Login Btn clicked", inputsObj);

        if(inputsObj && inputsObj.email && inputsObj.password) {
            fetch("/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(inputsObj),
            })
                .then(res => res.json())
                .then((data) => {
                    console.log("data:", data);
                    if(data.errMsg) {
                        showError = data.errMsg;
                        console.log("showError",showError);
                        dispatch(errormsg(data.errMsg));
                    }
                    // once the user is logged in >>> we can trigger that using location.reload()
                    if(data.id) {
                        console.log("logged in user:", data);
                        dispatch(loggeduser(data));
                        location.replace("/");
                    }
                    
                })
                .catch(console.log());
    
        } else {
            dispatch(errormsg("one of the input fields is missing!"));
        }
    }

    return (
        <div className='login'>
            { errMsg && <h1>Error: {errMsg} </h1>}
            <h1>Log in</h1>
            <form>
                <input type="email" name="email" placeholder="email" onChange={handleChange}></input>
                <input type="password" name="password" placeholder="password" onChange={handleChange}></input>
                <button onClick={handleLogin}>Login</button>
            </form>
            <Link to="/">Not registered? Please sign up</Link>
            <br></br>
            <Link className="forgetBtn" to="/ResetPassword">Forgot password? Please reset</Link>
        </div>
    );    
}