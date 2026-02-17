import { validateMotorCoverNotePayload } from "../validation/motor.js";
import { buildMotorCoverNoteXml } from "../builders/motor.js";
export class MotorResource {
    client;
    config;
    constructor(client, config) {
        this.client = client;
        this.config = config;
    }
    async submit(payload) {
        validateMotorCoverNotePayload(payload);
        const xml = buildMotorCoverNoteXml(payload, this.config);
        const raw = await this.client.postXml("/covernote/motor", xml);
        const ack = raw?.["TiraMsg"]?.["MotorCoverNoteRefReqAck"];
        return {
            acknowledgement_id: ack?.["AcknowledgementId"] ?? "",
            request_id: ack?.["RequestId"] ?? "",
            tira_status_code: ack?.["AcknowledgementStatusCode"] ?? "",
            tira_status_desc: ack?.["AcknowledgementStatusDesc"] ?? "",
            requires_acknowledgement: true,
            acknowledgement_payload: {
                MotorCoverNoteRefReqAck: ack,
            },
        };
    }
}
//# sourceMappingURL=motor.js.map