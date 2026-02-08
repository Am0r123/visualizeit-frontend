import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-array-visualizer',
  templateUrl: './array-visualizer.component.html',
  styles: [`
    .array-wrapper { display: flex; align-items: flex-end; gap: 6px; height: 300px; padding-bottom: 20px; }
    .bar-group { display: flex; flex-direction: column; align-items: center; width: 40px; }
    .bar { width: 100%; background: #007acc; color: white; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 5px; border-radius: 4px 4px 0 0; }
    .bar.active { background: #ff4081; }
    .index-label { color: #666; font-size: 12px; margin-top: 4px; }
    .pointer-label { color: #ffeb3b; font-weight: bold; font-size: 12px; min-height: 15px; }
  `]
})
export class ArrayVisualizerComponent {
  @Input() data: number[] = [];
  @Input() indices: any = {};

  getHeight(val: number) { 
    const max = Math.max(...(this.data.length ? this.data : [100]));
    return Math.max((val / (max || 1)) * 200, 30); 
  }
  isIndexActive(i: number) { return Object.values(this.indices).includes(i); }
  getPointers(i: number) { return Object.keys(this.indices).filter(k => this.indices[k] === i).join(','); }
}