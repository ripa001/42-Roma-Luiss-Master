// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SimpleMultiSigWallet
 * @dev Basic multisig wallet: owners can submit, confirm, and execute transactions after enough confirmations.
 */
contract SimpleMultiSigWallet {
    address[] public owners;
    mapping(address => bool) public isOwner;
    uint public required;

    struct Transaction {
        address destination;
        uint value;
        bytes data;
        bool executed;
        uint confirmations;
    }

    Transaction[] public transactions;
    mapping(uint => mapping(address => bool)) public confirmations;

    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not owner");
        _;
    }

    modifier txExists(uint txIndex) {
        require(txIndex < transactions.length, "Tx does not exist");
        _;
    }

    modifier notExecuted(uint txIndex) {
        require(!transactions[txIndex].executed, "Tx already executed");
        _;
    }

    modifier notConfirmed(uint txIndex) {
        require(!confirmations[txIndex][msg.sender], "Tx already confirmed");
        _;
    }

    event Deposit(address indexed sender, uint value);
    event SubmitTransaction(address indexed owner, uint indexed txIndex, address indexed destination, uint value, bytes data);
    event ConfirmTransaction(address indexed owner, uint indexed txIndex);
    event ExecuteTransaction(address indexed owner, uint indexed txIndex);

    constructor(address[] memory _owners, uint _required) {
        require(_owners.length > 0, "Owners required");
        require(_required > 0 && _required <= _owners.length, "Invalid required number of owners");
        for (uint i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "Invalid owner");
            require(!isOwner[owner], "Owner not unique");
            isOwner[owner] = true;
            owners.push(owner);
        }
        required = _required;
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    function submitTransaction(address destination, uint value, bytes memory data) public onlyOwner {
        uint txIndex = transactions.length;
        transactions.push(Transaction({
            destination: destination,
            value: value,
            data: data,
            executed: false,
            confirmations: 0
        }));
        emit SubmitTransaction(msg.sender, txIndex, destination, value, data);
        confirmTransaction(txIndex);
    }

    function confirmTransaction(uint txIndex) public onlyOwner txExists(txIndex) notExecuted(txIndex) notConfirmed(txIndex) {
        confirmations[txIndex][msg.sender] = true;
        transactions[txIndex].confirmations += 1;
        emit ConfirmTransaction(msg.sender, txIndex);
        if (transactions[txIndex].confirmations >= required) {
            executeTransaction(txIndex);
        }
    }

    function executeTransaction(uint txIndex) public onlyOwner txExists(txIndex) notExecuted(txIndex) {
        Transaction storage txn = transactions[txIndex];
        require(txn.confirmations >= required, "Not enough confirmations");
        txn.executed = true;
        (bool success, ) = txn.destination.call{value: txn.value}(txn.data);
        require(success, "Tx failed");
        emit ExecuteTransaction(msg.sender, txIndex);
    }

    function getOwners() public view returns (address[] memory) {
        return owners;
    }

    function getTransactionCount() public view returns (uint) {
        return transactions.length;
    }

    function getTransaction(uint txIndex) public view returns (
    address destination,
    uint value,
    bytes memory data,
    bool executed,
    uint confirmationsCount
    ) {
    Transaction storage txn = transactions[txIndex];
    return (txn.destination, txn.value, txn.data, txn.executed, txn.confirmations);
    }
}
