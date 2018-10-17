function objToStr (o) {
  return o.toString()
}

function inject (obj1, obj2) {
  for (let i in obj2) {
    if (obj2.hasOwnProperty(i)) {
      obj1[i] = obj2[i]
    }
  }
  return obj1
}

function injectf (obj1, obj2, fu) {
  for (let i in obj2) {
    if (obj2.hasOwnProperty(i)) {
      obj1[i] = fu(obj2[i])
    }
  }
  return obj1
}

function union (obj1, obj2) {
  return inject(inject({}, obj1), obj2)
}

function clone (obj) {
  if (obj == null || typeof obj !== 'object') return obj
  return injectf(obj.constructor(), obj, clone)
}
