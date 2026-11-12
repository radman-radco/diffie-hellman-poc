const crypto = require('crypto');

console.log("** Diffie-Hellman key exchange proof of concept **")
const prime_bit_length = 15

// Generate a n-bit prime and return it as a BigInt
class Device{
  constructor(name, base, p){ 
    this.name = name
    this.base = base
    this.p = p
    this.secret = BigInt(crypto.randomInt(4, 2**(prime_bit_length-1)))
    console.log(`# ${name} => Generated secret key = ${this.secret}`)
  }
 get_public_key(){
   const pk =  (this.base ** this.secret) % this.p
   console.log(`# ${this.name} => Generated public key = ${pk}`)
   return pk
 }
 generate_enc_k(pk){
   const sk = (pk ** this.secret) % this.p
   console.log(`# ${this.name} => Generated encryption key = ${sk}`)
   return sk
 }
}


const prime = crypto.generatePrimeSync(prime_bit_length, { bigint: true });
const base = BigInt(crypto.randomInt(1, Number(prime) - 1))
console.log(`==============================================\n  Both devices agreed on these public values:\n          prime:${prime} ,  base:${base}\n==============================================\n`)

console.log("========================= STAGE 1 ==========================")
const client = new Device("client", base, prime)
const server = new Device("server", base, prime)

console.log("\n========================= STAGE 2 ==========================")
const client_public_key = client.get_public_key()
const server_public_key = server.get_public_key()

console.log("\n========================= STAGE 3 ==========================")
console.log(`# client's public key ==> server
# client <== server's public key`)
console.log("\n========================= STAGE 4 ==========================")
const client_enc_key = client.generate_enc_k(server_public_key)
const server_enc_key = server.generate_enc_k(client_public_key)








