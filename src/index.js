/*
* Run every 3 minutes
* 1. Check current transactions
* 2. Get balance
* 3. Withdraw balance if one great than Val
* */

import {getTransactionInPool, getAddressBalance} from "./graphql.js";
import {exec} from "child_process";
import {log} from "./log.js";

const address = `B62qrAWZFqvgJbfU95t1owLAMKtsDTAGgSZzsBJYUzeQZ7dQNMmG5vw`
const receiver = `B62qjdk4R6rjtrJpWypvMcpNMdfyqgxHEAz88UnzbMK4TzELiGbhQ97`
const liquidToSave = 1, fee = 0.001
const command = `mina client send-payment -amount %AMOUNT%  -receiver ${receiver} -fee ${fee} -memo save_from_genesis -sender ${address}`
const interval = 1000 * 60 * 1

async function processSave () {
    let amount, cmd, total, liquid, balance

    const transInPool = await getTransactionInPool(address)
    log(`Trans in pool ${transInPool.length}`)

    if (transInPool.length === 0) {
        balance = await getAddressBalance(address)

        total = +balance.total / 10**9
        liquid = +balance.liquid / 10**9

        log("Total: " + (total) + " mina, " + "Liquid: " + (liquid) + " mina, " + "Ready to save: " + (liquid >= liquidToSave))
        // console.log("Amount: ", (liquid - fee))

        if (liquid >= liquidToSave) {
            amount = liquid - fee
            cmd = command.replace("%AMOUNT%", amount)
            log("Run: " + cmd)
            exec(cmd, async (error, stdout, stderr) => {
                let result

                if (error) {
                    result = error.message
                } else
                if (stderr) {
                    result = stderr
                } else {
                    result = 'OK'
                }

                log(result === 'OK' ? `Saved ${amount} mina` : result)
            })
        }
    }

    setTimeout(processSave, interval)
}

await processSave()