import type { PageWithTags, PageTreeNode } from '@/types/database'

export function buildPageTree(pages: PageWithTags[]): PageTreeNode[] {
  const map = new Map<string, PageTreeNode>()
  const roots: PageTreeNode[] = []

  // First pass: create nodes
  for (const page of pages) {
    map.set(page.id, { ...page, children: [] })
  }

  // Second pass: link parents
  for (const page of pages) {
    const node = map.get(page.id)!
    if (page.parent_id && map.has(page.parent_id)) {
      map.get(page.parent_id)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}
