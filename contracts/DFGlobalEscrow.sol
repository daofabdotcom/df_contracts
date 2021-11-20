pragma solidity 0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DFGlobalEscrow is Ownable {
    
    enum Sign {
        NULL,
        REVERT,
        RELEASE
    }

    enum TokenType {
        ETH,
        ERC20
    }
    
    struct EscrowRecord {
        string referenceId;
        address payable txnInitiator;
        address payable sender;
        address payable owner;
        address payable receiver;
        address payable agent;
        TokenType tokenType;
        bool shouldInvest;
        address tokenAddress;
        uint precision;
        uint256 fund;
        bool funded;
        bool disputed;
        bool finalized;
        mapping(address => bool) signer;
        mapping(address => Sign) signed;
        uint256 releaseCount;
        uint256 revertCount;
        uint256 lastTxBlock;
    }
    
    mapping(string => EscrowRecord) _escrow;
    
    function isSigner(string memory _referenceId, address _signer) public view returns (bool) {
        return _escrow[_referenceId].signer[_signer];
    }
    
    function getSignedAction(string memory _referenceId, address _signer) public view returns (Sign) {
        return _escrow[_referenceId].signed[_signer];
    }
    
    event EscrowInitiated(string referenceId, address payer, uint256 amount, address payee, address trustedParty, uint256 lastBlock);
    event OwnershipTransferred(string referenceIdHash, address oldOwner, address newOwner, uint256 lastBlock);
    event Signature(string referenceId, address signer, Sign action, uint256 lastBlock);
    event Finalized(string referenceId, address winner, uint256 lastBlock);
    event Disputed(string referenceId, address disputer, uint256 lastBlock);
    event Withdrawn(string referenceId, address payee, uint256 amount, uint256 lastBlock);
    event Funded(string indexed referenceId, address indexed owner, uint256 amount, uint256 lastBlock);
    
    modifier multisigcheck(string memory _referenceId, address _party) {
        EscrowRecord storage e = _escrow[_referenceId];
        require(!e.finalized, "Escrow should not be finalized");
        require(e.signer[_party], "party should be eligible to sign");
        require(e.signed[_party] == Sign.NULL, "party should not have signed already");
        
        _;
        
        if(e.releaseCount == 2) {
            transferOwnership(e);
        }else if(e.revertCount == 2) {
            finalize(e);
        }else if(e.releaseCount == 1 && e.revertCount == 1) {
            dispute(e, _party);
        }
    }
    function init(string memory _referenceId,
                  address payable _owner,
                  address payable _receiver, 
                  address payable _agent,
                  TokenType tokenType,
                  address erc20TokenAddress,
                  uint256 tokenAmount) public onlyOwner payable {
        require(msg.sender != address(0), "Sender should not be null");
        require(_owner != address(0), "Receiver should not be null");
        require(_receiver != address(0), "Receiver should not be null");
        require(_agent != address(0), "Trusted Agent should not be null");
        require(_escrow[_referenceId].lastTxBlock == 0, "Duplicate Escrow");

        EscrowRecord storage e = _escrow[_referenceId];
        e.referenceId = _referenceId;
        e.txnInitiator = payable(msg.sender);
        e.sender = _owner;
        e.owner = _owner;
        e.receiver = _receiver;
        e.agent = _agent;
        e.tokenType = tokenType;
        e.funded = false;

        if(e.tokenType == TokenType.ETH){
            e.fund = tokenAmount;
        }else{
            e.tokenAddress = erc20TokenAddress;
            e.fund = tokenAmount;
        }

        e.disputed = false;
        e.finalized = false;
        e.lastTxBlock = block.number;
        
        e.releaseCount = 0;
        e.revertCount = 0;
                
        _escrow[_referenceId].signer[_owner] = true;
        _escrow[_referenceId].signer[_receiver] = true;
        _escrow[_referenceId].signer[_agent] = true;

        emit EscrowInitiated(_referenceId, _owner, e.fund, _receiver, _agent, block.number);
    }

    function fund(string memory _referenceId, uint256 fundAmount) public payable onlyOwner {
        require(_escrow[_referenceId].lastTxBlock > 0, "Sender should not be null");
        uint256 escrowFund = _escrow[_referenceId].fund;
        EscrowRecord storage e = _escrow[_referenceId];
        if(e.tokenType == TokenType.ETH){
            require(msg.value == escrowFund, "Must fund for exact ETH-amount in Escrow");
        }else{
            require(fundAmount == escrowFund, "Must fund for exact ERC20-amount in Escrow");
            IERC20 erc20Instance = IERC20(e.tokenAddress);
            erc20Instance.transferFrom(msg.sender, address(this), fundAmount);
        }

        e.funded = true;
        emit Funded(_referenceId, e.owner, e.fund, block.number);
    }
    
    function release(string memory _referenceId, address _party) public multisigcheck(_referenceId, _party) {
        EscrowRecord storage e = _escrow[_referenceId];
        
        emit Signature(_referenceId, e.owner, Sign.RELEASE, e.lastTxBlock);
        
        e.signed[e.owner] = Sign.RELEASE;
        e.releaseCount++;
    }
    
    function reverse(string memory _referenceId, address _party) public onlyOwner multisigcheck(_referenceId, _party) {
        EscrowRecord storage e = _escrow[_referenceId];
        
        emit Signature(_referenceId,  e.owner, Sign.REVERT, e.lastTxBlock);
        
        e.signed[e.owner] = Sign.REVERT;
        e.revertCount++;
    }
    
    function dispute(string memory _referenceId, address _party) public onlyOwner {
        EscrowRecord storage e = _escrow[_referenceId];
        require(!e.finalized, "Escrow should not be finalized");
        require(_party == e.owner || _party == e.receiver, "Only owner or receiver can call dispute");
        
        dispute(e, _party);
    }
    
    function transferOwnership(EscrowRecord storage e) onlyOwner internal {
        e.owner = e.receiver;
        finalize(e);
        e.lastTxBlock = block.number;
    }
    
    function dispute(EscrowRecord storage e, address _party) onlyOwner internal {
        emit Disputed(e.referenceId, _party, e.lastTxBlock);
        e.disputed = true;
        e.lastTxBlock = block.number;
    }
    
    function finalize(EscrowRecord storage e) onlyOwner internal {
        require(!e.finalized, "Escrow should not be finalized");
        
        emit Finalized(e.referenceId, e.owner, e.lastTxBlock);
        
        e.finalized = true;
    }
    
    function withdraw(string memory _referenceId, uint256 _amount) onlyOwner public {
        EscrowRecord storage e = _escrow[_referenceId];
        address escrowOwner = e.owner;
        require(e.finalized, "Escrow should be finalized before withdrawal");
        require(_amount <= e.fund, "cannot withdraw more than the deposit");
        
        emit Withdrawn(_referenceId, escrowOwner, _amount, e.lastTxBlock);
        
        e.fund = e.fund - _amount;
        e.lastTxBlock = block.number;

        if(e.tokenType == TokenType.ETH){
            require((e.owner).send(_amount));
        }else{
            IERC20 erc20Instance = IERC20(e.tokenAddress);
            require(erc20Instance.transfer(escrowOwner, _amount));
        }  
    }    
}