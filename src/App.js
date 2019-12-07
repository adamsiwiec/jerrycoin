// import "assets/vendor/nucleo/css/nucleo.css";
// import "assets/vendor/font-awesome/css/font-awesome.min.css";
// import "assets/scss/argon-design-system-react.scss";

import React, {useState, useEffect, useCallback} from 'react';
import io from 'socket.io-client';
import logo from './logo.svg';
import './App.css';
import {generatePrivateKey, getPublicFromWallet} from './crypto/wallet';
import {sendTransaction, generateNextBlock, getAccountBalance, getBlockchain, setBlockchain, replaceChain} from "./crypto/blockchain"
import { useCookies } from 'react-cookie';
import { getTransactionPool, setTransactionPool } from "./crypto/transactionPool"
import {
  handleBlockchainResponse
} from "./crypto/p2p";
import classnames from "classnames";

// reactstrap components
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardImg,
  Form,
  FormGroup,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Container,
  Row,
  Col
} from "reactstrap";
import useSocket from "use-socket.io-client";

import { useAlert } from "react-alert"
import QRCode from "qrcode.react";

    // const socket = io('https://jerry-server.herokuapp.com', {
    //   transports: ['websocket']
    // });


function App() {
    const [socket] = useSocket("https://jerry-server.herokuapp.com", {
       transports: ['websocket']
     });
    const [data, setData] = useState(0);
    const [first, setFirst] = useState(true);
    const [cookies, setCookie, removeCookie] = useCookies(['jerry']);
    const [privateKey, setPrivateKey] = useState("");
    const [balance, setBalance] = useState(0);// useState(getAccountBalance());
    const [txPool, setTxPool] = useState(getTransactionPool());
    const [address, setAddress] = useState("");
    const [amount, setAmount] = useState(0);
    const [bc, setBc] = useState(getBlockchain());
    const alert = useAlert();



    let updateBalance = useCallback(() => {
      setBalance(getAccountBalance());
    }, [setBalance]);
    
    let refreshBlock = useCallback((bc) => {
        alert.show("Got New Block #" + bc.length);
                    console.log(bc);

        handleBlockchainResponse(bc);
        updateBalance();
    }, [alert, updateBalance]);

    let refreshTxPool = useCallback((Tx) => {
            console.log(Tx);
            alert.show("Got New Transaction Pool");
            setTransactionPool(Tx);
            setTxPool(Tx);
    }, [alert]);


        socket.connect();

  // Similar to componentDidMount and componentDidUpdate:
  useEffect(() => {
        console.log("yeah", cookies.jerry)
        //Very simply connect to the socket
        //Listen for data on the "outgoing data" namespace and supply a callback for what to do when we get one. In this case, we set a state variable
        if (first)  {
          console.log("running first");
          socket.emit("getTxPool");
          socket.emit("getBlockchain");
          setFirst(false);
           socket.on("resTxPool", TxPool => {
             console.log("got pool:", TxPool);
             refreshTxPool(TxPool);
           });
           socket.on("resBlockchain", bc => {
             console.log("got bc:", bc);
             refreshBlock(bc);
           });

           socket.on("tx", TxPool => {
             console.log("got pool:", TxPool);
             refreshTxPool(TxPool);
           });
           socket.on("bc", bc => {
             console.log("got bc:", bc);
             refreshBlock(bc);
           });
        }
       


        if(cookies.jerry == undefined) {
          let key = generatePrivateKey();
                    console.log("making key", key)
                    setCookie("jerry", key);

          setPrivateKey(getPublicFromWallet());
        } else {
          console.log(cookies.jerry);
          setPrivateKey(getPublicFromWallet());
        }
        return () => {
          socket.emit("disconnect");
        }
  }, [cookies, privateKey, first, setBalance, setPrivateKey, removeCookie, setCookie, refreshBlock, refreshTxPool, socket]);


  return (
    <>
    <img src={require('./assets/ultimateJerry.gif')}/>
      <h1> Jerry Coin </h1>
      {/* <p>{data}</p> */}
      <Form>
        <Row>
          <Col>
            <Input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
            />
          </Col>

          <Col>
            <Input
              type="text"
              value={amount}
              onChange={e => {
                let amount;
                if (e.target.value == "") {
                  amount = 0;
                } else {
                  amount = parseInt(e.target.value);
                }
                setAmount(amount);
              }}
            />
          </Col>
        </Row>
      </Form>

      <QRCode value={privateKey} />

      <Button
        onClick={() => {
          generateNextBlock();
          setBalance(getAccountBalance());
          socket.emit("sendBlockchain", getBlockchain());
        }}
      >
        Generate Block
      </Button>

      <Button
        onClick={() => {
          socket.emit("sendTx", sendTransaction(address, amount));
        }}
      >
        Send Transaction
      </Button>

      {txPool.forEach(item => {
        return <p>item.id</p>;
      })}

      <p> {privateKey} </p>
      <p> {balance} </p>
    </>
  );
}

export default App;
