import React, { useState, useRef, useEffect } from 'react';
import Message from './Message'
import sendIcon from "../assets/icons/send.svg"
import { Scrollbars } from 'react-custom-scrollbars';
import { MessageDto, MessageType } from '~/data/models/message_dto';
import { getProdcutApi, question } from '~/common/apis/products';
import { ProductDto } from '~/data/models/product_dto';
import Product from './Product';



export default function ChatBox() {
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>("")
  const [products, setProducts] = useState<ProductDto[]>([]);

  function getProducts(items:string[]) {
    let fetchProducts: Promise<ProductDto>[] = [];
    items.forEach((item) => {
      fetchProducts.push(getProdcutApi(item));
    });
    Promise.all(fetchProducts).then((products) => {
      setProducts(products);
    });

  }

  function scrollToEnd() {
    document.querySelector('#chat')?.querySelector('div')?.scrollTo({
      top: document.querySelector('#chat')?.querySelector('div')?.scrollHeight ?? 1000
    })
  }

  function handleKeyDown(event:any) {
    if (event.key === 'Enter') {
      handleSendMessage()
    }
  }

  function handleSendMessage() {
    if (currentMessage !== '') {
      const newMessage: MessageDto = {
        text: currentMessage,
        timestamp: new Date().getTime(),
        type: MessageType.USER
      };

      setCurrentMessage('');
      setMessages([...messages, newMessage]);
      scrollToEnd()

    }

    return false
  };

  return (
    <>
      <div className='d-flex justify-content-center mt-2'>
        <div className="chatbox-container">
          <div className="message-list">
            <Scrollbars style={{ height: '250px' }} id="chat">
              {messages.map((message: any, index: number) => (
                <Message
                  key={index}
                  text={message.text}
                  timestamp={message.timestamp}
                  isUserMessage={message.type === MessageType.USER}
                  onCompleteResponse={() => {
                    scrollToEnd()
                  }}
                  reciveProducts={(items) => getProducts(items)}
                />
              ))}
            </Scrollbars>
          </div>
          <div className="input-container">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question ..."
              />
              <button type='submit' onClick={() => {
                handleSendMessage()
              }}>
                <img src={sendIcon} alt="Send Message" />
              </button>
          </div>
        </div>
      </div>

      {/* @TODO: get product list for preview in store */}
      <div className='container mt-3 p-3'>
        <div className="product-list">
          <div className='row'>
            {products.map((product: any) => (
              <div className='col-md-4'>
                <Product key={product?.id} name={product?.title} price={''} product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>


    </>
  );
};