import { getTools } from '../../service'

const state = {
  tools: [],
  loading: true
}

const mutations = {
  updateTools (state, tools) {
    state.tools = tools
  },
  updateLoading (state, isLoading) {
    state.loading = !!isLoading
  }
}

const actions = {
  async getTool ({ state, commit }) {
    const { data } = await getTools()
    commit('updateTools', data.data)
    commit('updateLoading', false)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
