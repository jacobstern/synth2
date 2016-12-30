import fetch from 'isomorphic-fetch'

const API_URL = 'https://us-west-2.api.scaphold.io/graphql/synth2'

const GET_PURE_DATA_PATCH_QUERY = `
  query GetPureDataPatch($input:ID!) {
    getPureDataPatch(id:$input) {
      id,
      source,
      abstractions {
        name,
        source
      },
      requiresAudioInput
    }
  }`

export const getPureDataPatch = id => {
  return fetch(API_URL, {
    body: JSON.stringify({
      query: GET_PURE_DATA_PATCH_QUERY,
      variables: { input: id }
    }),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(response => response.json())
    .then(json => {
      return json.data.getPureDataPatch
    })
}
