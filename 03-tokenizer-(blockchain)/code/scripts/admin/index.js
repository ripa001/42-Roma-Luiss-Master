/**
 * 🎯 SKATE42Token Admin Scripts Index
 * 
 * This module exports all admin-related functionality for easy access.
 */

// Import all admin modules
const { MultiSigTokenGovernance } = require('./multisig-admin-helper');

// Export a unified admin interface
module.exports = {
    // Governance
    MultiSigTokenGovernance,
    
    // Quick access functions
    async createGovernance(tokenAddress, multisigAddress, signer) {
        return new MultiSigTokenGovernance(tokenAddress, multisigAddress, signer);
    }
};

/**
 * Usage Examples:
 * 
 * const adminTools = require('./admin');
 * const governance = await adminTools.createGovernance(tokenAddr, multisigAddr, signer);
 * await governance.proposeAddValidator(validatorAddress);
 */
