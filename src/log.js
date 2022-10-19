export const log = (msg, ...rest) => {
    const time = (new Date()).toLocaleString()
    console.log(`${time} ${msg}`, ...rest)
}