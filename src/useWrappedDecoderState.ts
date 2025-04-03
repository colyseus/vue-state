// TODO: weird behaviour when removing from sets and collections it appears
//       to sometimes leave some in the final reactive state, i suspect this
//       might be due to onRemove not working as intended

import { Schema, getDecoderStateCallbacks } from "@colyseus/schema"

export const useWrappedDecoderState = (decoder, wrapperFnc = (v) => v) => {
  const targetRoot = wrapperFnc({})

  const $ = getDecoderStateCallbacks(decoder)

  const bindArraySchemaField = (schema, target, { name, type }) => {
    if(target[name] == undefined)
      target[name] = wrapperFnc([])

    // TODO: This might not be the best way to check this
    const arrayContainsPrimatives = typeof type.array == "string" || typeof type.set == "string" || typeof type.collection == "string"

    if(arrayContainsPrimatives) {
      // TODO: This array contains primative types, we'll have to bind through .onChange to track changes
      $(schema)[name].onChange(() => {
        for(let i = 0; i < schema[name].length; i++) 
          target[name][i] = schema[name][i]
      })
    }

    $(schema)[name].onAdd((item, index) => {
      let finalTarget = item
      if(!arrayContainsPrimatives) {
        finalTarget = wrapperFnc({})
        bindSchema(item, finalTarget)
      }
      target[name].splice(index, 0, finalTarget)
    }, false)

    $(schema)[name].onRemove((_, index) => {
      target[name].splice(index, 1)
    })
  }

  const bindMapSchemaField = (schema, target, { name, type }) => {
    if(target[name] == undefined)
      target[name] = wrapperFnc({})

    // TODO: This might not be the best way to check this
    const mapContainsPrimatives = typeof type.map == "string"

    if(mapContainsPrimatives) {
      // TODO: This map contains primative types, we'll have to bind through .onChange to track changes
      $(schema)[name].onChange(() => {
        schema[name].forEach((value, key) => {
          target[name][key] = value
        })
      })
    }

    $(schema)[name].onAdd((item, key) => {
      let finalTarget = item
      if(!mapContainsPrimatives) {
        finalTarget = wrapperFnc({})
        bindSchema(item, finalTarget)
      }
      target[name][key] = finalTarget
    }, false)

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

  // TODO: the type checks throughout this method may be inaccurate or unreliable
  const bindField = (schema, target, metadata) => {
    const { type } = metadata

    const isTypeObjectLike = (type) => Boolean(typeof type == "object" && type.map)
    const isTypeArrayLike = (type) => Boolean(typeof type == "object" && (type.array || type.set || type.collection))

    if(typeof type == "string") {
      bindBasicField(schema, target, metadata)
    } else if(isTypeObjectLike(type)) {
      bindMapSchemaField(schema, target, metadata)
    } else if(isTypeArrayLike(type)) {
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
  const unbindFirstChange = $(decoder.state).onChange(() => {
    bindSchema(decoder.state, targetRoot)
    unbindFirstChange()
  })

  return targetRoot
}