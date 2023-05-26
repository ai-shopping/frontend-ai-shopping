import userIcon from "../assets/icons/user.svg"
import botLogo from "../assets/icons/bot-logo.svg"
import { question } from "~/common/apis/products";
import { Ref, useEffect, useState } from "react";
import { MessageDto } from "~/data/models/message_dto";

interface MessageProps {
  text:string;
  timestamp:number;
  isUserMessage:boolean;
  onCompleteResponse:(answer:string) => void|undefined;
  reciveProducts: (items:string[]) => void|undefined;
}

export default function Message(props: MessageProps) {
  const [answer,setAnswer] = useState<string>("")

  function getMessageAnswer(text: string) {
    question(text).then((response) => {
      setAnswer(response?.answer ?? "")
      props.onCompleteResponse(response?.answer ?? "")
      props.reciveProducts(extractProductIds(response?.answer ?? ""))
      
    }).catch(error => {
      console.log(error);
    })
  }

  function extractProductIds(text: string): string[] {
    const regex = /ID:\d+/g;
    const matches = text.match(regex);
    if (matches) {
      return matches;
    }
    return [];
  }

  useEffect(()=>{
    getMessageAnswer(props.text)
  }, [])

  if (props.isUserMessage) {
    return <>
    <div className={`message user-message`}>
        <div className="d-flex align-items-center my-2">
          <img src={userIcon} className="mx-2" />
          <h6 className="d-inline">Your question: </h6>
        </div>
        <p className="message-text px-3">{props.text}</p>
      </div>
      {answer != "" ? <div className={`message bot-message`}>
      <div className="head-message my-2">
        <img src={botLogo} className="mx-2" />
        <h6 className="d-inline">Carl: </h6>
      </div>
      <p className="message-text px-3">{answer}</p>
    </div> : <></>}
    </>
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