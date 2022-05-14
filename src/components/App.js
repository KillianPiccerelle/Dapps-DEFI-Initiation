import React, { Component } from "react";
import "./App.css";

import Navbar from "./Navbar";
import Main from "./Main";
import ParticleSettings from "./ParticleSettings";
import Web3 from "web3";
import Tether from "../truffle_abis/Tether.json";
import Fenda from "../truffle_abis/Fenda.json";
import RWD from "../truffle_abis/RWD.json";
import DecentralBank from "../truffle_abis/DecentralBank.json";

class App extends Component {
   async UNSAFE_componentWillMount() {
      await this.loadWeb3();
      await this.loadBlockchainData();
   }

   async loadWeb3() {
      if (window.ethereum) {
         window.web3 = new Web3(window.ethereum);
         await window.ethereum.enable();
      } else if (window.web3) {
         window.web3 = new Web3(window.web3.currentProvider);
      } else {
         window.alert("No Ethereum browser detected! You can check out Metamask!");
      }
   }
   async loadBlockchainData() {
      const web3 = window.web3;
      const account = await web3.eth.getAccounts();
      this.setState({ account: account[0] });
      // console.log(account);
      const networkId = await web3.eth.net.getId();

      // Load Fenda Contract
      const fendaData = Fenda.networks[networkId];

      if (fendaData) {
         const fenda = new web3.eth.Contract(Fenda.abi, fendaData.address);
         this.setState({ fenda });
         let fendaBalance = await fenda.methods.balanceOf(this.state.account).call();
         this.setState({ fendaBalance: fendaBalance.toString() });
         // console.log({ balance: fendaBalance });
      } else {
         window.alert("Error Fenda contract not deployed - detect network ! ");
      }

      // Load Tether Contract
      const tetherData = Tether.networks[networkId];
      if (tetherData) {
         const tether = new web3.eth.Contract(Tether.abi, tetherData.address);
         this.setState({ tether });
         let tetherBalance = await tether.methods.balanceOf(this.state.account).call();
         this.setState({ tetherBalance: tetherBalance.toString() });
      } else {
         window.alert("Error Tether contract not deployed - detect network ! ");
      }

      // Load Reward Contract
      const rwdData = RWD.networks[networkId];
      if (rwdData) {
         const rwd = new web3.eth.Contract(RWD.abi, rwdData.address);
         this.setState({ rwd });
         let rwdBalance = await rwd.methods.balanceOf(this.state.account).call();
         this.setState({ rwdBalance: rwdBalance.toString() });
      } else {
         window.alert("Error Reward contract not deployed - detect network ! ");
      }

      // Load Decentral Bank Contract
      const decentralBankData = DecentralBank.networks[networkId];
      if (decentralBankData) {
         const decentralBank = new web3.eth.Contract(DecentralBank.abi, decentralBankData.address);
         this.setState({ decentralBank });
         let stackingBalance = await decentralBank.methods.stackingBalance(this.state.account).call();
         this.setState({ stackingBalance: stackingBalance.toString() });
      } else {
         window.alert("Error Decentral Bank contract not deployed - detect network ! ");
      }

      this.setState({ loading: false });
   }

   // Stacking function
   stackeTokens = (amount) => {
      this.setState({ loading: true });
      this.state.tether.methods
         .approve(this.state.decentralBank._address, amount)
         .send({ from: this.state.account })
         .on("transactionHash", (hash) => {
            this.state.decentralBank.methods
               .depositTokens(amount)
               .send({ from: this.state.account })
               .on("transactionHash", (hash) => {
                  this.setState({ loading: false });
               });
         });
   };

   // Unstacking function
   unstackeTokens = () => {
      this.setState({ loading: true });
      this.state.decentralBank.methods
         .unstackeTokens()
         .send({ from: this.state.account })
         .on("transactionHash", (hash) => {
            this.setState({ loading: false });
         });
   };

   constructor(props) {
      super(props);
      this.state = {
         account: "0x0",
         tether: {},
         rwd: {},
         fenda: {},
         decentralBank: {},
         tetherBalance: "0",
         rwdBalance: "0",
         fendaBalance: "0",
         stackingBalance: "0",
         loading: true,
      };
   }

   // Our React code goes in here !
   render() {
      let content;
      {
         this.state.loading
            ? (content = (
                 <p id="loader" className="text-center" style={{ marigin: "30px", color: "white" }}>
                    {" "}
                    LOADING PLEASE...
                 </p>
              ))
            : (content = (
                 <Main
                    tetherBalance={this.state.tetherBalance}
                    rwdBalance={this.state.rwdBalance}
                    stackingBalance={this.state.stackingBalance}
                    stackeTokens={this.stackeTokens}
                    unstackeTokens={this.unstackeTokens}
                 />
              ));
      }
      return (
         <div className="App" style={{ position: "relative" }}>
            <div style={{ position: "absolute" }}>
               <ParticleSettings />
            </div>

            <Navbar account={this.state.account} />
            <div className="container-fluid mt-5">
               <div className="row">
                  <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: "600px", minHeight: "100vm" }}>
                     <div>{content}</div>
                  </main>
               </div>
            </div>
         </div>
      );
   }
}

export default App;
