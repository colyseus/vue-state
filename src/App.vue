<template>
  <div>
    <div class="options">
      <label><input type="checkbox" v-model="opts.updateRoot" /> Update root tick</label>
      <label><input type="checkbox" v-model="opts.updateDeep" /> Update deep tick</label>
      <label><input type="checkbox" v-model="opts.updateDeeper" /> Update deeper tick</label>
      <label><input type="checkbox" v-model="opts.updatePlayerPositions" /> Update player positions</label>
      <label><input type="checkbox" v-model="opts.updatePrimatives" /> Update primatives</label>
      <label><input type="checkbox" v-model="opts.showRawStates" /> Show raw states</label>
      <button @click="simulateString">Simulate string change</button>
      <button @click="simulateAddPlayer">Simulate add player</button>
      <button @click="simulateRemovePlayer">Simulate remove player</button>
      <button @click="simulateAddNumber">Simulate add number</button>
      <button @click="simulateRemoveNumber">Simulate remove number</button>
      <button @click="simulateAddPrimativeMap">Simulate add primative map</button>
      <button @click="simulateRemovePrimativeMap">Simulate remove primative map</button>
      <button @click="simulateAddPrimativeArray">Simulate add primative arr</button>
      <button @click="simulateRemovePrimativeArray">Simulate remove primative arr</button>
      <button @click="simulateAddPrimativeSet">Simulate add primative set</button>
      <button @click="simulateRemovePrimativeSet">Simulate remove primative set</button>
      <button @click="simulateAddPrimativeCollection">Simulate add primative collection</button>
      <button @click="simulateRemovePrimativeCollection">Simulate remove primative collection</button>
    </div>

    <h2>Rendered reactive state</h2>
    <RoomState :state="state" />

    <template v-if="opts.showRawStates">
      <h2>Raw reactive state</h2>
      <pre>{{ state }}</pre>

      <h2>Raw server state</h2>
      <pre>{{ serverState }}</pre>

      <h2>Raw client state</h2>
      <pre>{{ clientState }}</pre>
    </template>
  </div>
</template>

<script lang="ts" setup>
import RoomState from "./components/RoomState.vue"

import { reactive } from "vue"

import { simulateServer, decoder, clientState, serverState } from "./simulate.ts"
import { useWrappedDecoderState } from "./useWrappedDecoderState.ts"
import { Player, TestNumber } from "./MyRoomState.ts"

const state = useWrappedDecoderState(decoder, reactive)

// Define our options
const opts = reactive({
  updateRoot: false,
  updateDeep: false,
  updateDeeper: false,
  updatePlayerPositions: false,
  updatePrimatives: false,
  showRawStates: false,
})

// Setup intervals to simulate the server state update
setInterval(() => {
  if(opts.updateRoot)
    simulateServer(s => s.tick += 1)
  
  if(opts.updateDeep)
    simulateServer(s => s.deep.tick += 1)
  
  if(opts.updateDeeper)
    simulateServer(s => s.deep.deeper.tick += 1)

  if(opts.updatePrimatives) {
    simulateServer(s => {
      for(let i = 0; i < s.primativeArr.length; i++) {
        s.primativeArr[i] = Math.random()
      }

      s.primativeMap.forEach((_, key) => {
        s.primativeMap.set(key, Math.random())
      })
    })
  }
}, 1000)

setInterval(() => {
  if(opts.updatePlayerPositions) {
    simulateServer(s => {
      for(const player of s.players.values()) {
        player.position.x = Math.random() * 100
        player.position.y = Math.random() * 100
      }
    })
  }
}, 100)

// Provide some simulate functions
const simulateString = () => simulateServer(s => s.myString = "Updated! " + Math.random())

const simulateAddPlayer = () => {
  const name = Math.random()
  simulateServer(s => s.players.set(`p-${name}`, new Player().assign({ name: "Player " + name })))
}

const simulateRemovePlayer = () => {
  simulateServer(s => {
    const randomKey = Array.from(s.players.keys())[Math.floor(Math.random() * s.players.size)];
    s.players.delete(randomKey)
  })
}

const simulateAddNumber = () => {
  const number = Math.random()
  simulateServer(s => s.numbers.push(new TestNumber().assign({ value: number })))
}

const simulateRemoveNumber = () => {
  simulateServer(s => s.numbers.pop())
}

const simulateAddPrimativeMap = () => {
  const id = Math.random()
  simulateServer(s => s.primativeMap.set(`i-${id}`, id))
}

const simulateRemovePrimativeMap = () => {
  simulateServer(s => {
    const randomKey = Array.from(s.primativeMap.keys())[Math.floor(Math.random() * s.primativeMap.size)];
    s.primativeMap.delete(randomKey)
  })
}

const simulateAddPrimativeArray = () => {
  const number = Math.random()
  simulateServer(s => s.primativeArr.push(number))
}

const simulateRemovePrimativeArray = () => {
  simulateServer(s => s.primativeArr.pop())
}

const simulateAddPrimativeSet = () => {
  const number = Math.random() * 3 | 0
  simulateServer(s => s.primativeSet.add(number))
}

const simulateRemovePrimativeSet = () => {
  const number = Math.random() * 3 | 0
  simulateServer(s => s.primativeSet.delete(number))
}

const simulateAddPrimativeCollection = () => {
  const number = Math.random() * 3 | 0
  simulateServer(s => s.primativeCollection.add(number))
}

const simulateRemovePrimativeCollection = () => {
  const number = Math.random() * 3 | 0
  simulateServer(s => s.primativeCollection.delete(number))
}
</script>