// Test helpers: walk a mounted tree and read what it draws.
export type Node = { type: string; props?: Record<string, unknown>; children?: (Node | string)[] }

// Every Markdown element's text, in drawing order.
export function markdowns(root: unknown): string[] {
  const out: string[] = []
  const walk = (n: Node) => {
    if (n.type === 'Markdown' && typeof n.props?.text === 'string') out.push(n.props.text)
    n.children?.forEach(c => typeof c === 'object' && walk(c))
  }
  walk(root as Node)
  return out
}

// Bold heads: bold Text elements and Markdown elements that are one bold span ("**…**").
export function bolds(root: unknown): string[] {
  const out: string[] = []
  const walk = (n: Node) => {
    if (n.type === 'Text' && n.props?.bold) out.push((n.children ?? []).filter(c => typeof c === 'string').join(''))
    const text = typeof n.props?.text === 'string' ? n.props.text : ''
    if (n.type === 'Markdown' && /^\*\*[^*]+\*\*$/.test(text)) out.push(text.slice(2, -2))
    n.children?.forEach(c => typeof c === 'object' && walk(c))
  }
  walk(root as Node)
  return out
}
