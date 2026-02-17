import * as fs from 'node:fs';
import * as crypto from 'node:crypto';
import forge from 'node-forge';
function privateKeyPemFromPfx(pfxPath, passphrase) {
    const pfxBuf = fs.readFileSync(pfxPath);
    const forgeBuf = forge.util.createBuffer(pfxBuf.toString('binary'));
    const asn1 = forge.asn1.fromDer(forgeBuf);
    const p12 = forge.pkcs12.pkcs12FromAsn1(asn1, passphrase);
    const oids = forge.pki.oids;
    const shroudedBagType = oids['pkcs8ShroudedKeyBag'];
    const keyBagType = oids['keyBag'];
    const bags1 = p12.getBags({ bagType: shroudedBagType })[shroudedBagType] ?? [];
    const bags2 = p12.getBags({ bagType: keyBagType })[keyBagType] ?? [];
    const keyBag = [...bags1, ...bags2][0];
    if (!keyBag?.key) {
        throw new Error('Private key not found in PFX file');
    }
    return forge.pki.privateKeyToPem(keyBag.key);
}
export function signContent(contentXml, pfxPath, pfxPassphrase = '') {
    const privateKeyPem = privateKeyPemFromPfx(pfxPath, pfxPassphrase);
    const signer = crypto.createSign('RSA-SHA1');
    signer.update(contentXml, 'utf8');
    signer.end();
    return signer.sign({ key: privateKeyPem }).toString('base64');
}
export function wrapTiraMsg(contentXml, base64Signature) {
    return `<TiraMsg>\n${contentXml}\n<MsgSignature>${base64Signature}</MsgSignature>\n</TiraMsg>`;
}
//# sourceMappingURL=signing.js.map