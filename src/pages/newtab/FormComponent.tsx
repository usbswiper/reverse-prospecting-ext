import { Popup } from "reactjs-popup";
import React from "react";
import { FileUploader } from "react-drag-drop-files";

class FormComponent extends React.Component {
    constructor(props) {
        super(props);
        // console.log(props);
        this.state = {
            isOpen: props.isOpen,
            popupClosed: props.popupClosed,
            sendEmail: props.sendEmail,
            formData: {
                email_notes_1: null,
                subject_prefix: null,
                bedrooms: null,
                bathrooms: null,
                sqft: null,
                listedAt: null,
                city: null,
                file: null,
                custom_mls_number: null,
                website_link: null,
                // bedrooms: 10,
                // bathrooms: 11,
                // sqft: 1360,
                // listedAt: "453",
                // city: "Test",
                // file: null
            },
            errors: {},
            confirmPopup: false,
            fileError: '',
            isPreview: false
        };
    }

    handleUserInput(e) {
        const name = e.target.name;
        const value = e.target.value;
        let formData = this.state.formData;
        let errors = this.state.errors;
        if (name in errors) {
            delete errors[name];
        }
        formData[name] = value;
        // console.log(name, value);
        this.setState({ formData: formData, errors: errors });
    }

    validateFormAndSendMail(isPreview = false) {
        const formData = this.state.formData;
        // console.log(formData);
        let errors = {};
        if (formData.bedrooms == "" || formData.bedrooms == null) {
            errors["bedrooms"] = "Please enter a value for bedrooms.";
        }
        if (formData.bathrooms == "" || formData.bathrooms == null) {
            errors["bathrooms"] = "Please enter a value for bathrooms.";
        }
        if (formData.sqft == "" || formData.sqft == null) {
            errors["sqft"] = "Please enter a value for sqft.";
        }
        if (formData.listedAt == "" || formData.listedAt == null) {
            errors["listedAt"] = "Please enter a value for listed at (price).";
        }
        if (formData.city == "" || formData.city == null) {
            errors["city"] = "Please enter a value for city.";
        }

        if (typeof formData.file == "undefined" || formData.file == null) {
            errors["file"] = "Please select a property image.";
        }
        if (Object.keys(errors).length) {
            this.setState({errors: errors});
        } else if (isPreview) {
            this.setState({ isPreview: isPreview }, () => {
                this.sendEmail();
            });
        } else {
            this.setState({ confirmPopup: true, isPreview: false });
        }
    }

    handleFileChange(file) {
        // console.log(file);
        let formData = this.state.formData;
        // validate file size, that must not be greater then 10 MB
        const sizeInKb = Math.round(file.size / 1000);
        if (sizeInKb > 10240) {
            formData.file = null;
            this.setState({
                fileError: "Your file size (" + sizeInKb + " KB) exceeds the 10MB limit",
                formData: formData,
            });
            return;
        }
        let errors = this.state.errors;
        formData.file = file;
        if ("file" in errors) {
            delete errors["file"];
        }
        this.setState({ formData: formData, errors: errors, fileError: "" });
    }

    confirmPopupClosed() {
        this.setState({ confirmPopup: false });
    }

    sendEmail() {
        let formData = this.state.formData;
        formData.isPreview = this.state.isPreview;
        this.state.sendEmail(this.state.formData);
        // close();
    }

