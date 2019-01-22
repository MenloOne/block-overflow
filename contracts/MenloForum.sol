pragma solidity ^0.4.13;

library SafeMath {

  /**
  * @dev Multiplies two numbers, throws on overflow.
  */
  function mul(uint256 _a, uint256 _b) internal pure returns (uint256 c) {
    // Gas optimization: this is cheaper than asserting 'a' not being zero, but the
    // benefit is lost if 'b' is also tested.
    // See: https://github.com/OpenZeppelin/openzeppelin-solidity/pull/522
    if (_a == 0) {
      return 0;
    }

    c = _a * _b;
    assert(c / _a == _b);
    return c;
  }

  /**
  * @dev Integer division of two numbers, truncating the quotient.
  */
  function div(uint256 _a, uint256 _b) internal pure returns (uint256) {
    // assert(_b > 0); // Solidity automatically throws when dividing by 0
    // uint256 c = _a / _b;
    // assert(_a == _b * c + _a % _b); // There is no case in which this doesn't hold
    return _a / _b;
  }

  /**
  * @dev Subtracts two numbers, throws on overflow (i.e. if subtrahend is greater than minuend).
  */
  function sub(uint256 _a, uint256 _b) internal pure returns (uint256) {
    assert(_b <= _a);
    return _a - _b;
  }

  /**
  * @dev Adds two numbers, throws on overflow.
  */
  function add(uint256 _a, uint256 _b) internal pure returns (uint256 c) {
    c = _a + _b;
    assert(c >= _a);
    return c;
  }
}

contract Ownable {
  address public owner;


  event OwnershipRenounced(address indexed previousOwner);
  event OwnershipTransferred(
    address indexed previousOwner,
    address indexed newOwner
  );


  /**
   * @dev The Ownable constructor sets the original `owner` of the contract to the sender
   * account.
   */
  constructor() public {
    owner = msg.sender;
  }

  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  /**
   * @dev Allows the current owner to relinquish control of the contract.
   * @notice Renouncing to ownership will leave the contract without an owner.
   * It will not be possible to call the functions with the `onlyOwner`
   * modifier anymore.
   */
  function renounceOwnership() public onlyOwner {
    emit OwnershipRenounced(owner);
    owner = address(0);
  }

  /**
   * @dev Allows the current owner to transfer control of the contract to a newOwner.
   * @param _newOwner The address to transfer ownership to.
   */
  function transferOwnership(address _newOwner) public onlyOwner {
    _transferOwnership(_newOwner);
  }

  /**
   * @dev Transfers control of the contract to a newOwner.
   * @param _newOwner The address to transfer ownership to.
   */
  function _transferOwnership(address _newOwner) internal {
    require(_newOwner != address(0));
    emit OwnershipTransferred(owner, _newOwner);
    owner = _newOwner;
  }
}

contract Pausable is Ownable {
  event Pause();
  event Unpause();

  bool public paused = false;


  /**
   * @dev Modifier to make a function callable only when the contract is not paused.
   */
  modifier whenNotPaused() {
    require(!paused);
    _;
  }

  /**
   * @dev Modifier to make a function callable only when the contract is paused.
   */
  modifier whenPaused() {
    require(paused);
    _;
  }

  /**
   * @dev called by the owner to pause, triggers stopped state
   */
  function pause() public onlyOwner whenNotPaused {
    paused = true;
    emit Pause();
  }

  /**
   * @dev called by the owner to unpause, returns to normal state
   */
  function unpause() public onlyOwner whenPaused {
    paused = false;
    emit Unpause();
  }
}

contract CanReclaimToken is Ownable {
  using SafeERC20 for ERC20Basic;

  /**
   * @dev Reclaim all ERC20Basic compatible tokens
   * @param _token ERC20Basic The address of the token contract
   */
  function reclaimToken(ERC20Basic _token) external onlyOwner {
    uint256 balance = _token.balanceOf(this);
    _token.safeTransfer(owner, balance);
  }

}

contract ERC20Basic {
  function totalSupply() public view returns (uint256);
  function balanceOf(address _who) public view returns (uint256);
  function transfer(address _to, uint256 _value) public returns (bool);
  event Transfer(address indexed from, address indexed to, uint256 value);
}

