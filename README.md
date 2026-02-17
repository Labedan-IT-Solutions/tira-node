<div align="center">

# tira-node

**The unofficial Node.js SDK for TIRA's TIRAMIS**\
Tanzania Insurance Management Information System

[![npm version](https://img.shields.io/npm/v/tira-node?color=cb3837&label=npm&logo=npm&logoColor=white)](https://www.npmjs.com/package/tira-node)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-first-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

---

**Just Setup the package and go live, no stressing**\
`tira-node` handles it all so you can focus on building your insurance integration in minutes.

[Documentation](https://tira-node.labedan.solutions) · [GitHub](https://github.com/Labedan-IT-Solutions/tira-node) · [npm](https://www.npmjs.com/package/tira-node)

</div>

---

## What is tira-node?

`tira-node` is a TypeScript-first Node.js SDK that makes integrating with Tanzania's TIRA TIRAMIS API straightforward. It takes care of the hard parts such as the XML document construction, RSA-SHA1 digital signing with PFX certificates, mutual TLS authentication, callback XML parsing, signature verification, and payload validation so you don't have to.

Works with both **ESM** and **CommonJS** out of the box. Every single method is fully typed.

---

## Features

### Supported TIRA Operations

| Category                    | Operations                                                        |
| :-------------------------- | :---------------------------------------------------------------- |
| **Motor Insurance**         | Submit covernotes, verify motor registration, handle callbacks    |
| **Motor Fleet**             | Submit fleet covernotes (multiple vehicles), handle callbacks     |
| **Non-Life / Other**        | Submit non-motor covernotes (bonds, fire, etc.), handle callbacks |
| **Reinsurance**             | Submit reinsurance details, handle callbacks                      |
| **Policy**                  | Register policies against covernotes, handle callbacks            |
| **Cover Note Verification** | Verify existing cover notes                                       |
| **Claim Notification**      | Submit initial loss notifications                                 |
| **Claim Intimation**        | Submit formal claim intimations with claimant details             |
| **Claim Assessment**        | Submit assessment reports                                         |
| **Discharge Voucher**       | Process discharge vouchers                                        |
| **Claim Payment**           | Record claim payments                                             |
| **Claim Rejection**         | Record claim rejections                                           |

### Under the Hood

- **XML Digital Signatures** — RSA-SHA1 signing with PFX certificates, handled automatically
- **Callback Verification** — Verify TIRA callback signatures are legitimate using their public certificate
- **Built-in Validation** — Every payload is validated before submission, with clear error messages
- **Reference Data** — Country codes, currency codes, and all Tanzania region/district codes included
- **Acknowledgement Builder** — Generate properly signed XML acknowledgements for callbacks
- **Full TypeScript Types** — Every payload, response, and config option is typed

---

## Quick Start

### Install

```bash
npm install tira-node
```

### Initialize

Just provide the PFX certificate files that TIRA gave you and the SDK handles everything else automatically:

```js
const { Tira } = require("tira-node");
// or: import { Tira } from "tira-node";

const tira = new Tira({
  base_url: "https://your-tira-endpoint", // You can just change this according to your environment
  client_code: "YOUR_CLIENT_CODE", // Provided by TIRA
  client_key: "YOUR_CLIENT_KEY", // Provided by TIRA
  system_code: "YOUR_SYSTEM_CODE", // Provided by TIRA
  transacting_company_code: "YOUR_COMPANY_CODE", // Provided by TIRA
  pfx_path: "./path_to_certs/tiramisclientprivate.pfx", // Provided by TIRA
  pfx_passphrase: "your-passphrase", // Provided by TIRA
  tira_public_pfx_path: "./path_to_certs/tiramispublic.pfx", // Provided by TIRA
  tira_public_pfx_passphrase: "your-passphrase", // Provided by TIRA
});
```

### Submit a Motor Covernote

```js
const result = await tira.motor.submit({
  request_id: "UNIQUE-REQUEST-ID",
  callback_url: "https://your-server.com/callbacks/motor",
  insurer_company_code: "ICC103",
  covernote_number: "SPCPLBA1013070418136",
  covernote_type: "1",
  sales_point_code: "SP719",
  covernote_start_date: new Date().toISOString(),
  covernote_end_date: new Date("2027-01-01").toISOString(),
  covernote_desc: "Private Vehicles",
  operative_clause: "Comprehensive",
  payment_mode: "3",
  // ... see full documentation for all fields
});
```

### Handle a Callback

```js
// Express example — receive TIRA's XML callback
app.post(
  "/callbacks/motor",
  express.text({ type: "application/xml" }),
  async (req, res) => {
    const result = await tira.motor.handleCallback(req.body);

    // result.extracted contains the parsed callback data
    // result.signature_verified tells you if the signature is valid

    // Send back a signed acknowledgement
    const ackXml = tira.acknowledge(result.body, "YOUR-ACK-ID");
    res.status(200).set("Content-Type", "application/xml").send(ackXml);
  },
);
```

---

## Documentation

Full documentation is available at **[tira-node.labedan.solutions](https://tira-node.labedan.solutions)** in both **English** and **Kiswahili**.

---

## Disclaimer

> **This project is NOT affiliated with, endorsed by, or officially connected to TIRA (Tanzania Insurance Regulatory Authority) in any way.**
>
> `tira-node` is an independent, community-driven open-source project created and maintained by [Labedan IT Solutions](https://github.com/Labedan-IT-Solutions). We built this because we saw how cumbersome TIRA integration can be and wanted to make it easier for the Tanzanian developer community.
>
> For official TIRA documentation, guidelines, and compliance requirements, always refer to TIRA directly.

---

## License

MIT License. See [LICENSE](./LICENSE) for details.

You are free to use, modify, and distribute this package in both personal and commercial projects.

---

<div align="center">

Powered by **[Labedan IT Solutions](https://labedan.solutions)**

</div>
