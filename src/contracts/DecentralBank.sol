pragma solidity ^0.5.0;

import "./RWD.sol";
import "./Tether.sol";
import "./Fenda.sol";

contract DecentralBank {
    string public name = "Decentral Bank";
    address public owner;
    Tether public tether;
    RWD public rwd;
    Fenda public fenda;

    address[] public stackers;

    mapping(address => uint256) public stackingBalance;
    mapping(address => bool) public hasStacked;
    mapping(address => bool) public isStacking;

    constructor(
        RWD _rwd,
        Tether _tether,
        Fenda _fenda
    ) public {
        rwd = _rwd;
        tether = _tether;
        fenda = _fenda;
        owner = msg.sender;
    }

    // Stacking function
    function depositTokens(uint256 _amount) public {
        // require(_amount <= tether.balanceOf(msg.sender), "cannot stack more token than you have");
        require(_amount > 0, "amount cannot be 0");

        // Transfer tether tokens to this contract addresss for stacking
        tether.transferFrom(msg.sender, address(this), _amount);

        // Update stacking balance
        stackingBalance[msg.sender] += _amount;

        if (!hasStacked[msg.sender]) {
            stackers.push(msg.sender);
        }

        // Update stacking balance
        isStacking[msg.sender] = true;
        hasStacked[msg.sender] = true;
    }

    // issue rewards
    function issueTokens() public {
        require(msg.sender == owner, "Caller must be the owner");

        for (uint256 i = 0; i < stackers.length; i++) {
            address recipient = stackers[i];
            uint256 balance = stackingBalance[recipient] / 9; // divisier par 9 to create percentage incentive for stackers
            if (balance > 0) {
                rwd.transfer(recipient, balance);
            }
        }
    }

    // unstack
    function unstackeTokens() public {
        uint256 balance = stackingBalance[msg.sender];
        // require the amount to be greater than zero
        require(balance > 0, "stacking balance can't be less than zero");

        // transfer the tokens to the specified contract address from our bank
        tether.transfer(msg.sender, balance);

        // Update stacking balance
        stackingBalance[msg.sender] = 0;

        // Update stacking balance
        isStacking[msg.sender] = false;
    }
}
