import { Schema, getDecoderStateCallbacks } from "@colyseus/schema"

const isPrimative = (value) => value !== Object(value)

export const useWrappedDecoderState = (decoder, wrapperFnc) => {
  const targetRoot = wrapperFnc({})

  const $ = getDecoderStateCallbacks(decoder)

  const bindArraySchemaField = (schema, target, { name }) => {
    if(target[name] == undefined)
      target[name] = wrapperFnc([])

    $(schema)[name].onAdd((item, index) => {
      // TODO: when adding an item, sometimes the item is added twice if the array isn't seen beforehand?
      let finalTarget = null
      if(isPrimative(item)) {
        // TODO: bind the primative value changing somehow?
        finalTarget = item
      } else {
        finalTarget = wrapperFnc({})
        bindSchema(item, finalTarget)
      }
      target[name].splice(index, 0, finalTarget)
    })

    $(schema)[name].onRemove((_, index) => {
      target[name].splice(index, 1)
    })
  }

  const bindMapSchemaField = (schema, target, { name }) => {
    if(target[name] == undefined)
      target[name] = wrapperFnc({})

    $(schema)[name].onAdd((item, key) => {
      let finalTarget = null
      if(isPrimative(item)) {
        // TODO: bind the primative value changing somehow?
        finalTarget = item
      } else {
        finalTarget = wrapperFnc({})
        bindSchema(item, finalTarget)
      }
      target[name][key] = finalTarget
    })

    $(schema)[name].onRemove((_, key) => {
      delete target[name][key]
    })
  }

  const bindSchemaField = (schema, target, { name }) => {
    if(target[name] == undefined)
      target[name] = wrapperFnc({})

    if(schema[name] != undefined)
      bindSchema(schema[name], target[name])
  }

  const bindBasicField = (schema, target, { name }) => {
    target[name] = schema[name]
    $(schema).listen(name, (value) => target[name] = value)
  }

  const bindField = (schema, target, metadata) => {
    const { type } = metadata

    // TODO: these type checks may be inaccurate or unreliable
    if(typeof type == "string") {
      bindBasicField(schema, target, metadata)
    } else if(typeof type == "object" && typeof type.map != "undefined") {
      bindMapSchemaField(schema, target, metadata)
    } else if(typeof type == "object" && typeof type.array != "undefined") {
      bindArraySchemaField(schema, target, metadata)
    } else if(Schema.prototype.isPrototypeOf(type.prototype)) {
      bindSchemaField(schema, target, metadata)
    } else {
      throw Error("Encountered type that useWrappedDecoderState is unaware of.")
    }
  }

  const bindSchema = (schema, target) => {
    const metadata = schema.constructor[Symbol.metadata]
    for(const entry in metadata)
      bindField(schema, target, metadata[entry])
  }

  // TODO: shouldn't have to wait for some data to bind?
  let haveBound = false
  $(decoder.state).onChange(() => {
    if(!haveBound) {
      bindSchema(decoder.state, targetRoot)
      haveBound = true
    }
  })

  return targetRoot
}