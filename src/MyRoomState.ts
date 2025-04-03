import { ArraySchema, MapSchema, Schema, type } from "@colyseus/schema"

export class Deeper extends Schema {
  @type('number') tick = 0;
}

export class Deep extends Schema {
  @type(Deeper) deeper = new Deeper();
  @type('number') tick = 0;
}

export class Position extends Schema {
  @type('number') x = 0;
  @type('number') y = 0;
}

export class Player extends Schema {
 @type('string') name: string = "Player";
 @type(Position) position = new Position();
}

export class TestNumber extends Schema {
 @type('number') value: number = 123;
}

export class MyRoomState extends Schema {
  @type('number') tick = 0;
  @type(Deep) deep = new Deep();
  @type('string') myString = "Hello world!";
  @type({ map: Player }) players = new MapSchema<Player>();
  @type([ TestNumber ]) numbers = new ArraySchema<Number>();
  @type({ map: "number" }) primativeMap = new MapSchema<Number>();
  @type([ "number" ]) primativeArr = new ArraySchema<Number>();
}
