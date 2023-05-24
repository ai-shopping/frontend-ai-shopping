import userIcon from "../assets/icons/user.svg"
import botLogo from "../assets/icons/bot-logo.svg"

interface MessageProps {
  text:string;
  timestamp:number;
  isUserMessage:boolean;
}

const Message = (props: MessageProps) => {
  if (props.isUserMessage) {
    return (
      <div className={`message user-message`}>
        <div className="d-flex align-items-center my-2">
          <img src={userIcon} className="mx-2" />
          <h6 className="d-inline">Your question: </h6>
        </div>
        <p className="message-text px-3">{props.text}</p>
      </div>
    );
  } else {
    return (
      <div className={`message bot-message`}>
        <div className="head-message my-2">
          <img src={botLogo} className="mx-2" />
          <h6 className="d-inline">Carl: </h6>
        </div>
        <p className="message-text px-3">{props.text}</p>
      </div>
    );
  }
};

export default Message;