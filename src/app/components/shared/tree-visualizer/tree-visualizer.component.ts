import { Component, Input, OnChanges } from '@angular/core';

interface TreeNodeUI {
  id: any;
  val: any;
  x: number;
  y: number;
}
interface LinkUI {
  x1: number; y1: number;
  x2: number; y2: number;
}

@Component({
  selector: 'app-tree-visualizer',
  template: `
    <div class="tree-container">
      <svg width="100%" height="100%" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet">
        <g transform="translate(400, 50)"> <line *ngFor="let link of links"
            [attr.x1]="link.x1" [attr.y1]="link.y1"
            [attr.x2]="link.x2" [attr.y2]="link.y2"
            stroke="#666" stroke-width="2" />

          <g *ngFor="let node of nodes">
            <circle 
              [attr.cx]="node.x" [attr.cy]="node.y" r="20"
              [attr.fill]="getNodeColor(node)"
              stroke="white" stroke-width="2" />
            
            <text 
              [attr.x]="node.x" [attr.y]="node.y" dy="5"
              text-anchor="middle" fill="white" font-weight="bold" font-family="monospace">
              {{ node.val }}
            </text>

            <text 
              [attr.x]="node.x" [attr.y]="node.y - 30"
              text-anchor="middle" fill="#ffeb3b" font-size="14" font-weight="bold">
              {{ getPointersForNode(node) }}
            </text>
          </g>

        </g>
      </svg>
    </div>
  `,
  styles: [`
    .tree-container { width: 100%; height: 100%; overflow: auto; }
  `]
})
export class TreeVisualizerComponent implements OnChanges {
  @Input() root: any; 
  @Input() indices: any;

  nodes: TreeNodeUI[] = [];
  links: LinkUI[] = [];

  ngOnChanges() {
    this.nodes = [];
    this.links = [];
    if (this.root) {
      this.calculateLayout(this.root, 0, 0, 160);
    }
  }

  calculateLayout(node: any, x: number, y: number, offset: number) {
    if (!node) return;

    // FIX: Check for 'val', 'data', or 'value' properties
    let displayValue = node.val;
    if (displayValue === undefined) displayValue = node.data;
    if (displayValue === undefined) displayValue = node.value;

    this.nodes.push({ 
        id: node.__id__, 
        val: displayValue, // Use the resolved value
        x, 
        y 
    });

    // Recursively draw children
    if (node.left) {
      this.links.push({ x1: x, y1: y, x2: x - offset, y2: y + 70 });
      this.calculateLayout(node.left, x - offset, y + 70, offset / 1.8);
    }

    if (node.right) {
      this.links.push({ x1: x, y1: y, x2: x + offset, y2: y + 70 });
      this.calculateLayout(node.right, x + offset, y + 70, offset / 1.8);
    }
  }

  getNodeColor(node: TreeNodeUI): string {
    return this.getPointersForNode(node) ? '#ff9800' : '#4caf50';
  }

  getPointersForNode(node: TreeNodeUI): string {
    if (!this.indices) return '';
    return Object.keys(this.indices)
      .filter(key => this.indices[key] === node.id)
      .join(', ');
  }
}