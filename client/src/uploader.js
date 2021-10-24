import { Component } from "react";

export default class Uploader extends Component {
    constructor(props) {
        super(props);
        
        this.fileSelectHandler = this.fileSelectHandler.bind(this);
    }

    componentDidMount() {
        console.log("Uploader component is mounted",this.props);
    }


    fileSelectHandler(e) {
        console.log(e.target.files[0]);
        
        const fd = new FormData();
        fd.append('file', e.target.files[0]);

        fetch('/Uploader', {
            method: 'POST',
            body: fd
        })
            .then(response => response.json())
            .then(result => {
                console.log("updating the image url in App component");
                this.props.updateImgUrl(result[0]); 
            })
            .catch(err => console.log(err));
    
    }


    render() {
        return(
            <>
                <div className="overlay" onClick={this.props.closeModal}>
                </div>

                <form className="modal">
                    <input onChange={this.fileSelectHandler} type="file" name="file" accept="image/*"></input>
                </form>
                    
            </>
        );
    }
}
