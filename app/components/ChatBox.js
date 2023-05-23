import React, { useState, useRef, useEffect } from 'react';
import Message from './Message'
import Product from './Product';
import sendIcon from "../assets/icons/send.svg"
import { Scrollbars } from 'react-custom-scrollbars';



const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [products, setProducts] = useState([]);
  const messageListRef = useRef(null);

  const handleSendMessage = () => {
    if (currentMessage !== '') {
      const newMessage = {
        text: currentMessage,
        timestamp: new Date().getTime(),
        isUserMessage: true,
      };

      setMessages([...messages, newMessage]);
      setCurrentMessage('');
    }
  };

  // useEffect(() => {
  //   // Scroll to the bottom of the message list when new messages are added
  //   messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
  // }, [messages]);

  useEffect(() => {
    // Generate sample products
    const newProducts = Array.from({ length: 8 }, (_, index) => ({
      id: index + 1,
      name: `Product ${index + 1}`,
    }));

    setProducts(newProducts);
  }, []);

  return (
    <>
      <div className='d-flex justify-content-center mt-2'>
        <div className="chatbox-container">
          <div className="message-list">
          <Scrollbars style={{ height: '250px' }}>
            {messages.map((message, index) => (
              <Message
                key={index}
                text={message.text}
                timestamp={message.timestamp}
                // isUserMessage={message.isUserMessage}
                isUserMessage={true}

              />
            ))}
            </Scrollbars>
          </div>
          <div className="input-container">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Ask a question ..."
            />
            <button type='submit' onClick={handleSendMessage}>
              <img src={sendIcon} alt="Send Message" />
            </button>
          </div>
        </div>
      </div>

      <div className='container mt-3 p-3'>
        <div className="product-list">
          <div className='row'>
            {products.map((product) => (
              <div className='col-md-4'>
                <Product key={product.id} name={product.name} />
              </div>
            ))}
          </div>
        </div>
      </div>


    </>
  );
};

export default ChatBox;
