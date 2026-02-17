import * as fs from 'node:fs';
import * as crypto from 'node:crypto';
import * as forge from 'node-forge';

function privateKeyPemFromPfx(pfxPath: string, passphrase: string): string {
  const pfxBuf = fs.readFileSync(pfxPath);
  const forgeBuf = forge.util.createBuffer(pfxBuf.toString('binary'));
  const asn1 = forge.asn1.fromDer(forgeBuf);
  const p12 = forge.pkcs12.pkcs12FromAsn1(asn1, passphrase);

  const oids = forge.pki.oids as Record<string, string>;
  const shroudedBagType = oids['pkcs8ShroudedKeyBag'] as string;
  const keyBagType = oids['keyBag'] as string;

  const bags1 = p12.getBags({ bagType: shroudedBagType })[shroudedBagType] ?? [];
  const bags2 = p12.getBags({ bagType: keyBagType })[keyBagType] ?? [];
  const keyBag = [...bags1, ...bags2][0];

  if (!keyBag?.key) {
    throw new Error('Private key not found in PFX file');
  }

  return forge.pki.privateKeyToPem(keyBag.key);
}

export function signContent(contentXml: string, pfxPath: string, pfxPassphrase: string = ''): string {
  const privateKeyPem = privateKeyPemFromPfx(pfxPath, pfxPassphrase);
  const signer = crypto.createSign('RSA-SHA1');
  signer.update(contentXml, 'utf8');
  signer.end();
  return signer.sign({ key: privateKeyPem }).toString('base64');
}

export function wrapTiraMsg(contentXml: string, base64Signature: string): string {
  return `<TiraMsg>\n${contentXml}\n<MsgSignature>${base64Signature}</MsgSignature>\n</TiraMsg>`;
}
