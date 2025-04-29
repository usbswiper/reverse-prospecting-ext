import React from "react";
import "@pages/newtab/Newtab.css";
import "@pages/newtab/Newtab.scss";
import "reactjs-popup/dist/index.css";
import FormComponent from "@pages/newtab/FormComponent";
import EmailPreview from "@pages/newtab/EmailPreview";

class Newtab extends React.Component {
    private waitTimer: NodeJS.Timeout;
    constructor(props) {
        super(props);
        // const siteUrl = "http://localhost:8000";
        const siteUrl = "https://reverse-prospecting.com/mls_api";
        this.state = {
            emailList: null,
            allChecked: true,
            loadingMsg: "Please wait loading...",
            openPopup: false,
            sendInProgress: false,
            emailSent: false,
            showEmailPreview: false,
            htmlEmail: '',
            siteUrl: siteUrl,
            isTestMode: false,
            authToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.wJQkyUFl7Xfff3sQvh6RMXT_SUoahZ9HEFRAJfRqiSk"
        };
        this.waitTimer = setTimeout(() => {
            this.setState({
                loadingMsg: "Failed to communicate with the MLS page.",
            });
        }, 5000);
        chrome.runtime.onMessage.addListener((msg, sender) => {
            // console.log("message received", msg);
            if (msg.action === "setData") {
                clearTimeout(this.waitTimer);
                this.setState({ emailList: null, loadingMsg: "Please wait loading..." });
                this.parseHtmlData(msg.data);
            } else if (msg.action === "errorMessage") {
                clearTimeout(this.waitTimer);
                this.setState({ emailList: null, loadingMsg: msg.data });
            }
        });

        this.checkIfTestMode();
    }

    checkIfTestMode() {
        const requestOptions = {
            method: "POST",
            headers: {
                Authorization: this.state.authToken,
            },
        };
        fetch(this.state.siteUrl + "/get_config.php", requestOptions)
            .then((response) => response.json())
            .then((data) => {
                this.setState({isTestMode: data.test_mode});
            })
            .catch((error) => {
                console.log("get config api call error", error);
            })
            .finally(() => {
            });
    }

    handleAllChecked(event) {
        const mls_data = this.state.emailList;
        mls_data.forEach((mls) => (mls.isChecked = event.target.checked));
        this.setState({
            emailList: mls_data,
            allChecked: event.target.checked,
        });
    }

    handleCheckChieldElement(event) {
        let allChecked = true;
        const mls_data = this.state.emailList;
        mls_data.forEach((mls) => {
            if (mls.agentId + "_" + mls.searchId === event.target.value) {
                mls.isChecked = event.target.checked;
            }
            if (!mls.isChecked) allChecked = false;
        });
        this.setState({ emailList: mls_data, allChecked });
    }

