const Tether = artifacts.require("Tether");
const RWD = artifacts.require("RWD");
const DecentralBank = artifacts.require("DecentralBank");
const Fenda = artifacts.require("Fenda");

require("chai")
    .use(require("chai-as-promised"))
    .should();

contract("decentralBank", ([owner, investor]) => {
    // All of the code goes here for testing

    let tether, rwd, fenda, decentralBank;

    function tokens(number) {
        return web3.utils.toWei(number, "ether");
    }

    before(async() => {
        tether = await Tether.new();
        rwd = await RWD.new();
        fenda = await Fenda.new();
        decentralBank = await DecentralBank.new(
            rwd.address,
            tether.address,
            fenda.address
        );

        // Transfer all RWD Decentral Bank
        await rwd.transfer(decentralBank.address, tokens("1000000"));

        // Transfer 100 mock tether to investor
        await tether.transfer(investor, tokens("100"), { from: owner });
        await fenda.transfer(investor, tokens("100"), { from: owner });
    });

    describe("Mock Tether Deployment", async() => {
        it("matches name successfully", async() => {
            const name = await tether.name();
            assert.equal(name, "Mock Tether Token");
        });
    });

    describe("Reward Token Deployment", async() => {
        it("matches name successfully", async() => {
            const name = await rwd.name();
            assert.equal(name, "Reward Token");
        });
    });

    describe("Fenda Token Deployment", async() => {
        it("matches name successfully", async() => {
            const name = await fenda.name();
            assert.equal(name, "Fenda Token");
        });
    });

    describe("Decentral Bank Deployment", async() => {
        it("matches name successfully", async() => {
            const name = await decentralBank.name();
            assert.equal(name, "Decentral Bank");
        });

        it("contract has tokens", async() => {
            let balance = await rwd.balanceOf(decentralBank.address);
            assert.equal(balance, tokens("1000000"));
        });
    });

    describe("Yield Farming", async() => {
        it("reward tokens for stacking", async() => {
            let result;

            // Check Investor Balance
            result = await tether.balanceOf(investor);
            assert.equal(
                result.toString(),
                tokens("100"),
                "investor mock wallet balance before staking"
            );

            // Check Staking For investor of 100 tokens
            await tether.approve(decentralBank.address, tokens("100"), {
                from: investor,
            });
            await decentralBank.depositTokens(tokens("100"), { from: investor });

            // Check Updated Balance of investor
            result = await tether.balanceOf(investor);
            assert.equal(
                result.toString(),
                tokens("0"),
                "investor mock wallet balance after staking 100 tokens"
            );

            // Check Updated Balance of Decentral Bank
            result = await tether.balanceOf(decentralBank.address);
            assert.equal(
                result.toString(),
                tokens("100"),
                "decentral bank mock wallet balance after staking from investor"
            );

            // Is Staking Update
            result = await decentralBank.isStacking(investor);
            assert.equal(
                result.toString(),
                "true",
                "investor is staking status after staking"
            );

            // Issue Token
            await decentralBank.issueTokens({ from: owner });

            // Ensure only the owner can issue token
            await decentralBank.issueTokens({ from: investor }).should.be.rejected;

            // Unstacke Tokens
            await decentralBank.unstackeTokens({ from: investor });

            // Check results after unstacking
            result = await tether.balanceOf(investor);
            assert.equal(
                result.toString(),
                tokens("100"),
                "investor mock wallet balance after unstaking 100 tokens"
            );

            result = await tether.balanceOf(decentralBank.address);
            assert.equal(
                result.toString(),
                tokens("0"),
                "Token Farm Mock Tether after unstaking from investor"
            );

            result = await decentralBank.stackingBalance(investor);
            assert.equal(
                result.toString(),
                tokens("0"),
                "Investor balance stacking correct after unstaking from investor"
            );

            result = await decentralBank.isStacking(investor);
            assert.equal(
                result.toString(),
                "false",
                "Investor stacking correct after stacking"
            );
        });
    });
});