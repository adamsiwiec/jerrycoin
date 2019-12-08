import React, {useState, useEffect, useCallback} from 'react';
import logo from './logo.svg';
import './App.css';
import {generatePrivateKey, getPublicFromWallet} from './crypto/wallet';
import {sendTransaction, generateNextBlock, getAccountBalance, getBlockchain} from "./crypto/blockchain"
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
  Label,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Jumbotron,
  Container,
  Row,
  Col
} from "reactstrap";
import useSocket from "use-socket.io-client";

import { useAlert } from "react-alert"
import QRCode from "qrcode.react";

 


function App() {
     const [socket] = useSocket("https://jerry-server.herokuapp.com", {
    //const [socket] = useSocket("http://localhost:4001", {

    transports: ['websocket']

      });
    const [first, setFirst] = useState(true);
    const [cookies, setCookie, removeCookie] = useCookies(['jerry']);
    const [privateKey, setPrivateKey] = useState("");
    const [balance, setBalance] = useState(0);// useState(getAccountBalance());
    const [txPool, setTxPool] = useState(getTransactionPool());
    const [address, setAddress] = useState("");
    const [amount, setAmount] = useState(0);
    const [username, setUsername] = useState("");
    const [tempUser, setTempUser] = useState("");
    const [users, setUsers] = useState([]);
    const [death, setDeath] = useState(true);
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
 if (cookies.jerry == undefined) {
   let key = generatePrivateKey();
   console.log("making key", key)
   setCookie("jerry", key);

   setPrivateKey(getPublicFromWallet());
 } else {
   console.log(cookies.jerry);
   setPrivateKey(getPublicFromWallet());
 } //Very simply connect to the socket
        //Listen for data on the "outgoing data" namespace and supply a callback for what to do when we get one. In this case, we set a state variable
        if (first && username != "")  {
          console.log("running first");
          socket.emit("getTxPool");
          socket.emit("getBlockchain");
          socket.emit("setUser", {
            username: username,
            publicKey: privateKey
          })
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
           socket.on("users", users => {
                         console.log(users);
 
            users = users.filter(function (obj) {
               return obj.username !== username;
             });
            alert.show("New User Joined");
             console.log(users);
             setUsers(users);
           })
            socket.on("userLeft", users => {
              console.log(users);

              users.users = users.users.filter(function (obj) {
                return obj.username !== username;
              });
              alert.show("user " + users.left + " left");
              console.log(users.users);
              setUsers(users.users);
            })
        }
       


       
        
  }, [cookies, privateKey, first, setBalance, setPrivateKey, removeCookie, setCookie, refreshBlock, refreshTxPool, socket, username, alert, death]);


  return (
    <>
<Container>

<Card> 
<CardImg src={require('./assets/ultimateJerry.gif')}/>
<CardBody>
<h1 className = "display-3" > Jerry Coin </h1> 
<p className = "lead" > This is Jerry Coin, a decentralized, consensus-based cryptocurrency, based right here on the web. </p> 
</CardBody>
</Card>    

<hr className = "my-2" / >
    
    
      
     {username == "" &&
     <>
      <InputGroup>
       < Input
       type = "text"
       
       onChange = {
         e => {
          setTempUser(e.target.value)
         }
       }
       />
      <InputGroupAddon>
      <Button onClick={() => {
         setUsername(tempUser);
       }}>Set Username</Button>
      </InputGroupAddon>
      </InputGroup>
      </>}
      
       
       {username != "" &&
       <>
          <Label>
            Send Address
          </Label>


          <InputGroup>
          <InputGroupAddon addonType="prepend">
          <InputGroupText>@</InputGroupText>
        </InputGroupAddon>
          <Input
              type="text"
              value={address}
              placeholder="04234adfasdfae9342..."
              onChange={e => setAddress(e.target.value)}
            />
          </InputGroup>
          
          <br></br>
          
         <InputGroup>
         <InputGroupAddon>
         <InputGroupText>
         ₵
         </InputGroupText>
         </InputGroupAddon>
          <Input
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
        <InputGroupAddon addonType = "append" >
        <Button
        onClick={() => {
          socket.emit("sendTx", sendTransaction(address, amount));
        }}
      >
      Send JC
      </Button>
        </InputGroupAddon>  
         </InputGroup>
           


      
<Row>
  <Col className="my-3" md="6">
 <QRCode value={privateKey} />

  </Col>
  < Col className = "my-3" md="6">
      <Button
        onClick={() => {
          generateNextBlock();
          setBalance(getAccountBalance());
          socket.emit("sendBlockchain", getBlockchain());
        }}
      >
        Generate Block
      </Button>
</Col>
</Row>
     


       <ul> {
           users.map(user => {
            return ( <Card>
              <p> { user.username } </p> 
              </Card>)
           }) 
           } 
         </ul>

      <p> {privateKey} </p>
      <p> {balance} </p>
      </>
          }
      </Container>

    </>
  );
}

export default App;