contract BasicToken is ERC20Basic {
  using SafeMath for uint256;

  mapping(address => uint256) internal balances;

  uint256 internal totalSupply_;

  /**
  * @dev Total number of tokens in existence
  */
  function totalSupply() public view returns (uint256) {
    return totalSupply_;
  }

  /**
  * @dev Transfer token for a specified address
  * @param _to The address to transfer to.
  * @param _value The amount to be transferred.
  */
  function transfer(address _to, uint256 _value) public returns (bool) {
    require(_value <= balances[msg.sender]);
    require(_to != address(0));

    balances[msg.sender] = balances[msg.sender].sub(_value);
    balances[_to] = balances[_to].add(_value);
    emit Transfer(msg.sender, _to, _value);
    return true;
  }

  /**
  * @dev Gets the balance of the specified address.
  * @param _owner The address to query the the balance of.
  * @return An uint256 representing the amount owned by the passed address.
  */
  function balanceOf(address _owner) public view returns (uint256) {
    return balances[_owner];
  }

}

contract BurnableToken is BasicToken {

  event Burn(address indexed burner, uint256 value);

  /**
   * @dev Burns a specific amount of tokens.
   * @param _value The amount of token to be burned.
   */
  function burn(uint256 _value) public {
    _burn(msg.sender, _value);
  }

  function _burn(address _who, uint256 _value) internal {
    require(_value <= balances[_who]);
    // no need to require value <= totalSupply, since that would imply the
    // sender's balance is greater than the totalSupply, which *should* be an assertion failure

    balances[_who] = balances[_who].sub(_value);
    totalSupply_ = totalSupply_.sub(_value);
    emit Burn(_who, _value);
    emit Transfer(_who, address(0), _value);
  }
}

contract ERC20 is ERC20Basic {
  function allowance(address _owner, address _spender)
    public view returns (uint256);

  function transferFrom(address _from, address _to, uint256 _value)
    public returns (bool);

  function approve(address _spender, uint256 _value) public returns (bool);
  event Approval(
    address indexed owner,
    address indexed spender,
    uint256 value
  );
}

library SafeERC20 {
  function safeTransfer(
    ERC20Basic _token,
    address _to,
    uint256 _value
  )
    internal
  {
    require(_token.transfer(_to, _value));
  }

  function safeTransferFrom(
    ERC20 _token,
    address _from,
    address _to,
    uint256 _value
  )
    internal
  {
    require(_token.transferFrom(_from, _to, _value));
  }

  function safeApprove(
    ERC20 _token,
    address _spender,
    uint256 _value
  )
    internal
  {
    require(_token.approve(_spender, _value));
  }
}

contract StandardToken is ERC20, BasicToken {

  mapping (address => mapping (address => uint256)) internal allowed;


  /**
   * @dev Transfer tokens from one address to another
   * @param _from address The address which you want to send tokens from
   * @param _to address The address which you want to transfer to
   * @param _value uint256 the amount of tokens to be transferred
   */
  function transferFrom(
    address _from,
    address _to,
    uint256 _value
  )
    public
    returns (bool)
  {
    require(_value <= balances[_from]);
    require(_value <= allowed[_from][msg.sender]);
    require(_to != address(0));

    balances[_from] = balances[_from].sub(_value);
    balances[_to] = balances[_to].add(_value);
    allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
    emit Transfer(_from, _to, _value);
    return true;
  }

  /**
   * @dev Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.
   * Beware that changing an allowance with this method brings the risk that someone may use both the old
   * and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this
   * race condition is to first reduce the spender's allowance to 0 and set the desired value afterwards:
   * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
   * @param _spender The address which will spend the funds.
   * @param _value The amount of tokens to be spent.
   */
  function approve(address _spender, uint256 _value) public returns (bool) {
    allowed[msg.sender][_spender] = _value;
    emit Approval(msg.sender, _spender, _value);
    return true;
  }

  /**
   * @dev Function to check the amount of tokens that an owner allowed to a spender.
   * @param _owner address The address which owns the funds.
   * @param _spender address The address which will spend the funds.
   * @return A uint256 specifying the amount of tokens still available for the spender.
   */
  function allowance(
    address _owner,
    address _spender
   )
    public
    view
    returns (uint256)
  {
    return allowed[_owner][_spender];
  }

  /**
   * @dev Increase the amount of tokens that an owner allowed to a spender.
   * approve should be called when allowed[_spender] == 0. To increment
   * allowed value is better to use this function to avoid 2 calls (and wait until
   * the first transaction is mined)
   * From MonolithDAO Token.sol
   * @param _spender The address which will spend the funds.
   * @param _addedValue The amount of tokens to increase the allowance by.
   */
  function increaseApproval(
    address _spender,
    uint256 _addedValue
  )
    public
    returns (bool)
  {
    allowed[msg.sender][_spender] = (
      allowed[msg.sender][_spender].add(_addedValue));
    emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
    return true;
  }

  /**
   * @dev Decrease the amount of tokens that an owner allowed to a spender.
   * approve should be called when allowed[_spender] == 0. To decrement
   * allowed value is better to use this function to avoid 2 calls (and wait until
   * the first transaction is mined)
   * From MonolithDAO Token.sol
   * @param _spender The address which will spend the funds.
   * @param _subtractedValue The amount of tokens to decrease the allowance by.
   */
  function decreaseApproval(
    address _spender,
    uint256 _subtractedValue
  )
    public
    returns (bool)
  {
    uint256 oldValue = allowed[msg.sender][_spender];
    if (_subtractedValue >= oldValue) {
      allowed[msg.sender][_spender] = 0;
    } else {
      allowed[msg.sender][_spender] = oldValue.sub(_subtractedValue);
    }
    emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
    return true;
  }

}

