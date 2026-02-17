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
        console.log(`Sending XML`, JSON.stringify(xml, null, 2));
        const raw = await this.client.postXml("/ecovernote/api/covernote/non-life/motor/v2/request", xml);
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