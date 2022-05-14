const Tether = artifacts.require("Tether");
const RWD = artifacts.require("RWD");
const DecentralBank = artifacts.require("DecentralBank");
const Fenda = artifacts.require("Fenda");

module.exports = async function(deployer, network, accounts) {
    // Deploy Fenda Token
    await deployer.deploy(Fenda);
    const fenda = await Fenda.deployed();

    // Deploy Mock Tether Token
    await deployer.deploy(Tether);
    const tether = await Tether.deployed();

    // Deploy RWD Token
    await deployer.deploy(RWD);
    const rwd = await RWD.deployed();

    // Deploy DecentralBank Contract
    await deployer.deploy(DecentralBank, rwd.address, tether.address, fenda.address);
    const decentralBank = await DecentralBank.deployed();

    // Transfer all RWD Decentral Bank
    await rwd.transfer(decentralBank.address, "1000000000000000000000000");

    // Transfer 100 Mock Tether tokens to investor
    await tether.transfer(accounts[1], "100000000000000000000");

    // Transfer 100 Mock Fenda tokens to investor
    await fenda.transfer(accounts[1], "100000000000000000000");
};