contract PausableToken is StandardToken, Pausable {

  function transfer(
    address _to,
    uint256 _value
  )
    public
    whenNotPaused
    returns (bool)
  {
    return super.transfer(_to, _value);
  }

  function transferFrom(
    address _from,
    address _to,
    uint256 _value
  )
    public
    whenNotPaused
    returns (bool)
  {
    return super.transferFrom(_from, _to, _value);
  }

  function approve(
    address _spender,
    uint256 _value
  )
    public
    whenNotPaused
    returns (bool)
  {
    return super.approve(_spender, _value);
  }

  function increaseApproval(
    address _spender,
    uint _addedValue
  )
    public
    whenNotPaused
    returns (bool success)
  {
    return super.increaseApproval(_spender, _addedValue);
  }

  function decreaseApproval(
    address _spender,
    uint _subtractedValue
  )
    public
    whenNotPaused
    returns (bool success)
  {
    return super.decreaseApproval(_spender, _subtractedValue);
  }
}

contract MenloToken is PausableToken, BurnableToken, CanReclaimToken {

  // Token properties
  string public constant name = 'Menlo One';
  string public constant symbol = 'ONE';

  uint8 public constant decimals = 18;
  uint256 private constant token_factor = 10**uint256(decimals);

  // 1 billion ONE tokens in units divisible up to 18 decimals
  uint256 public constant INITIAL_SUPPLY    = 1000000000 * token_factor;

  uint256 public constant PUBLICSALE_SUPPLY = 354000000 * token_factor;
  uint256 public constant GROWTH_SUPPLY     = 246000000 * token_factor;
  uint256 public constant TEAM_SUPPLY       = 200000000 * token_factor;
  uint256 public constant ADVISOR_SUPPLY    = 100000000 * token_factor;
  uint256 public constant PARTNER_SUPPLY    = 100000000 * token_factor;

  /**
   * @dev Magic value to be returned upon successful reception of Menlo Tokens
   */
  bytes4 internal constant ONE_RECEIVED = 0x150b7a03;

  address public crowdsale;
  address public teamTimelock;
  address public advisorTimelock;

  modifier notInitialized(address saleAddress) {
    require(address(saleAddress) == address(0), "Expected address to be null");
    _;
  }

  constructor(address _growth, address _teamTimelock, address _advisorTimelock, address _partner) public {
    assert(INITIAL_SUPPLY > 0);
    assert((PUBLICSALE_SUPPLY + GROWTH_SUPPLY + TEAM_SUPPLY + ADVISOR_SUPPLY + PARTNER_SUPPLY) == INITIAL_SUPPLY);

    uint256 _poolTotal = GROWTH_SUPPLY + TEAM_SUPPLY + ADVISOR_SUPPLY + PARTNER_SUPPLY;
    uint256 _availableForSales = INITIAL_SUPPLY - _poolTotal;

    assert(_availableForSales == PUBLICSALE_SUPPLY);

    teamTimelock = _teamTimelock;
    advisorTimelock = _advisorTimelock;

    mint(msg.sender, _availableForSales);
    mint(_growth, GROWTH_SUPPLY);
    mint(_teamTimelock, TEAM_SUPPLY);
    mint(_advisorTimelock, ADVISOR_SUPPLY);
    mint(_partner, PARTNER_SUPPLY);

    assert(totalSupply_ == INITIAL_SUPPLY);
    pause();
  }

  function initializeCrowdsale(address _crowdsale) public onlyOwner notInitialized(crowdsale) {
    unpause();
    transfer(_crowdsale, balances[msg.sender]);  // Transfer left over balance after private presale allocations
    crowdsale = _crowdsale;
    pause();
    transferOwnership(_crowdsale);
  }

  function mint(address _to, uint256 _amount) internal {
    balances[_to] = _amount;
    totalSupply_ = totalSupply_.add(_amount);
    emit Transfer(address(0), _to, _amount);
  }

  /**
   * @dev Safely transfers the ownership of a given token ID to another address
   * If the target address is a contract, it must implement `onERC721Received`,
   * which is called upon a safe transfer, and return the magic value `bytes4(0x150b7a03)`;
   * otherwise, the transfer is reverted.
   * Requires the msg sender to be the owner, approved, or operator
   * @param _to address to receive the tokens.  Must be a MenloTokenReceiver based contract
   * @param _value uint256 number of tokens to transfer
   * @param _action uint256 action to perform in target _to contract
   * @param _data bytes data to send along with a safe transfer check
   **/
  function transferAndCall(address _to, uint256 _value, uint256 _action, bytes _data) public returns (bool) {
    if (transfer(_to, _value)) {
      require (MenloTokenReceiver(_to).onTokenReceived(msg.sender, _value, _action, _data) == ONE_RECEIVED, "Target contract onTokenReceived failed");
      return true;
    }

    return false;
  }
}

