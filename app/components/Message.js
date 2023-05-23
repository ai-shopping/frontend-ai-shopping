import userIcon from "../assets/icons/user.svg"
import botLogo from "../assets/icons/bot-logo.svg"

const Message = ({ text, timestamp, isUserMessage }) => {
  if (isUserMessage) {
    return (
      <div className={`message user-message`}>
        <div className="d-flex align-items-center my-2">
          <img src={userIcon} className="mx-2" />
          <h6 className="d-inline">Your question: </h6>
        </div>
        <p className="message-text px-3">{text}</p>
      </div>
    );
  } else {
    return (
      <div className={`message bot-message`}>
        <div className="head-message my-2">
          <img src={botLogo} className="mx-2" />
          <h6 className="d-inline">Carl: </h6>
        </div>
        <p className="message-text px-3">{text}</p>
      </div>
    );
  }
};

export default Message;