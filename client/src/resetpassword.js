import { useEffect } from 'react';
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { errormsg } from "./redux/errormsg/slice.js";
import { step } from "./redux/step/slice.js";

export default function ResetPassword() {
    const dispatch = useDispatch();

    let inputsObj = {};

    const errMsg = useSelector(
        (state) => {
            return state.errormsg && state.errormsg;
        }
    );

    const currentStep = useSelector(
        (state) => {
            return state.step && state.step;
        }
    );

    useEffect(() => {
        console.log("PasswordReset just mounted");
        dispatch(step("step1"));
    },[]);


    function handleChange(e) {
        // console.log("input changed", e.target.name, e.target.value);
        inputsObj[e.target.name] = e.target.value;
    };

    function handleResetPassword(e) {
        e.preventDefault();
        // console.log("Password Reset Btn clicked", this.state);

        fetch("/ResetPassword", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(inputsObj),
        })
            .then(res => res.json())
            .then((data) => {
                // console.log("data:", data);
                if(data.errMsg) {
                    dispatch(errormsg(data.errMsg));
                }
                // email exists & we got back the security code
                if(data.success) {
                    console.log("Email was sent for verification",data.success);
                    dispatch(step("step2"));
                }
                
            })
            .catch(console.log());
        // update the error msg in state for the case of fetch failure
    };

    function handleSavePassword(e) {
        e.preventDefault();
        console.log("Submit Btn clicked", inputsObj);

        fetch("/SavePassword", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(inputsObj),
        })
            .then(res => res.json())
            .then((data) => {
                // console.log("data:", data);
                if(data.errMsg) {
                    dispatch(errormsg(data.errMsg));
                }
                // new password is saved successfully
                if(data.success) {
                    // console.log("new password is saved successfully",data.success);
                    dispatch(step("step3"));
                }
                
            })
            .catch(console.log());
        // update the error msg in state for the case of fetch failure
    };

    if(!currentStep) {
        return(
            <h1>Loading...</h1>
        )
    }
    else if(currentStep === "step1") {
        return (
            <section>
                { errMsg && <h1>Error: {errMsg} </h1>}
                <h1>Password Reset</h1>
                <form>
                    <input type="email" name="email" placeholder="email" onChange={handleChange}></input>
                    <button onClick={handleResetPassword}>Verify Email</button>
                </form>
                <Link to="/">Not registered? Please sign up</Link>
            </section>
        );    
    } else if(currentStep === "step2") {
        return (
            <section>
                { errMsg && <h1>Error: {errMsg} </h1>}
                <h1>Password Reset</h1>
                <form>
                    <label htmlFor="email">Please enter your Email </label>
                    <input type="text" name="email" placeholder="email" onChange={handleChange}></input>
                    <br></br>
                    <label htmlFor="code">Please enter the code you received by Email </label>
                    <input type="text" name="code" placeholder="code" onChange={handleChange}></input>
                    <br></br>
                    <label htmlFor="password">Please enter a new password </label>
                    <input type="password" name="password" placeholder="password" onChange={handleChange}></input>
                    <br></br>
                    <button onClick={handleSavePassword}>Submit</button>
                </form>
            </section>
        );  
    }  else if(currentStep === "step3") {
        return (
            <section>
                { errMsg && <h1>Error: {errMsg} </h1>}
                <h1>Password Reset was done!</h1>
                <Link to="/login">Please log in</Link>
            </section>
        );  
    }
}