contract MenloTokenReceiver {

    /*
     * @dev Address of the MenloToken contract
     */
    MenloToken token;

    constructor(MenloToken _tokenContract) public {
        token = _tokenContract;
    }

    /**
     * @dev Magic value to be returned upon successful reception of Menlo Tokens
     */
    bytes4 internal constant ONE_RECEIVED = 0x150b7a03;

    /**
     * @dev Throws if called by any account other than the Menlo Token contract.
     */
    modifier onlyTokenContract() {
        require(msg.sender == address(token));
        _;
    }

    /**
     * @notice Handle the receipt of Menlo Tokens
     * @dev The MenloToken contract calls this function on the recipient
     * after a `transferAndCall`. This function MAY throw to revert and reject the
     * transfer. Return of other than the magic value MUST result in the
     * transaction being reverted.
     * Warning: this function must call the onlyTokenContract modifier to trust
     * the transfer took place
     * @param _from The address which previously owned the token
     * @param _value Number of tokens that were transfered
     * @param _action Used to define enumeration of possible functions to call
     * @param _data Additional data with no specified format
     * @return `bytes4(0x150b7a03)`
     */
    function onTokenReceived(
        address _from,
        uint256 _value,
        uint256 _action,
        bytes _data
    ) public /* onlyTokenContract */ returns(bytes4);
}

