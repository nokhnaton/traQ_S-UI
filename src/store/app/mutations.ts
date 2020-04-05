import { defineMutations } from 'direct-vuex'
import { S } from './state'

export const mutations = defineMutations<S>()({
  setLoaded(state: S, loaded: boolean) {
    state.loaded = loaded
  },
  setComponentLoaded(state: S, componentLoaded: boolean) {
    state.componentLoaded = componentLoaded
  },
  setInitialFetchCompleted(state: S) {
    state.initialFetchCompleted = true
  }
  // TODO: テーマの変更
})
