import { Buffer } from "buffer/"
(window as any).Buffer = Buffer

import { Decoder, Encoder, getDecoderStateCallbacks } from "@colyseus/schema"

import { MyRoomState } from "./MyRoomState"

export const serverState = new MyRoomState()
export const clientState = new MyRoomState()

export const encoder = new Encoder(serverState)
export const decoder = new Decoder(clientState)

export const simulateNetworkTransfer = () => {
  const encoded = encoder.encode()
  decoder.decode(encoded)
}
export const $ = getDecoderStateCallbacks(decoder)