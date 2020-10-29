import React from "react";
import { Link } from "react-router-dom";

export default class RegisterSuccess extends React.Component {
  componentDidMount() {
    // if (!this.props.location.parentData) {
    //   this.props.history.push("/");
    // }
  }

  render() {
    return (
      <div className="register-body-container animated fadeIn">
        <div className="register-left-part">
          <div className="register-logo-container">
            <div className="register-logo" />
            {/* <div className="register-name"><span>AI</span> Tester</div> */}
          </div>
          <div>
            <div className="register-sub-title">The most advance testing tool ever!</div>
            <div className="register-description">
              Now your QA Automation will never break with <br />
              our unique auto healing technology
            </div>
          </div>
          <div className="registration-graphic" />
        </div>
        <div className="register-right-part">
          <div className="registration-box register-success">
            <div className="register-form-title">Registration Successful</div>
            <div className="border-container" />
            <div className="register-intro-title">NEXT STEPS</div>
            <div className="register-intro-step">
              <div className="register-intro-step-count">1</div>
              <div className="register-intro-step-desc">You’ll get the confirmation email from us (easelqa.com).</div>
            </div>
            <div className="register-intro-step">
              <div className="register-intro-step-count">2</div>
              <div className="register-intro-step-desc">Click on the provided link to verify your account.</div>
            </div>
            <div className="register-intro-step">
              <div className="register-intro-step-count">3</div>
              <div className="register-intro-step-desc">Start recording the testcases.</div>
            </div>
            <div className="flex">
              <Link to="/" className="negative-button">
                <i className="fa fa-home" />
                Got it, Go to home.
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
