import type { EnabledCallbacks } from "./callback.js";

export interface TiraConfig {
  /** Client code provided by TIRA */
  client_code: string;
  /** Client key provided by TIRA */
  client_key: string;
  /** System code provided by TIRA */
  system_code: string;
  /** Transacting company code */
  transacting_company_code: string;
  /** Base URL for the TIRA API */
  base_url: string;
  /** Path to the client certificate file (client.crt) */
  client_cert_path: string;
  /** Path to the client key file (client.key) */
  client_key_path: string;
  /** Path to the CA certificate file (tira_server_ca.pem) */
  ca_cert_path: string;
  /** Path to the PFX file for signing requests (tiramisclientprivate.pfx) */
  pfx_path: string;
  /** Passphrase for the PFX file. Defaults to empty string. */
  pfx_passphrase: string;
  /** Enable specific callback handlers for the universal handleCallback method */
  enabled_callbacks?: EnabledCallbacks | undefined;
}
