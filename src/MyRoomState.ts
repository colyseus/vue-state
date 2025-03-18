import { Schema, type } from "@colyseus/schema"

export class Deep extends Schema {
  @type('number') tick = 0;
}

export class MyRoomState extends Schema {
  @type('number') tick = 0;
  @type(Deep) deep = new Deep();
}