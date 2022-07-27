import { h } from 'preact'
import { useTitleTemplate, useMeta } from 'hoofd/preact'

export default function App () {
  useTitleTemplate('%s • Replugged')
  useMeta({ name: 'og:title', content: 'Replugged' })
  useMeta({ name: 'og:site_name', content: 'Replugged' })
  useMeta({ name: 'og:description', content: 'A lightweight Discord client mod focused on simplicity and performance.' })
  useMeta({ name: 'description', content: 'A lightweight Discord client mod focused on simplicity and performance.' })


  return (
    <h1>wip</h1>
  )
}
