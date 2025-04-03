<template>
    <div class="room">
        <div class="room__tick">Tick: {{ state.tick }}</div>
        <div class="room__myString">myString: {{ state.myString }}</div>
        <div class="room__deep deep" v-if="state.deep">
            <div class="deep__tick">tick: {{ state.deep.tick }}</div>
            <div class="deep__deeper deeper">
                <div class="deeper__tick">tick: {{ state.deep.deeper.tick }}</div>
            </div>
        </div>
        <div class="room__players">
            <div class="player" v-for="(player, id) in state.players" :key="id">
                <div class="player__name">name: {{ player.name }}</div>
                <div class="player__position">
                    position: ({{ player.position.x }}, {{ player.position.y }})
                </div>
            </div>
        </div>
        <div class="room__numbers">
            <div class="number" v-for="(number, idx) in state.numbers" :key="idx">
                {{ number }}
            </div>
        </div>
        <div class="room__primativeMap">
            <div class="primative" v-for="(number, key) in state.primativeMap" :key="key">
                <div class="primative__key">key: {{ key }}</div>
                <div class="primative__number">
                    {{ number }}
                </div>
            </div>
        </div>
        <div class="room__primativeArr">
            <div class="primative" v-for="(number, idx) in state.primativeArr" :key="idx">
                {{ number }}
            </div>
        </div>
    </div>
</template>

<script setup>
import { onRenderTriggered } from "vue"
defineProps(["state"])
onRenderTriggered((...args) => {
  // console.log("onRenderTriggered", ...args)
})
</script>

<style>
.room, .room div {
    border: 1px solid black;
    margin: 0.5em;
}
</style>