contract BytesDecode {

    function decodeUint(bytes b, uint index) internal pure returns (uint256 result, uint i) {
        uint c = 0;

        require(uint(b[index++]) == 34, "Expected \" for var"); // "

        for (i = index; i < b.length && uint(b[i]) != 34; i++) {
            c = uint(b[i]);
            if (c >= 48 && c <= 57) {
                result = result * 10 + (c - 48);
            }
        }
        i += 2;
    }

    function decodeAddress(bytes b, uint index) internal pure returns (address result, uint i) {
        uint c = 0;
        uint256 r = 0;

        require(b.length - index > 3, "Expected \"0x for var");
        require(uint(b[index++]) == 34, "Expected \" for var");  // "
        require(uint(b[index++]) == 48, "Expected 0 for var");  // 0
        require(uint(b[index++]) == 120, "Expected x for var"); // x

        for (i = index; i < b.length && uint(b[i]) != 34; i++) {
            c = uint(b[i]);

            if (c >= 48 && c <= 57) {
                r = r * 16 + (c - 48);
            } else
                if (c >= 65 && c <= 70) {
                    r = r * 16 + (c - 65 + 10);
                } else
                    if (c >= 97 && c <= 102) {
                        r = r * 16 + (c - 97 + 10);
                    }
        }
        i += 2;

        result = address(r);
    }

    function decodeBytes32(bytes b, uint index) internal pure returns (bytes32 result, uint i) {
        uint r = 0;
        uint c = 0;
        bytes32 b32;

        require(b.length - index > 3, "Expected \"0x for var");
        require(uint(b[index++]) == 34, "Expected \" for var");  // "
        require(uint(b[index++]) == 48, "Expected 0 for var");  // 0
        require(uint(b[index++]) == 120, "Expected x for var"); // x

        for (i = index; i < b.length && uint(b[i]) != 34; i++) {
            c = uint(b[i]);

            if (c >= 48 && c <= 57) {
                c = c - 48;
            } else
                if (c >= 65 && c <= 70) {
                    c = c - 65 + 10;
                } else
                    if (c >= 97 && c <= 102) {
                        c = c - 97 + 10;
                    }

            require (r <= 63, "byte32 can't be longer than 32 bytes");
            b32 |= bytes32(c & 0xF) << ((63-r++) * 4);
        }
        i += 2;

        result = b32;
    }
}

contract MenloForumEvents {
    event Answer(bytes32 _contentHash);
    event Comment(bytes32 _parentHash, bytes32 _contentHash);
    event Payout(address _user, uint256 _tokens);
    event Vote(uint32 _offset, int32 _direction);
}

interface MenloForumCallback {
    function onForumClosed(address _forum, uint256 _tokens, int32 _votes, address _winner) external;
}

