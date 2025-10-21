import { PinataSDK } from "pinata"

export const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT || process.env.REACT_APP_PINATA_JWT || "",
  pinataGateway: process.env.PINATA_GATEWAY || process.env.REACT_APP_PINATA_GATEWAY || ""
})
