import * as https from "node:https";
import * as fs from "node:fs";
import { parseStringPromise } from "xml2js";
import type { TiraConfig } from "./types/config.js";
import { TiraApiError } from "./errors.js";
import { signContent, wrapTiraMsg } from "./signing.js";

export class TiraClient {
  private config: TiraConfig;
  private agent: https.Agent;

  constructor(config: TiraConfig) {
    this.config = config;
    this.agent = new https.Agent({
      key: fs.readFileSync(config.client_key_path),
      cert: fs.readFileSync(config.client_cert_path),
      ca: fs.readFileSync(config.ca_cert_path),
      rejectUnauthorized: false,
    });
  }

  async postXml<T>(endpoint: string, xmlBody: string): Promise<T> {
    const url = new URL(endpoint, this.config.base_url);

    // Sign and wrap the XML
    const signature = signContent(
      xmlBody,
      this.config.pfx_path,
      this.config.pfx_passphrase,
    );
    const wrappedXml = wrapTiraMsg(xmlBody, signature);

    const headers: Record<string, string> = {
      "Content-Type": "application/xml",
      ClientCode: this.config.client_code,
      ClientKey: this.config.client_key,
    };

    const responseText = await new Promise<string>((resolve, reject) => {
      const req = https.request(
        url,
        {
          method: "POST",
          headers,
          agent: this.agent,
        },
        (res) => {
          const chunks: Buffer[] = [];
          res.on("data", (chunk: Buffer) => chunks.push(chunk));
          res.on("end", () => {
            const body = Buffer.concat(chunks).toString("utf-8");
            if (
              res.statusCode &&
              (res.statusCode < 200 || res.statusCode >= 300)
            ) {
              console.error(
                `TIRA API responded with ${res.statusCode} with body ${JSON.stringify(body, null, 2)}`,
              );

              reject(
                new TiraApiError(
                  res.statusCode,
                  res.statusMessage ?? "Unknown error",
                ),
              );
              return;
            }
            resolve(body);
          });
          res.on("error", reject);
        },
      );

      req.on("error", reject);
      req.write(wrappedXml);
      req.end();
    });

    const parsed = await parseStringPromise(responseText, {
      explicitArray: false,
    });
    return parsed as T;
  }
}
