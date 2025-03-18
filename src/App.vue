<template>
  <div :key="forceUpdate">
    <div class="options">
      <label><input type="checkbox" v-model="opts.updateRoot" /> Update root tick</label>
      <label><input type="checkbox" v-model="opts.updateDeep" /> Update deep tick</label>
    </div>
    <div class="example">
      <h1>Raw wrapped with <code>reactive()</code></h1>
      <pre>{{ stateRaw }}</pre>
      <p>This fails when the root tick is removed</p>
    </div>
    <div class="example">
      <h1>Recursive proxy wrapper</h1>
      <pre>{{ stateProxy }}</pre>
      <p>This fails when the root tick is removed</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onUnmounted } from "vue"
import { serverState, clientState, simulateNetworkTransfer, $ } from "./simulate.ts"

// Define our options
const opts = reactive({
  updateRoot: true,
  updateDeep: true,
})

// Prepare our reactive states
const stateProxy = reactive({})
const stateRaw = reactive(clientState)

// Setup an interval to simulate the server state update
setInterval(() => {
  if(opts.updateRoot)
    serverState.tick += 1
  
  if(opts.updateDeep)
    serverState.deep.tick += 1

  simulateNetworkTransfer()
}, 1000)

// Force the UI to refresh every 5 seconds
const forceUpdate = ref(0)
const interval = setInterval(() => {
    forceUpdate.value += 1
}, 5000)

// Example 2: Bind the client state to a recursive proxy
const bindProxy = (from, to) => {
  return new Proxy(from, {
    set(obj, key, value) {
      if(typeof value == "object")
        to[key] = bindProxy(value, obj[key])
        else
        to[key] = value

      return true
    }
  })
}
$(clientState).bindTo(bindProxy({}, stateProxy))

onUnmounted(() => clearInterval(interval))
</script>