    render() {
        const emailList =
            this.state && this.state.emailList ? this.state.emailList : null;
        let listHeader = null;
        let listItems = "";
        if (!this.state.emailSent && !this.state.sendInProgress) {
            listHeader = (
                <thead>
                    <tr>
                        <td>
                            <input
                                type={"checkbox"}
                                checked={this.state.allChecked}
                                onClick={this.handleAllChecked.bind(this)}
                            />
                        </td>
                        <td>MLS</td>
                        <td>Address</td>
                        <td>Agent Name</td>
                        <td>Email</td>
                        <td>Subject</td>
                        <td>Agent ID</td>
                        <td>Client Public ID</td>
                        <td>Search ID</td>
                    </tr>
                </thead>
            );
            if (emailList) {
                listItems = emailList.map((row) => (
                    <tr key={row.clientPublicId}>
                        <td>
                            <input
                                type={"checkbox"}
                                checked={row.isChecked}
                                value={row.agentId + "_" + row.searchId}
                                onClick={this.handleCheckChieldElement.bind(
                                    this
                                )}
                            />
                        </td>
                        <td>{row.mls}</td>
                        <td>{row.address}</td>
                        <td>{row.agentName}</td>
                        <td>{row.email}</td>
                        <td>{row.emailSubject}</td>
                        <td>{row.agentId}</td>
                        <td>{row.clientPublicId}</td>
                        <td>{row.searchId}</td>
                    </tr>
                ));
            }
        }
        return (
            <div className={"content_container"}>
                <div className={"header_container"}>
                    <div className={"top_heading"}>MLS Bulk Email Sender (<span style={{'color': (this.state.isTestMode ? 'red' : 'green')}}><b>{this.state.isTestMode ? 'TEST MODE' : 'LIVE'}</b></span>)</div>
                    <div className={"top_sub_heading"}>
                        You can check/uncheck the emails from following list and click on the "Send Emails" button to schedule the emails.
                    </div>
                </div>
                <div className={"body_container_data"}>
                    {(() => {
                        if (this.state.sendInProgress) {
                            return (
                                <div className={"loading_message_center"}>
                                    <h1>
                                        Sit tight, We're scheduling the emails...
                                    </h1>
                                </div>
                            );
                        } else if (this.state.emailSent) {
                            return (
                                <div className={"loading_message_center"}>
                                    <h1 className={"green_text"}>
                                        Email has been scheduled successfully.
                                    </h1>
                                    <div style={{ "margin-top": "30px" }}>
                                        <button
                                            className={"btn btn-primary"}
                                            onClick={this.closeTab.bind(this)}
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            );
                        } else if (emailList == null) {
                            return (
                                <div className={"loading_message_center"}>
                                    <h1>{this.state.loadingMsg}</h1>
                                </div>
                            );
                        } else {
                            return (
                                <div>
                                    {(() => {
                                        if (this.state.openPopup)
                                            return (
                                                <FormComponent
                                                    isOpen={this.state.openPopup}
                                                    popupClosed={this.popupClosed.bind(
                                                        this
                                                    )}
                                                    sendEmail={this.sendEmail.bind(this)}
                                                />
                                            );
                                    })()}
                                    {(() => {
                                        if (this.state.showEmailPreview)
                                            return (
                                                <EmailPreview
                                                    isOpen={this.state.showEmailPreview}
                                                    popupClosed={this.previewPopupClosed.bind(
                                                        this
                                                    )}
                                                    htmlEmail={this.state.htmlEmail}
                                                />
                                            );
                                    })()}
                                    <button
                                        className={
                                            "btn btn-primary send_email_button"
                                        }
                                        onClick={this.buttonClicked.bind(this)}
                                    >
                                        Send Email
                                    </button>
                                    <table className="bordered" border="1">
                                        {listHeader}
                                        {listItems}
                                    </table>
                                </div>
                            );
                        }
                    })()}
                </div>
            </div>
        );
    }

    popupClosed() {
        this.setState({ openPopup: false });
    }

    previewPopupClosed() {
        this.setState({ showEmailPreview: false });
    }

    buttonClicked() {
        const emails = [];
        if (!this.state.emailList || this.state.emailList.length == 0) {
            alert(
                "Your email list is blank. "
            );
            return;
        }
        Object.keys(this.state.emailList).forEach((row) => {
            if (this.state.emailList[row].isChecked) {
                emails.push(this.state.emailList[row]);
            }
        });
        if (emails.length == 0) {
            alert(
                "Please select atleast one row to continue."
            );
            return;
        }
        this.setState({ openPopup: true });
    }

    closeTab() {
        chrome.tabs.getCurrent(function(tab) {
            chrome.tabs.remove(tab.id, function() { });
        });
    }

