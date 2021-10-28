
import { useEffect } from 'react';
import { Link } from "react-router-dom";
import { errormsg } from "./redux/errormsg/slice.js";
import { useDispatch, useSelector } from "react-redux";

export default function Registration () {

    const dispatch = useDispatch();
    
    let inputsObj = {};
    let showError = false;
    let image = "";
    
    const errMsg = useSelector(
        (state) => {
            return state.errormsg && state.errormsg;
        }
    );
    
    useEffect(() => {
        console.log("Registration component mounted");
    });

    function handleChange(e) {
        // always save the input fields to be saved in db after clicking submit
        inputsObj[e.target.name] = e.target.value;
        // console.log("inputsObj", inputsObj)
    }

    function handleRegister(e) {
        e.preventDefault();
        console.log("register Btn clicked", inputsObj);
        console.log(image);

        const fd = new FormData();
        fd.append('file', image);
        fd.append('first', inputsObj.first);
        fd.append('last', inputsObj.last);
        fd.append('email', inputsObj.email);
        fd.append('password', inputsObj.password);

        if(inputsObj && inputsObj.email && inputsObj.password && inputsObj.first && inputsObj.last && image) {
            fetch("/registration.json", {
                method: "POST",
                body: fd 
            })
                .then(res => res.json())
                .then((data) => {
                    console.log("data:", data);
                    if(!data.success) {
                        showError = true;
                    }
                    // once the user is registered >>> we can trigger that using location.reload()
                    location.replace("/login");
                })
                .catch(console.log());
        } else {
            dispatch(errormsg("one of the input fields is missing!"));
        }

        
    }

    function fileSelectHandler(e) {

        image = e.target.files[0];
        console.log(image);
    
    }

    return (
        <div className='registration'>
            { showError && <h1>Error: Please register again!</h1>}
            { errMsg && <h1>Error: {errMsg} </h1>}
            <h1>Registration</h1>

            <form>
                <input type="text" name="first" placeholder="first" onChange={handleChange}></input>
                <input type="text" name="last" placeholder="last" onChange={handleChange}></input>
                <input type="email" name="email" placeholder="email" onChange={handleChange}></input>
                <input type="password" name="password" placeholder="password" onChange={handleChange}></input>
                <br></br>
                <label>Choose Profile Picture: </label>
                <input onChange={fileSelectHandler} type="file" name="file" accept="image/*"></input>
                <br></br>
                <button onClick={handleRegister}>register</button>
            </form>
            <Link to="/login">Already registered? Please log in</Link>
        </div>
    );    
}