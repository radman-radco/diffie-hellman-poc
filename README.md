Here's a rewritten README in a more personal, first-person voice — less "generated docs," more "I built this and here's what happened."

```markdown
# Diffie–Hellman Key Exchange — Proof of Concept

A proof of concept I made of how the Diffie–Hellman key exchange works under the hood.

⚠️ Educational only. Not for production use. I used tiny 3-bit primes so I could
actually see the math happen. Real TLS uses 2048+ bit primes.

---

## Why I made this

I wanted to understand how two devices can agree on a secret key over a public
channel without ever sending the key itself. Reading about it wasn't enough —
I had to build it and watch the numbers.

So I made two `Device` objects, gave them a shared prime and base, and let them
do the exchange step by step.

---

## The math (the short version)

Both sides agree on two public numbers:

- `p` — a prime
- `g` — a base

Each side picks a secret (`a` and `b`), computes a public value:

```
A = g^a mod p
B = g^b mod p
```

They swap `A` and `B`, then each computes:

```
S = B^a mod p   (Alice)
S = A^b mod p   (Bob)
```

Both get the same `S`. That's the shared secret.

---

## How it runs

Three stages:

1. **Agree on public values** — a 3-bit prime and a random base.
2. **Generate public keys** — each device picks a secret and computes its public key.
3. **Derive the shared secret** — each device combines its own secret with the
   other's public key.

```bash
node index.js
```

Example output:

```
==============================================
  Both devices agreed on these public values:
          prime:7 ,  base:3
==============================================

========================= STAGE 1 ==========================
# client => Generated secret key = 2
# server => Generated secret key = 3

========================= STAGE 2 ==========================
# client => Generated public key = 2
# server => Generated public key = 6

========================= STAGE 3 ==========================
# client => Generated encryption key = 1
# server => Generated encryption key = 1

Match: true
```

---

## Issues I hit and how I fixed them

These are the things that actually tripped me up while building this.

### 1. `**` doesn't work for real key sizes

At first I wrote:

```js
const pk = (this.base ** this.secret) % this.p;
```

It worked for 3-bit numbers. Then I tried a bigger prime and got:

```
RangeError: Maximum BigInt size exceeded
```

Because `**` computes the whole `base^secret` *before* the modulo, and that
number gets astronomically huge. The fix was writing `modPow` by hand, which
reduces modulo `p` at every step:

```js
function modPow(base, exp, mod) {
  let result = 1n;
  base = base % mod;
  while (exp > 0n) {
    if (exp & 1n) result = (result * base) % mod;
    base = (base * base) % mod;
    exp >>= 1n;
  }
  return result;
}
```

### 2. Secrets and bases of `1` broke everything

I originally used `crypto.randomInt(1, ...)`, which let a secret or base be `1`.
A secret of `1` makes the public key `g^1 = g` — it leaks the base. A base of `1`
makes every public key `1`. Both silently produce a "working" but useless key.

Fix: start the range at `2`.

```js
this.secret = BigInt(crypto.randomInt(2, 2 ** (prime_bit_length - 1)));
const base  = BigInt(crypto.randomInt(2, Number(prime) - 1));
```

### 3. `Math.random()` is not safe for this

I reached for `Math.random()` first because it was familiar. But it's
predictable — fine for animations, not for anything security-related.

Fix: use `crypto.randomInt()`, which is cryptographically secure.

### 4. `Number(prime)` breaks for big primes

`Number(prime)` is fine for a 3-bit prime, but for a 2048-bit prime it becomes
`Infinity` and `crypto.randomInt` throws. I kept it for the demo (since the
prime is tiny), but for real key sizes you'd need a BigInt-aware random
generator.

### 5. 3-bit primes are always `7`

I expected `crypto.generatePrimeSync(3, ...)` to return `3`, `5`, or `7`. It
only ever returns `7`. Turns out OpenSSL forces the top two bits of the prime
to `1` to guarantee the bit length — so for 3 bits, the only candidate is
`111` = `7`.

---

## What I'd change for real use

- Use **2048+ bit primes** (or a named group like `ffdhe2048`).
- Use **ephemeral keys** per session for forward secrecy.
- Prefer **ECDH** for smaller, faster keys.
- Never hand-roll crypto in production — use vetted libraries.

---

## What this is not

- Not a TLS implementation
- Not production-ready
- Not secure with 3-bit primes (the key space is tiny)

It's a learning tool. I built it so I could see the algorithm working with
numbers small enough to trace by hand.

---

## License

MIT
```

### What makes this feel less robotic

- **First person throughout** — "I wanted to understand," "I reached for," "I expected."
- **"Issues I hit and how I fixed them"** section — this is the part that sounds like *you*. It shows your debugging process, which is exactly what you said: *"I hit this issue, so I did this."*
- **Casual phrasing** — "tripped me up," "gets astronomically huge," "silently produce a 'working' but useless key."
- **No corporate voice** — no "This document describes," no "The implementation leverages."
- **The 3-bit prime surprise** — that's a genuinely personal "wait, why only 7?" moment, and it's the kind of detail that makes a README feel real.

If you want it even more casual, I can strip out more of the structure (fewer headings, more paragraph flow). If you want it slightly more polished but still personal, I can tighten the "Issues" section.
