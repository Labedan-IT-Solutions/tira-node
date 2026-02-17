"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signContent = signContent;
exports.wrapTiraMsg = wrapTiraMsg;
const fs = require("node:fs");
const crypto = require("node:crypto");
const node_forge_1 = require("node-forge");
function privateKeyPemFromPfx(pfxPath, passphrase) {
    const pfxBuf = fs.readFileSync(pfxPath);
    const forgeBuf = node_forge_1.default.util.createBuffer(pfxBuf.toString('binary'));
    const asn1 = node_forge_1.default.asn1.fromDer(forgeBuf);
    const p12 = node_forge_1.default.pkcs12.pkcs12FromAsn1(asn1, passphrase);
    const oids = node_forge_1.default.pki.oids;
    const shroudedBagType = oids['pkcs8ShroudedKeyBag'];
    const keyBagType = oids['keyBag'];
    const bags1 = p12.getBags({ bagType: shroudedBagType })[shroudedBagType] ?? [];
    const bags2 = p12.getBags({ bagType: keyBagType })[keyBagType] ?? [];
    const keyBag = [...bags1, ...bags2][0];
    if (!keyBag?.key) {
        throw new Error('Private key not found in PFX file');
    }
    return node_forge_1.default.pki.privateKeyToPem(keyBag.key);
}
function signContent(contentXml, pfxPath, pfxPassphrase = '') {
    const privateKeyPem = privateKeyPemFromPfx(pfxPath, pfxPassphrase);
    const signer = crypto.createSign('RSA-SHA1');
    signer.update(contentXml, 'utf8');
    signer.end();
    return signer.sign({ key: privateKeyPem }).toString('base64');
}
function wrapTiraMsg(contentXml, base64Signature) {
    return `<TiraMsg>\n${contentXml}\n<MsgSignature>${base64Signature}</MsgSignature>\n</TiraMsg>`;
}
//# sourceMappingURL=signing.js.map