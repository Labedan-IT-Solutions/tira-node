import * as fs from 'node:fs';
import * as crypto from 'node:crypto';
import forge from 'node-forge';

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

function publicKeyPemFromPfx(pfxPath: string, passphrase: string): string {
  const pfxBuf = fs.readFileSync(pfxPath);
  const forgeBuf = forge.util.createBuffer(pfxBuf.toString('binary'));
  const asn1 = forge.asn1.fromDer(forgeBuf);
  const p12 = forge.pkcs12.pkcs12FromAsn1(asn1, passphrase);

  const oids = forge.pki.oids as Record<string, string>;
  const certBagType = oids['certBag'] as string;
  const bags = p12.getBags({ bagType: certBagType })[certBagType] ?? [];
  const certBag = bags[0];

  if (!certBag?.cert) {
    throw new Error('Certificate not found in PFX file');
  }

  return forge.pki.certificateToPem(certBag.cert);
}

export function extractSignedContentAndSignature(
  rawXml: string,
): { contentXml: string; base64Signature: string } | null {
  const sigMatch = rawXml.match(/<MsgSignature>([\s\S]*?)<\/MsgSignature>/);
  if (!sigMatch?.[1]) return null;

  const tiraMsgStart = rawXml.indexOf('<TiraMsg>');
  const msgSigStart = rawXml.indexOf('<MsgSignature>');

  if (tiraMsgStart === -1 || msgSigStart === -1) return null;

  const contentStart = tiraMsgStart + '<TiraMsg>'.length;
  const contentXml = rawXml.substring(contentStart, msgSigStart).trim();

  return { contentXml, base64Signature: sigMatch[1].trim() };
}

export function verifySignature(
  contentXml: string,
  base64Signature: string,
  publicPfxPath: string,
  publicPfxPassphrase: string = '',
): boolean {
  const publicKeyPem = publicKeyPemFromPfx(publicPfxPath, publicPfxPassphrase);
  const verifier = crypto.createVerify('RSA-SHA1');
  verifier.update(contentXml, 'utf8');
  verifier.end();
  return verifier.verify(publicKeyPem, base64Signature, 'base64');
}
