import { Component, Input, OnChanges } from '@angular/core';

interface NodeUI {
  id: number;
  val: any;
  nextId: number | null;
  prevId: number | null;
}

@Component({
  selector: 'app-linked-list-visualizer',
  templateUrl: './linked-list-visualizer.component.html',
  styles: [`
    .ll-container {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      overflow-x: auto;
      height: 100%;
      width: 100%;
    }
    .node-group {
      display: flex;
      align-items: center;
      position: relative;
    }
    .node {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: #1e1e1e;
      border: 2px solid #007acc;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      z-index: 2;
      font-weight: bold;
      transition: all 0.2s;
    }
    .node.highlight {
      border-color: #ff9800;
      background: #3e2723;
      transform: scale(1.1);
    }
    .connector {
      width: 40px; 
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .arrow {
      font-size: 24px;
      color: #666;
      font-weight: bold;
    }
    .arrow.double {
      color: #4caf50;
      font-size: 28px;
      margin-top: -5px;
    }
    .arrow.dim { color: #333; }
    .null-indicator {
      margin-left: 10px;
      font-family: monospace;
      color: #888;
      font-weight: bold;
    }
    .pointers {
      position: absolute;
      top: -40px;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }
    .pointer-label {
      background: #ffeb3b;
      color: black;
      padding: 2px 5px;
      border-radius: 3px;
      font-size: 11px;
      font-weight: bold;
      white-space: nowrap;
      box-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }
  `]
})
export class LinkedListVisualizerComponent implements OnChanges {
  @Input() head: any;
  @Input() indices: any;
  nodes: NodeUI[] = [];

  ngOnChanges() {
    this.nodes = [];
    if (!this.head) return;

    let current = this.head;
    let limit = 20; 
    let seen = new Set(); 

    while (current && limit > 0) {
      let id = current.__id__;
      if (seen.has(id)) break;
      seen.add(id);

      let val = current.val !== undefined ? current.val : (current.data !== undefined ? current.data : current.value);
      let nextId = this.resolveId(current.next);
      let prevId = this.resolveId(current.prev);

      this.nodes.push({ id, val, nextId, prevId });
      current = current.next;
      limit--;
    }
  }

  resolveId(obj: any): number | null {
    if (!obj) return null;
    if (obj.__id__) return obj.__id__;
    if (obj.ref) return obj.ref;
    return null;
  }

  hasNextLink(i: number): boolean {
    if (i >= this.nodes.length - 1) return false;
    return this.nodes[i].nextId === this.nodes[i+1].id;
  }

  isDoubleLink(i: number): boolean {
    if (i >= this.nodes.length - 1) return false;
    let current = this.nodes[i];
    let nextNode = this.nodes[i+1];
    return current.nextId === nextNode.id && nextNode.prevId === current.id;
  }

  hasPointer(id: number) { return Object.values(this.indices).includes(id); }
  getPointers(id: number) { return Object.keys(this.indices).filter(k => this.indices[k] === id); }
}