export const PIXEL_ID = "1117060627478676";
export const CONSENT_KEY = "subway-advertising-consent-v1";
export const NOTICE_VERSION = "2026-10-19";
export const NOTICE = "O Meta Pixel partilha com a Meta a página visitada, endereço IP, dados do navegador e identificadores de cookies para medir visitas de anúncios. Não partilhamos os dados do formulário. Pode aceitar, recusar ou retirar a autorização em Definições de cookies.";
const consentCountries = new Set("AT BE BG HR CY CZ DK EE FI FR DE GR HU IS IE IT LV LI LT LU MT NL NO PL PT RO SK SI ES SE GB CH BR CA ZA KR TR".split(" "));
const countries = new Set("AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW".split(" "));
export function needsConsent(region: string) {
  return !countries.has(region) || consentCountries.has(region);
}
export type ConsentRecord = {
  visitorId: string;
  advertising: boolean;
  region: string;
  version: string;
  notice: string;
  updatedAt: string;
  history: { advertising: boolean; at: string; region: string; version: string; notice: string }[];
};
export function readConsent(): ConsentRecord | null {
  try {
    const value = JSON.parse(localStorage.getItem(CONSENT_KEY) || "null");
    return value && typeof value.advertising === "boolean" && typeof value.visitorId === "string" && Array.isArray(value.history) ? value : null;
  } catch { return null; }
}
export function mayTrack(region: string, choice: ConsentRecord | null) {
  return choice ? choice.advertising : !needsConsent(region);
}