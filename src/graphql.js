import fetch from "node-fetch";

const fetchGraphQL = async (query, variables = {}) => {
    try {
        const result = await fetch(
            `http://localhost:3085/graphql`,
            {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query,
                    variables,
                })
            }
        )

        return result.ok ? await result.json() : null
    } catch (e) {
        console.log(`The Request to GraphQL war aborted! ${e.message}`, 'error', e.stack)
        return null
    }
}

const qBalance = `
query ($publicKey: String!) {
  account(publicKey: $publicKey) {
    balance {
      total
      blockHeight
      liquid
      locked
      stateHash
      unknown
    }
  }
}
`;

const qTransactionInPoolForAddress = `
query ($publicKey: String!) {
  version
  pooledUserCommands(publicKey: $publicKey) {
    id
    amount
    failureReason
    fee
    from
    hash
    isDelegation
    kind
    memo
    nonce
    to
  }
}
`;

export const getAddressBalance = async (address) => {
    try {
        let result = await fetchGraphQL(qBalance, {publicKey: address})
        return result.data.account.balance
    } catch (e) {
        return {
            total: 0,
            blockHeight: 0,
            liquid: 0,
            locked: 0,
            stateHash: "",
            unknown: 0,
            error: e.message
        }
    }
}

export const getTransactionInPool = async (address) => {
    try {
        let result = await fetchGraphQL(qTransactionInPoolForAddress, {publicKey: address})
        return result.data.pooledUserCommands
    } catch (e) {
        return []
    }
}