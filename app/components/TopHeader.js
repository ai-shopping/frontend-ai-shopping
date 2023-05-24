import React from "react";
import headerLogo from "../assets/icons/header-logo.svg"
import desktopPerson from "../assets/icons/Desktop-person.svg"
import desktopVector from "../assets/icons/Desktop-Vector.svg"



const TopHeader = () => {
    return (
        <div className="top-header">
            <div className="container">
                <div className="row py-3">
                    <div className="col-1">
                       <img src={headerLogo} alt="" className="header-logo" />
                    </div>
                    <div className="col-10 welcome d-flex align-items-center m-0 justify-content-center">
                    Welcome to your CBD Smart Store
                    </div>
                    <div className="col-1 d-flex align-items-center">
                    <img src={desktopPerson} alt="" className="me-3" />
                    <img src={desktopVector} alt="" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TopHeader;