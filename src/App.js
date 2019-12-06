import React, {useState, useEffect} from 'react';
import io from 'socket.io-client';
import logo from './logo.svg';
import './App.css';
import {generatePrivateKey, getPublicFromWallet} from './crypto/wallet';
import {sendTransaction, generateNextBlock, getAccountBalance, getBlockchain, setBlockchain} from "./crypto/blockchain"
import { useCookies } from 'react-cookie';
import { getTransactionPool, setTransactionPool } from "./crypto/transactionPool"

function App() {

    const [data, setData] = useState(0);
    const [first, setFirst] = useState(true);
    const [cookies, setCookie, removeCookie] = useCookies(['jerry']);
    const [privateKey, setPrivateKey] = useState("");
    const [balance, setBalance] = useState();// useState(getAccountBalance());
    const [txPool, setTxPool] = useState(getTransactionPool());
    const [address, setAddress] = useState("");
    const [amount, setAmount] = useState(0);
    const [bc, setBc] = useState(getBlockchain());
            const socket = io('http://jerry-server.herokuapp.com');

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
        }
        socket.on("resTxPool", (TxPool) => {
            console.log("got pool:", TxPool);
            setTransactionPool(TxPool);
            setTxPool(TxPool);
        })
        socket.on("resBlockchain", (bc) => {
          console.log("got bc:", bc);
          if(bc.length > 0) {
  setBlockchain(bc);
  setBc(bc);
          }
        })

              socket.on("tx", (TxPool) => {
                console.log("got pool:", TxPool);
                setTransactionPool(TxPool);
                setTxPool(TxPool);
              })
              socket.on("bc", (bc) => {
                console.log("got bc:", bc);
                if (bc.length > 0) {
                  setBlockchain(bc);
                  setBc(bc);
                }
              })


        if(cookies.jerry == undefined) {
          let key = generatePrivateKey();
                    console.log("making key", key)
                    setCookie("jerry", key);

          setPrivateKey(getPublicFromWallet());
        } else {
          console.log(cookies.jerry);
          setPrivateKey(getPublicFromWallet());
        }

            //  const newBlock = generateNextBlock();

            //  sendTransaction(generatePrivateKey(), 2);
            //  setTxPool(getTransactionPool());
            //  console.log(getTransactionPool());
            //  setBalance(getAccountBalance());
        return () => {
          socket.emit("disconnect");
        }
  }, [cookies, privateKey, first, setBalance, setPrivateKey, removeCookie, setCookie, socket]);


  return (
    <>
    <h1> Test </h1>
    <p>{ data }</p>

    <input
          type="text"
          value={address}
          onChange={e => setAddress(e.target.value)}
        />
           < input
           type = "text"
           value = {
             amount
           }
           onChange = { (e) => {
             let amount;
             if(e.target.value == "") {
               amount = 0;
             } else {
              amount = parseInt(e.target.value);
             }
              setAmount(amount)
           }}
           />

           < button onClick = { () => {
             generateNextBlock();
             setBalance(getAccountBalance());
             socket.emit("sendBlockchain", getBlockchain());
            } } >generateNextBlock </button>

            < button onClick = {
              () => {
                
                socket.emit("sendTx", sendTransaction(address, amount));
              }
            } > sendTransaction </button>
           

           {txPool.forEach( (item) => {
              return (<p>item.id</p>);
           }
             
           ) }

<p> {privateKey} </p>
<p> {balance} </p>
 <p> transactionPool: </p> 

 
    </>
  );
}

export default App;