contract MenloForum is MenloTokenReceiver, MenloForumEvents, BytesDecode, Ownable, CanReclaimToken {

    uint public constant ACTION_POST     = 1;
    uint public constant ACTION_UPVOTE   = 2;
    uint public constant ACTION_DOWNVOTE = 3;

    MenloForumCallback callback;

    bytes32 public topicHash;
    address public author;
    uint256 public voteCost;
    uint256 public postCost;

    uint256 public endTimestamp;
    uint256 public epochLength;

    mapping(uint32 => int32) public votes;
    mapping(uint32 => mapping(address => int8)) public voters;
    address[] public posters;
    bytes32[] public messages;

    int32   public winningVotes;
    uint32  public winningOffset;
    bool    private closed;
    uint256 public pool;


    constructor(MenloToken _token, MenloForumCallback _callback, address _author, bytes32 _topicHash, uint256 _bounty, uint256 _postCost, uint256 _voteCost, uint256 _epochLength) public MenloTokenReceiver(_token) {

        // Push 0 so empty memory (0) doesn't overlap with a voter
        posters.push(0);
        emit Answer(0);

        // no author for root post 0
        callback = _callback;
        author = _author;
        topicHash = _topicHash;
        voteCost = _voteCost;
        postCost = _postCost;
        epochLength = _epochLength;
        endTimestamp = now + epochLength;
        pool = _bounty;
    }

    function getVoters(uint32 i, address user) public view returns (int8) {
        return voters[i][user];
    }

    function postCount() public view returns (uint256) {
        return posters.length;
    }

    function votesCount() public view returns (uint256) {
        return posters.length;
    }

    function claimed() external view returns (bool) {
        return token.balanceOf(this) == 0 && pool != 0;
    }

    function winner() public view returns (address) {
        if (winningOffset == 0) {
            return author;
        }

        return posters[winningOffset];
    }



    function vote(address _voter, uint32 _offset, int8 _direction) internal {
        int8 priorVote = voters[_offset][_voter];

        require (priorVote != _direction, "Can't vote for same comment more than 1 time");

        votes[_offset] += _direction;
        voters[_offset][_voter] = priorVote + _direction;
        endTimestamp = now + epochLength;

        emit Vote(_offset, _direction);

        if (votes[_offset] > winningVotes) {
            winningVotes = votes[_offset];
            winningOffset = _offset;
            return;
        }

        if (votes[_offset] == winningVotes && _offset < winningOffset) {
            winningVotes = votes[_offset];
            winningOffset = _offset;
            return;
        }
    }

    function pushMessage(bytes32 _message, address _poster) internal {
        messages.push(_message);
        posters.push(_poster);
    }

    function upvoteAndComment(address _voter, uint32 _offset, bytes32 _parentHash, bytes32 _contentHash) internal {
        vote(_voter, _offset, 1);
        if (_contentHash != 0) {
            post(_voter, _parentHash, _contentHash);
        }
    }

    function downvoteAndComment(address _voter, uint32 _offset, bytes32 _parentHash, bytes32 _contentHash) internal {
        vote(_voter, _offset, -1);
        if (_contentHash != 0) {
            post(_voter, _parentHash, _contentHash);
        }
    }

    function post(address _poster, bytes32 _parentHash, bytes32 _contentHash) internal {
        endTimestamp = now + epochLength;

        if (_parentHash != 0) {
            emit Comment(_parentHash, _contentHash);
            return;
        }

        emit Answer(_contentHash);
        voters[uint32(posters.length)][_poster] = 1;
        pushMessage(_contentHash, _poster);
    }

    function closeForum() internal returns (bool) {
        if (closed) {
            return true;
        }

        if (now < endTimestamp) {
            return false;
        }

        if (winner() == author) {
            callback.onForumClosed(this, pool, 0, 0);
        } else {
            callback.onForumClosed(this, pool, winningVotes, winner());
        }

        closed = true;
        return true;
    }

    modifier forumOpen() {
        require(!closeForum(), "Forum is closed");
        _;
    }

    modifier forumClosed() {
        require(closeForum(), "Forum is open");
        _;
    }

    function usesONE(uint256 _value, uint256 _cost) internal pure returns (bool) {
        return (_value >= _cost);
    }

    function claim() forumClosed external {
        require(closeForum(), "Forum not closed");
        require(msg.sender == winner(), "Only winner can claim");
        require(pool > 0, "No tokens left to claim");

        token.transfer(msg.sender, pool);
        emit Payout(msg.sender, pool);
    }

    function onTokenReceived(
        address _from,
        uint256 _value,
        uint256 _action,
        bytes _data
    ) public onlyTokenContract forumOpen returns(bytes4) {

        uint offset;
        uint i;

        pool = token.balanceOf(this);

        if (_action == ACTION_UPVOTE) {
            require(usesONE(_value, voteCost), "Voting tokens sent != cost");

            (offset, i)      = decodeUint(_data, 1);
            (parentHash, i)  = decodeBytes32(_data, i);
            (contentHash, i) = decodeBytes32(_data, i);

            upvoteAndComment(_from, uint32(offset), parentHash, contentHash);
            return ONE_RECEIVED;
        }

        if (_action == ACTION_DOWNVOTE) {
            require(usesONE(_value, voteCost), "Voting tokens sent != cost");

            (offset, i)      = decodeUint(_data, 1);
            (parentHash, i)  = decodeBytes32(_data, i);
            (contentHash, i) = decodeBytes32(_data, i);

            downvoteAndComment(_from, uint32(offset), parentHash, contentHash);
            return ONE_RECEIVED;
        }

        if (_action == ACTION_POST) {
            require(usesONE(_value, postCost), "Posting tokens sent != cost");

            bytes32 parentHash;
            bytes32 contentHash;

            (parentHash, i)  = decodeBytes32(_data, 1);
            (contentHash, i) = decodeBytes32(_data, i);

            post(_from, parentHash, contentHash);
            return ONE_RECEIVED;
        }

        return 0;
    }

    //
    // This exists purely for the case where Menlo ONE tokens need upgrading
    //

    function redeem(Redeemer _redeemer) external onlyOwner returns (MenloToken) {
        require(_redeemer.from() == token);

        token.approve(_redeemer, token.balanceOf(this));
        _redeemer.redeem();
        MenloToken to = _redeemer.to();
        token = to;
        return to;
    }

    function undo(Redeemer _redeemer) external onlyOwner returns (MenloToken) {
        require(_redeemer.to() == token);

        token.approve(_redeemer, token.balanceOf(this));
        _redeemer.undo();
        MenloToken from = _redeemer.from();
        token = from;
        return from;
    }
}

interface Redeemer {
    function redeem() external;
    function undo() external;
    function to() external view returns (MenloToken);
    function from() external view returns (MenloToken);
}

