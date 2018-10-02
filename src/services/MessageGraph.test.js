/*
 * Copyright 2018 Vulcanize, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the “License”);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an “AS IS” BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import MessageBoardGraph from './MessageGraph'

describe(MessageBoardGraph.name, () => {
  describe('children(node)', () => {
    it('returns undefined when no node matches', () => {
      let graph = new MessageBoardGraph()
      expect(graph.children('node')).toBeUndefined()
    })

    it('returns an empty list for a node with no children', () => {
      let graph = new MessageBoardGraph()
      graph.addNode('node')
      expect(graph.children('node')).toEqual([])
    })

    it('returns children of the node', () => {
      let graph = new MessageBoardGraph()

      graph.addNode('parent1')
      graph.addNode('parent1_child1', 'parent1')
      graph.addNode('parent1_child2', 'parent1')
      graph.addNode('parent2')
      graph.addNode('parent2_child', 'parent2')

      expect(graph.children('parent1')).toEqual(['parent1_child1', 'parent1_child2'])
    })

    it('maintains connections when adding the same node twice', () => {
      let graph = new MessageBoardGraph()

      graph.addNode('parent')
      graph.addNode('child', 'parent')
      graph.addNode('parent')

      expect(graph.children('parent')).toEqual(['child'])
    })

    it('accepts a child node before the parent is added', () => {
      let graph = new MessageBoardGraph()
      graph.addNode('child', 'parent')
      expect(graph.children('parent')).toEqual(['child'])
    })

    it('does not allow a node to be added as a child of itself', () => {
      let graph = new MessageBoardGraph()
      graph.addNode('parent', 'parent')
      expect(graph.children('parent')).toEqual([])
    })

    it('adds a child only once', () => {
      let graph = new MessageBoardGraph()
      graph.addNode('child', 'parent')
      graph.addNode('child', 'parent')
      expect(graph.children('parent')).toEqual(['child'])
    })
  })
})