    sendEmail(formData) {
        if (!this.state.emailList || this.state.emailList.length == 0) {
            alert("Your email list is blank. please try again.");
        }
        const emails = [];
        Object.keys(this.state.emailList).forEach((row) => {
            if (this.state.emailList[row].isChecked) {
                emails.push(this.state.emailList[row]);
            }
        });

        if (emails.length == 0) {
            alert(
                "Please select atleast one email to " +
                    (formData.isPreview ? "preview" : "schedule") +
                    " the emails."
            );
            return;
        }

        if (!formData.isPreview) {
            this.setState({
                sendInProgress: true,
            });
        }

        let formObject = new FormData();
        formObject.append("image", formData.file);
        // delete formData.file;
        formData.emails = emails;
        formObject.append("formBody", JSON.stringify(formData));

        // JWT: 256 bit secret: 45sa65d465sa4d6546a5s4d6546ads46578687ghjsa7d68721213
        // Simple POST request with a JSON body using fetch
        const requestOptions = {
            method: "POST",
            headers: {
                Authorization: this.state.authToken,
            },
            body: formObject,
        };
        const siteUrl = this.state.siteUrl;
        fetch(siteUrl + "/schedule_emails.php", requestOptions)
            .then((response) => response.json())
            .then((data) => {
                if (data.status) {
                    if (formData.isPreview) {
                        this.setState({
                            showEmailPreview: true,
                            htmlEmail: data.data.html,
                        });
                    } else {
                        this.setState({
                            emailSent: true,
                        });
                    }
                } else {
                    alert(data.data.message);
                }
            })
            .catch((error) => {
                console.log("fetch api call", error);
            })
            .finally(() => {
                if (!formData.isPreview) {
                    this.setState({
                        sendInProgress: false,
                    });
                }
            });
    }

    parseHtmlData(content: string) {
        let emailList = {};
        try {
            //let content = document.documentElement.outerHTML;
            const tables = content.match(
                /<table.*?>[\s\t\n]*?<tbody>(.*?)<\/tbody>[\s\t\n]*?<\/table>/gims
            );
            const trs = tables[0].match(/<tr.*?>(.*?)<\/tr>/gims);
            trs.splice(0, 1);
            for (let i = 0; i < trs.length; i++) {
                const td = trs[i]
                    .match(/<td.*?>(.*?)<\/td>/gims)
                    .map((val: string) => {
                        const tdContent = val.replace(/<td.*?>|<\/td>/gims, "");
                        const atag = /<a.*?(href="(.+?)")?>(.+)<\/a>/gims.exec(
                            tdContent
                        );
                        if (atag && atag.length) {
                            if (atag[2].indexOf("mailto:") > -1) {
                                return this.getMailto(atag[2]);
                            }
                            return [atag[2], atag[3]];
                        }
                        return tdContent;
                    });
                let uniqueId = td[4].email + '_' + td[6];
                emailList[uniqueId] = {
                    mls: td[1][1],
                    address: td[2],
                    agentName: td[3][1],
                    email: td[4].email,
                    emailSubject: td[4].subject,
                    agentId: td[5],
                    clientPublicId: td[6],
                    searchId: td[7],
                    //emailed: td[9].replace(/<\/?[^>]+(>|$)/g, ""),
                    isChecked: true,
                };
            }
        } catch (error) {

        }
        emailList = Object.values(emailList);
        if (emailList.length) {
            this.setState({ emailList: emailList, allChecked: true });
        } else {
            this.setState({
                emailList: null,
                loadingMsg:
                    "Unable to find the email list, Either the page is not supported or the HTML structure has been changed.",
            });
        }
    }

    getMailto(s) {
        const r = {};
        let email = s.match(/mailto:([^\?]*)/);
        email = email[1] ? email[1] : false;
        let subject = s.match(/subject=([^&]+)/);
        subject = subject ? subject[1].replace(/\+/g, " ") : false;
        let body = s.match(/body=([^&]+)/);
        body = body ? body[1].replace(/\+/g, " ") : false;

        if (email) {
            r["email"] = email;
        }
        if (subject) {
            r["subject"] = subject;
        }
        if (body) {
            r["body"] = body;
        }

        return r;
    }
}

export default Newtab;
