pragma solidity ^0.5.0;

contract Fenda {
    string public name = "Fenda Token";
    string public symbol = "FDA";
    uint256 public totalSupply = 1000000000000000000000000;
    uint8 public decimals = 18;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    mapping(address => uint256) public balanceOf;

    // Add a mapping to which we send an address, for these addresses, we do the same thing.
    // We do a mapping and we provide a key value for each address that is going to be set to our allocation.
    // That's how we're going to be able to track the iterations of our allocation.
    // [msg.sender][_to]
    mapping(address => mapping(address => uint256)) public allowance;

    constructor() public {
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(address _to, uint256 _value)
        public
        returns (bool success)
    {
        // Require that the value is greater or equal for transfer
        require(balanceOf[msg.sender] >= _value);
        // Transfer the amount and substract the balance
        balanceOf[msg.sender] -= _value;
        // Add the balance
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value)
        public
        returns (bool success)
    {
        // Verifying the value is the same for the msg.sender & _spender
        allowance[msg.sender][_spender] = _value;
        // So we call the event Approval
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool success) {
        require(_value <= balanceOf[_from]);
        require(_value <= allowance[_from][msg.sender]);
        // add the balance for transferFrom
        balanceOf[_to] += _value;
        // substract the balance for transferFrom
        balanceOf[_from] -= _value;
        // The allowance is checking the address "from" for the message sender and if that's got to be equal to thaht minus the value
        allowance[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }
}
