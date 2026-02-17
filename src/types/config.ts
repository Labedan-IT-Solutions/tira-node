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
  /** Path to the client PFX file (tiramisclientprivate.pfx). Used for signing requests and mutual TLS authentication. */
  pfx_path: string;
  /** Passphrase for the client PFX file */
  pfx_passphrase: string;
  /** Path to TIRA's public PFX file (tiramispublic.pfx). Used for verifying callback signatures and TLS CA certificate. */
  tira_public_pfx_path: string;
  /** Passphrase for TIRA's public PFX file */
  tira_public_pfx_passphrase: string;
  /** Whether to verify callback signatures using TIRA's public certificate. Defaults to true. */
  verify_signatures?: boolean | undefined;
  /** Enable specific callback handlers for the universal handleCallback method */
  enabled_callbacks?: EnabledCallbacks | undefined;
}