    render() {
        const fileTypes = ["JPEG", "JPG", "PNG", "GIF"];

        const controlChildren = (
            <label className={"upload-box"}>
                <input accept=".jpeg,.png,.gif" type="file" name="file" />
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.33317 6.66667H22.6665V16H25.3332V6.66667C25.3332 5.196 24.1372 4 22.6665 4H5.33317C3.8625 4 2.6665 5.196 2.6665 6.66667V22.6667C2.6665 24.1373 3.8625 25.3333 5.33317 25.3333H15.9998V22.6667H5.33317V6.66667Z" fill="#0658C2"></path>
                    <path d="M10.6665 14.6667L6.6665 20H21.3332L15.9998 12L11.9998 17.3333L10.6665 14.6667Z" fill="#0658C2"></path>
                    <path d="M25.3332 18.6667H22.6665V22.6667H18.6665V25.3333H22.6665V29.3333H25.3332V25.3333H29.3332V22.6667H25.3332V18.6667Z" fill="#0658C2"></path>
                </svg>
                <div className={"upload-box-desc"}>
                    {(() => {
                        if (this.state.fileError == "") {
                            if (this.state.formData.file && this.state.formData.file.name) {
                                let sizeInKb = Math.round(this.state.formData.file.size / 1000);
                                return (
                                    <span><span>{this.state.formData.file.name} ({sizeInKb} KB)</span></span>
                                )
                            } else {
                                return (
                                    <span><span>Drop</span> property image or Click here to upload {this.state.fileError}</span>
                                );
                            }
                        } else {
                            return (
                                <span className={"file-error"}>{this.state.fileError}</span>
                            );
                        }
                    })()}
                    <span title="size >= 1, types: JPEG,PNG,GIF" className="file-types">JPEG,PNG,GIF</span>
                </div>
            </label>
        );

        return (
            <Popup
                open={this.state.isOpen}
                onClose={this.state.popupClosed}
                modal={true}
                closeOnDocumentClick={false}
                closeOnEscape={false}
                position="center center"
                className={"custom-popup-size"}
            >
                {(close) => (
                    <div className="modal">
                        <button className="close" onClick={close}>
                            &times;
                        </button>

                        <div className={"send_email_popup_header"}>
                            Send email
                        </div>
                        <div className={"popup-content-form"}>
                            {/*{JSON.stringify(this.state.formData)}*/}
                            <table cellSpacing={"10"} cellPadding={"10"}>
                                <tr className={'subject_prefix' in this.state.errors ? 'field-error' : ''}>
                                    <td>Subject Prefix</td>
                                    <td>
                                        <input type={"text"} value={this.state.formData["subject_prefix"]} name={"subject_prefix"} className={"form-control"} onChange={(event) => this.handleUserInput(event)}/>
                                    </td>
                                </tr>
                                <tr className={'email_notes_1' in this.state.errors ? 'field-error' : ''}>
                                    <td>Email Note 1 (on Top)</td>
                                    <td>
                                        <input type={"text"} value={this.state.formData["email_notes_1"]} name={"email_notes_1"} className={"form-control"} onChange={(event) => this.handleUserInput(event)}/>
                                    </td>
                                </tr>
                                <tr className={'custom_mls_number' in this.state.errors ? 'field-error' : ''}>
                                    <td>Custom MLS Number</td>
                                    <td>
                                        <input type={"text"} value={this.state.formData["custom_mls_number"]} name={"custom_mls_number"} className={"form-control"} onChange={(event) => this.handleUserInput(event)}/>
                                    </td>
                                </tr>
                                <tr className={'city' in this.state.errors ? 'field-error' : ''}>
                                    <td>City</td>
                                    <td>
                                        <input type={"text"} value={this.state.formData["city"]} name={"city"} className={"form-control"} onChange={(event) => this.handleUserInput(event)}/>
                                    </td>
                                </tr>
                                <tr className={'bedrooms' in this.state.errors ? 'field-error' : ''}>
                                    <td>Number of Bedrooms</td>
                                    <td>
                                        <input type={"text"} value={this.state.formData["bedrooms"]} name={"bedrooms"} className={"form-control"} onChange={(event) => this.handleUserInput(event)}/>
                                    </td>
                                </tr>
                                <tr className={'bathrooms' in this.state.errors ? 'field-error' : ''}>
                                    <td>Number of Bathrooms</td>
                                    <td>
                                        <input type={"text"} value={this.state.formData["bathrooms"]} name={"bathrooms"} className={"form-control"} onChange={(event) => this.handleUserInput(event)}/>
                                    </td>
                                </tr>
                                <tr className={'sqft' in this.state.errors ? 'field-error' : ''}>
                                    <td>Approximate Sq. Ft.</td>
                                    <td>
                                        <input type={"text"} value={this.state.formData["sqft"]} name={"sqft"} className={"form-control"} onChange={(event) => this.handleUserInput(event)}/>
                                    </td>
                                </tr>
                                <tr className={'listedAt' in this.state.errors ? 'field-error' : ''}>
                                    <td>Listed at (Price)</td>
                                    <td>
                                        <input type={"text"} value={this.state.formData["listedAt"]} name={"listedAt"} className={"form-control"} onChange={(event) => this.handleUserInput(event)}/>
                                    </td>
                                </tr>
                                <tr className={'website_link' in this.state.errors ? 'field-error' : ''}>
                                    <td>Website Link</td>
                                    <td>
                                        <input type={"text"} value={this.state.formData["website_link"]} name={"website_link"} className={"form-control"} onChange={(event) => this.handleUserInput(event)}/>
                                    </td>
                                </tr>
                                <tr className={'file' in this.state.errors ? 'field-error' : ''}>
                                    <td className={"file-upload"} colSpan={2}>
                                        <FileUploader
                                            label="Drop property image or Click here to upload."
                                            multiple={false}
                                            handleChange={this.handleFileChange.bind(
                                                this
                                            )}
                                            name="file"
                                            types={fileTypes}
                                            maxSize={1}
                                            onTypeError={(error) => {
                                                console.log(error)
                                                this.setState({
                                                    fileError: error,
                                                });
                                            }}
                                            children={controlChildren}
                                        />
                                    </td>
                                </tr>
                            </table>
                        </div>
                        <div className="actions">
                            <button
                                type={"button"}
                                className="btn btn-primary"
                                onClick={() => {
                                    this.validateFormAndSendMail();
                                }}
                            >
                                Send emails
                            </button>{"  "}
                            <button
                                type={"button"}
                                className="btn btn-secondary"
                                onClick={() => {
                                    this.validateFormAndSendMail(true);
                                }}
                            >
                                Preview
                            </button>{"  "}
                            <button
                                type={"button"}
                                className="btn btn-danger"
                                onClick={() => {
                                    close();
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                        <ConfirmationPopup
                            isOpen={this.state.confirmPopup}
                            popupClosed={this.confirmPopupClosed.bind(
                                this
                            )}
                            sendEmail={this.sendEmail.bind(this)}
                        />
                    </div>
                )}
            </Popup>
        );
    }
}

const ConfirmationPopup = ({ isOpen, popupClosed, sendEmail }) => (
    <Popup
        open={isOpen}
        onClose={popupClosed}
        modal={true}
        closeOnDocumentClick={false}
        closeOnEscape={false}
        position="center center"
    >
        {(close) => (
            <div className="modal">
                <button className="close" onClick={close}>
                    &times;
                </button>

                {/*<div className="header"> Email Send Confirmation</div>*/}
                <div
                    className="content"
                    style={{
                        "text-align": "center",
                        "font-size": "30px",
                        margin: "30px auto",
                    }}
                >
                    {" "}
                    Do you want to schedule the email to all the selected
                    emails?
                </div>
                <div className="actions">
                    <button
                        type={"button"}
                        className="btn btn-primary"
                        onClick={() => {
                            sendEmail();
                            close();
                        }}
                    >
                        Send emails
                    </button>{" "}
                    <button
                        type={"button"}
                        className="btn btn-danger"
                        onClick={() => {
                            close();
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        )}
    </Popup>
);

export default FormComponent;
