import { Popup } from "reactjs-popup";
import React from "react";

const EmailPreview = ({ isOpen, popupClosed, htmlEmail }) => (
    <Popup
        open={isOpen}
        onClose={popupClosed}
        modal={true}
        closeOnDocumentClick={false}
        closeOnEscape={false}
        position="center center"
        className={"email-template-preview"}
    >
        {(close) => (
            <div className="modal">
                <button className="close" onClick={close}>
                    &times;
                </button>
                <div
                    className="content"
                    style={{
                        "font-size": "20px",
                        margin: "30px auto",
                    }}
                    dangerouslySetInnerHTML={{__html: htmlEmail}} ></div>
                <div className="actions">
                    <button
                        type={"button"}
                        className="btn btn-danger"
                        onClick={() => {
                            close();
                        }}
                    >
                        Close Preview
                    </button>
                </div>
            </div>
        )}
    </Popup>
);

export default EmailPreview;
