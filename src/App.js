import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import { generatePrivateKey, getPublicFromWallet } from "./crypto/wallet";
import {
  sendTransaction,
  generateNextBlock,
  getAccountBalance,
  getBlockchain
} from "./crypto/blockchain";
import { useCookies } from "react-cookie";
import { setTransactionPool } from "./crypto/transactionPool";
import { handleBlockchainResponse } from "./crypto/p2p";
import {
  Button,
  Card,
  CardBody,
  CardImg,
  Input,
  Label,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Container,
  Row,
  Col
} from "reactstrap";
import useSocket from "use-socket.io-client";
import { useAlert } from "react-alert";
import QRCode from "qrcode.react";

function App() {
  const [socket] = useSocket("https://jerrycoinserver.siwiec.us", {
    transports: ["websocket"]
  });
  const [first, setFirst] = useState(true);
  const [cookies, setCookie, removeCookie] = useCookies(["jerry"]);
  const [privateKey, setPrivateKey] = useState("");
  const [balance, setBalance] = useState(0); 
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState(0);
  const [username, setUsername] = useState("");
  const [tempUser, setTempUser] = useState("");
  const [users, setUsers] = useState([]);
  const alert = useAlert();

  let updateBalance = useCallback(() => {
    setBalance(getAccountBalance());
  }, [setBalance]);

  let refreshBlock = useCallback(
    bc => {
      alert.show("Got New Block #" + bc.length);
      console.log(bc);

      handleBlockchainResponse(bc);
      updateBalance();
    },
    [alert, updateBalance]
  );

  let refreshTxPool = useCallback(
    Tx => {
      console.log(Tx);
      alert.show("Got New Transaction Pool");
      setTransactionPool(Tx);
    },
    [alert]
  );

  socket.connect();

  // Similar to componentDidMount and componentDidUpdate:
  useEffect(() => {
    if (cookies.jerry === undefined) {
      let key = generatePrivateKey();
      console.log("making key", key);
      setCookie("jerry", key);

      setPrivateKey(getPublicFromWallet());
    } else {
      console.log(cookies.jerry);
      setPrivateKey(getPublicFromWallet());
    } //Very simply connect to the socket
    //Listen for data on the "outgoing data" namespace and supply a callback for what to do when we get one. In this case, we set a state variable
    if (first && username !== "") {
      console.log("running first");
      socket.emit("getTxPool");
      socket.emit("getBlockchain");
      socket.emit("setUser", {
        username: username,
        publicKey: privateKey
      });
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

        users = users.filter(function(obj) {
          return obj.username !== username;
        });
        alert.show("New User Joined");
        console.log(users);
        setUsers(users);
      });
      socket.on("userLeft", users => {
        console.log(users);

        users.users = users.users.filter(function(obj) {
          return obj.username !== username;
        });
        alert.show("user " + users.left + " left");
        console.log(users.users);
        setUsers(users.users);
      });
    }
  }, [
    cookies,
    privateKey,
    first,
    setBalance,
    setPrivateKey,
    removeCookie,
    setCookie,
    refreshBlock,
    refreshTxPool,
    socket,
    username,
    alert
  ]);

  return (
    <>
      <Container>
        <Card>
          <CardImg src={require("./assets/ultimateJerry.gif")} />
          <CardBody>
            <h1 className="display-3"> JerryCoin </h1>
            <h6 className="lead">
              This is JerryCoin, a decentralized, consensus-based
              cryptocurrency, based right here on the web.
            </h6>
          </CardBody>
        </Card>

        <hr className="my-2" />

        {username === "" && (
          <>
            <InputGroup>
              <Input
                type="text"
                onChange={e => {
                  setTempUser(e.target.value);
                }}
              />
              <InputGroupAddon addonType="append">
                <Button
                  onClick={() => {
                    setUsername(tempUser);
                  }}
                >
                  Set Username
                </Button>
              </InputGroupAddon>
            </InputGroup>
          </>
        )}

        {username !== "" && (
          <>
         <Card><h6 className="lead"> Public Key: {privateKey} </h6></Card>
            <br/>
            <Card><h6 className="lead">Balance: {balance} </h6></Card>
            <br/>
            <Row>
              <Col md="3">
                <Label>
                  <p classnames="text-white"> Send Address </p>
                </Label>
              </Col>
              <Col md="9"></Col>
            </Row>

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
            <Row>
              <Col md="2">
                <Label>
                  <p classnames="text-white"> Amount To Send </p>
                </Label>
              </Col>
              <Col md="10"></Col>
            </Row>
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>₵</InputGroupText>
              </InputGroupAddon>
              <Input
                value={amount}
                onChange={e => {
                  let amount;
                  if (e.target.value === "") {
                    amount = 0;
                  } else {
                    amount = parseInt(e.target.value);
                  }
                  setAmount(amount);
                }}
              />
              <InputGroupAddon addonType="append">
                <Button
                  onClick={() => {
                    let tx;
                    try {
                     tx = sendTransaction(address, amount)
                      socket.emit("sendTx", tx);

                    } catch(e) {
                      console.log(e)
                      alert.error("You dont have enough coins")
                    }
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
              <Col className="my-3" md="6">
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

              <p>Click On Users To Load Their Address:</p>
              {users.map(user => {
                return (
                  <Card
                    onClick={() => {
                      setAddress(user.publicKey);
                    }}
                  >
                    <h6> {user.username} </h6>
                  </Card>
                );
              })}

            
          </>
        )}
      </Container>
    </>
  );
}

export default App;
