import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';

type Language = 'Python' | 'JavaScript' | 'Unknown';
type VisualizationKey =
  | 'selectionSort'
  | 'bubbleSort'
  | 'insertionSort'
  | 'linearSearch'
  | 'binarySearch'
  | 'stack'
  | 'queue'
  | 'linkedList'
  | 'binaryTree'
  | 'unknown';

type VisualizationView = 'empty' | 'bars' | 'stack' | 'queue' | 'linkedList' | 'tree';
type VisualState = 'normal' | 'active' | 'compare' | 'swap' | 'sorted' | 'found' | 'error' | 'new' | 'removed' | 'visited';
type IssueSeverity = 'error' | 'warning' | 'info';

interface SupportedVisualization {
  title: string;
  key: VisualizationKey;
  category: string;
  signals: string[];
  example: string;
}

interface SampleCode {
  title: string;
  key: VisualizationKey;
  code: string;
}

interface CodeIssue {
  line: number;
  severity: IssueSeverity;
  message: string;
}

interface VisualBar {
  value: number;
  state: VisualState;
}

interface StructureCell {
  value: string | number;
  state: VisualState;
  label?: string;
}

interface TreeNodeVisual {
  id: string;
  value: number;
  x: number;
  y: number;
  state: VisualState;
  label?: string;
}

interface TreeEdgeVisual {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

interface VisualStep {
  line: number;
  view: VisualizationView;
  description: string;
  bars: VisualBar[];
  stack: StructureCell[];
  queue: StructureCell[];
  list: StructureCell[];
  treeNodes: TreeNodeVisual[];
  treeEdges: TreeEdgeVisual[];
  vars: Record<string, string | number>;
}

interface DetectedInfo {
  language: Language;
  key: VisualizationKey;
  title: string;
  category: string;
  whatUserEntered: string;
  extractedData: string[];
  nextAction: string;
}

interface AnalysisResult {
  detected: DetectedInfo;
  issues: CodeIssue[];
  steps: VisualStep[];
}

interface ParsedOperation {
  type: 'push' | 'pop' | 'peek' | 'enqueue' | 'dequeue' | 'append' | 'prepend' | 'delete' | 'search' | 'reverse' | 'insert';
  value?: number;
  line: number;
}

interface TreeNodeModel {
  id: string;
  value: number;
  left: TreeNodeModel | null;
  right: TreeNodeModel | null;
}

@Component({
  selector: 'app-custom-code-visualizer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './custom-code-visualizer.component.html',
  styleUrls: ['./custom-code-visualizer.component.scss'],
})
export class CustomCodeVisualizerComponent implements OnDestroy {
  code = '';
  selectedSampleKey: VisualizationKey | '' = '';
  isTraceMode = false;
  speed = 6;
  currentStepIndex = 0;
  statusPercent = 0;
  detected: DetectedInfo | null = null;
  issues: CodeIssue[] = [];
  steps: VisualStep[] = [];
  private playTimer: ReturnType<typeof setInterval> | null = null;
  private treeIdCounter = 0;

  readonly supportedVisualizations: SupportedVisualization[] = [
    {
      title: 'Selection Sort',
      key: 'selectionSort',
      category: 'Sorting',
      signals: ['min_idx', 'minimum index', 'arr[j] < arr[min_idx]'],
      example: 'arr = [64, 25, 12, 22, 11]',
    },
    {
      title: 'Bubble Sort',
      key: 'bubbleSort',
      category: 'Sorting',
      signals: ['arr[j] > arr[j + 1]', 'nested loop', 'swap adjacent values'],
      example: 'arr = [5, 1, 4, 2, 8]',
    },
    {
      title: 'Insertion Sort',
      key: 'insertionSort',
      category: 'Sorting',
      signals: ['key = arr[i]', 'while j >= 0', 'arr[j + 1] = arr[j]'],
      example: 'arr = [9, 5, 1, 4, 3]',
    },
    {
      title: 'Linear Search',
      key: 'linearSearch',
      category: 'Searching',
      signals: ['target = value', 'for i in range', 'arr[i] == target'],
      example: 'arr = [7, 3, 9, 2, 6], target = 2',
    },
    {
      title: 'Binary Search',
      key: 'binarySearch',
      category: 'Searching',
      signals: ['left', 'right', 'mid', 'target'],
      example: 'arr = [2, 4, 6, 8, 10], target = 8',
    },
    {
      title: 'Stack',
      key: 'stack',
      category: 'Data Structure',
      signals: ['stack.append(x)', 'push(x)', 'stack.pop()', 'peek'],
      example: 'stack = []; stack.append(10); stack.pop()',
    },
    {
      title: 'Queue',
      key: 'queue',
      category: 'Data Structure',
      signals: ['queue.append(x)', 'enqueue(x)', 'queue.pop(0)', 'dequeue'],
      example: 'queue = []; queue.append(10); queue.pop(0)',
    },
    {
      title: 'Linked List',
      key: 'linkedList',
      category: 'Data Structure',
      signals: ['class Node', 'self.next', 'head', 'append(x)', 'reverse()'],
      example: 'values = [10, 20, 30] or linked_list.append(10)',
    },
    {
      title: 'Binary Search Tree / Tree',
      key: 'binaryTree',
      category: 'Data Structure',
      signals: ['root', 'left', 'right', 'insert(root, x)', 'inorder traversal'],
      example: 'values = [50, 30, 70, 20, 40]',
    },
  ];

  readonly samples: SampleCode[] = [
    {
      title: 'Selection Sort',
      key: 'selectionSort',
      code: `def selection_sort(arr):
    for i in range(len(arr)):
        min_idx = i
        for j in range(i + 1, len(arr)):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]

arr = [64, 25, 12, 22, 11]
selection_sort(arr)`,
    },
    {
      title: 'Bubble Sort',
      key: 'bubbleSort',
      code: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]

arr = [5, 1, 4, 2, 8]
bubble_sort(arr)`,
    },
    {
      title: 'Linear Search',
      key: 'linearSearch',
      code: `def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1

arr = [7, 3, 9, 2, 6]
target = 2
linear_search(arr, target)`,
    },
    {
      title: 'Binary Search',
      key: 'binarySearch',
      code: `def binary_search(arr, target):
    left = 0
    right = len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

arr = [2, 4, 6, 8, 10, 12, 14]
target = 10
binary_search(arr, target)`,
    },
    {
      title: 'Stack',
      key: 'stack',
      code: `stack = []
stack.append(10)
stack.append(20)
stack.append(30)
stack.pop()
stack.append(40)
print(stack[-1])`,
    },
    {
      title: 'Queue',
      key: 'queue',
      code: `queue = []
queue.append(10)
queue.append(20)
queue.append(30)
queue.pop(0)
queue.append(40)`,
    },
    {
      title: 'Linked List',
      key: 'linkedList',
      code: `class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

values = [10, 20, 30, 40]
target = 30
# visualize append, search, and reverse
search(target)
reverse()`,
    },
    {
      title: 'Binary Search Tree',
      key: 'binaryTree',
      code: `class Node:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

values = [50, 30, 70, 20, 40, 60, 80]
target = 60
# visualize BST insertion and search
insert(root, 50)
insert(root, 30)
insert(root, 70)
search(root, target)
inorder(root)`,
    },
  ];

  ngOnDestroy(): void {
    this.stop();
  }

  get isPlaying(): boolean {
    return this.playTimer !== null;
  }

  get codeLines(): string[] {
    return this.code.split('\n');
  }

  get currentStep(): VisualStep | null {
    return this.steps[this.currentStepIndex] ?? null;
  }

  get currentIssue(): CodeIssue | undefined {
    const line = this.currentStep?.line;
    return line ? this.issueAtLine(line) : undefined;
  }

  get currentStepLabel(): string {
    if (!this.steps.length) return '0/0';
    return `${this.currentStepIndex + 1}/${this.steps.length}`;
  }

  get maxBarValue(): number {
    const values = this.currentStep?.bars.map((bar) => bar.value) ?? [];
    return Math.max(1, ...values);
  }

  get hasUserCode(): boolean {
    return this.code.trim().length > 0;
  }

  insertSample(sample: SampleCode): void {
    this.stop();
    this.code = sample.code;
    this.selectedSampleKey = sample.key;
    this.clearOutput();
  }

  insertSelectedSample(): void {
    if (!this.selectedSampleKey) return;
    const sample = this.samples.find((item) => item.key === this.selectedSampleKey);
    if (sample) this.insertSample(sample);
  }

  clearAll(): void {
    this.stop();
    this.code = '';
    this.selectedSampleKey = '';
    this.clearOutput();
  }

  verifyAndRun(): void {
    this.stop();
    this.clearOutput(false);

    if (!this.code.trim()) {
      this.issues = [
        {
          line: 1,
          severity: 'info',
          message: 'Paste or type code first. The editor intentionally starts empty.',
        },
      ];
      this.statusPercent = 0;
      return;
    }

    const result = this.analyzeAndBuild(this.code);
    this.detected = result.detected;
    this.issues = result.issues;
    this.steps = result.steps;
    this.currentStepIndex = 0;
    this.isTraceMode = true;
    this.statusPercent = this.calculateStatus(result);
  }

  play(): void {
    if (!this.steps.length || this.isPlaying) return;
    const delay = Math.max(120, 1250 - this.speed * 105);
    this.playTimer = setInterval(() => {
      if (this.currentStepIndex >= this.steps.length - 1) {
        this.stop();
        return;
      }
      this.next();
    }, delay);
  }

  pause(): void {
    this.stop();
  }

  next(): void {
    if (!this.steps.length) return;
    this.currentStepIndex = Math.min(this.currentStepIndex + 1, this.steps.length - 1);
  }

  prev(): void {
    if (!this.steps.length) return;
    this.currentStepIndex = Math.max(this.currentStepIndex - 1, 0);
  }

  restart(): void {
    this.stop();
    this.currentStepIndex = 0;
  }

  editAgain(): void {
    this.stop();
    this.isTraceMode = false;
  }

  barHeight(value: number): number {
    return Math.max(34, Math.round((Math.abs(value) / this.maxBarValue) * 178));
  }

  issueAtLine(line: number): CodeIssue | undefined {
    return this.issues.find((issue) => issue.line === line && issue.severity !== 'info');
  }

  variableTextAtIndex(vars: Record<string, string | number>, index: number): string {
    return Object.entries(vars)
      .filter(([, value]) => Number(value) === index)
      .map(([key]) => key)
      .join(', ');
  }

  private clearOutput(clearCode = false): void {
    if (clearCode) this.code = '';
    this.detected = null;
    this.issues = [];
    this.steps = [];
    this.currentStepIndex = 0;
    this.statusPercent = 0;
    this.isTraceMode = false;
  }

  private stop(): void {
    if (this.playTimer) clearInterval(this.playTimer);
    this.playTimer = null;
  }

  private calculateStatus(result: AnalysisResult): number {
    if (!result.steps.length) return 0;
    if (result.issues.some((issue) => issue.severity === 'error')) return 72;
    if (result.issues.some((issue) => issue.severity === 'warning')) return 90;
    return 100;
  }

  private analyzeAndBuild(sourceCode: string): AnalysisResult {
    const language = this.detectLanguage(sourceCode);
    const key = this.detectVisualization(sourceCode);
    const arr = this.extractNumberList(sourceCode);
    const target = this.extractTarget(sourceCode);
    const issues: CodeIssue[] = [
      ...this.validateSyntax(sourceCode),
      ...this.validateAlgorithmLogic(sourceCode, key),
    ];

    if (language === 'Unknown') {
      issues.push({ line: 1, severity: 'warning', message: 'Language was not fully detected. Python-like and JavaScript-like code patterns work best.' });
    }

    let visualizationSteps: VisualStep[] = [];

    if (key === 'unknown') {
      issues.push({
        line: 1,
        severity: 'error',
        message: 'Unsupported visualization pattern. The code will still be scanned line by line, but no data-structure animation can be generated.',
      });
    } else {
      switch (key) {
        case 'selectionSort':
        case 'bubbleSort':
        case 'insertionSort':
          if (!arr.length) issues.push({ line: 1, severity: 'error', message: 'Sorting visualization needs a numeric array like arr = [5, 3, 1].' });
          visualizationSteps = arr.length ? this.generateSortingSteps(sourceCode, key, arr) : [];
          break;
        case 'linearSearch':
        case 'binarySearch':
          if (!arr.length) issues.push({ line: 1, severity: 'error', message: 'Search visualization needs a numeric array like arr = [5, 3, 1].' });
          if (target === null) issues.push({ line: 1, severity: 'error', message: 'Search visualization needs target = value.' });
          if (key === 'binarySearch' && arr.length && !this.isSortedAscending(arr)) {
            issues.push({ line: this.findLine(sourceCode, /arr|array|nums|values/i), severity: 'warning', message: 'Binary Search requires a sorted ascending array. The visualizer will still follow your entered data, so the result may be wrong.' });
          }
          visualizationSteps = arr.length && target !== null ? this.generateSearchSteps(sourceCode, key, arr, target) : [];
          break;
        case 'stack':
          visualizationSteps = this.generateStackSteps(sourceCode);
          if (!visualizationSteps.length) issues.push({ line: 1, severity: 'error', message: 'Stack visualization needs operations such as stack.append(10), push(10), stack.pop(), or peek.' });
          break;
        case 'queue':
          visualizationSteps = this.generateQueueSteps(sourceCode);
          if (!visualizationSteps.length) issues.push({ line: 1, severity: 'error', message: 'Queue visualization needs operations such as queue.append(10), enqueue(10), queue.pop(0), or dequeue().' });
          break;
        case 'linkedList':
          visualizationSteps = this.generateLinkedListSteps(sourceCode, arr, target);
          if (!visualizationSteps.length) issues.push({ line: 1, severity: 'error', message: 'Linked List visualization needs values = [10, 20, 30] or calls such as linked_list.append(10).' });
          break;
        case 'binaryTree':
          visualizationSteps = this.generateTreeSteps(sourceCode, arr, target);
          if (!visualizationSteps.length) issues.push({ line: 1, severity: 'error', message: 'Tree visualization needs values = [50, 30, 70] or insert(root, value) calls.' });
          break;
        default:
          break;
      }
    }

    const finalSteps = visualizationSteps.length
      ? visualizationSteps
      : [
          this.step({
            view: 'empty',
            line: 1,
            description: 'No supported visualization steps could be generated. Detected errors are listed below the code.',
            vars: { status: 'NO VISUAL TRACE' },
          }),
        ];

    return {
      detected: this.makeDetectedInfo(language, key, arr, target, this.operationsForSummary(sourceCode, key)),
      issues: this.dedupeIssues(issues),
      steps: finalSteps,
    };
  }

  private validateSyntax(code: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const lines = code.split('\n');
    const stack: { char: string; line: number }[] = [];
    const openers: Record<string, string> = { '(': ')', '[': ']', '{': '}' };
    const closers = new Set(Object.values(openers));

    lines.forEach((rawLine, index) => {
      const lineNumber = index + 1;
      const line = rawLine.trim();
      if (!line || line.startsWith('#') || line.startsWith('//')) return;

      let quote: string | null = null;
      for (let charIndex = 0; charIndex < rawLine.length; charIndex++) {
        const ch = rawLine[charIndex];
        const prev = rawLine[charIndex - 1];
        if ((ch === '"' || ch === "'") && prev !== '\\') {
          quote = quote === ch ? null : quote ?? ch;
          continue;
        }
        if (quote) continue;
        if (openers[ch]) stack.push({ char: ch, line: lineNumber });
        if (closers.has(ch)) {
          const last = stack.pop();
          if (!last || openers[last.char] !== ch) {
            issues.push({ line: lineNumber, severity: 'error', message: `Syntax error: unmatched closing '${ch}'.` });
          }
        }
      }

      const looksPythonBlock = /^(def|class|for|while|if|elif|else|try|except|finally)\b/.test(line);
      const isJavaScriptStyle = /\{|\}|;|\blet\b|\bconst\b|\bvar\b|function\s+/.test(line);
      if (looksPythonBlock && !isJavaScriptStyle && !line.endsWith(':')) {
        issues.push({ line: lineNumber, severity: 'error', message: 'Syntax error: Python block statement should end with a colon (:).' });
      }

      if (/^if\b/.test(line) && /[^=!<>]=[^=]/.test(line) && !/(:=)/.test(line)) {
        issues.push({ line: lineNumber, severity: 'error', message: 'Possible condition error: use == for comparison, not = assignment.' });
      }

      if (/\[\s*-?\d+(\s+-?\d+)+\s*\]/.test(line)) {
        issues.push({ line: lineNumber, severity: 'error', message: 'Array syntax error: numbers inside arrays must be separated by commas.' });
      }

      if (/range\s+\(/.test(line) || /range\s+len/.test(line)) {
        issues.push({ line: lineNumber, severity: 'error', message: 'Syntax error: use range(...) with parentheses, for example range(len(arr)).' });
      }
    });

    for (const item of stack) {
      issues.push({ line: item.line, severity: 'error', message: `Syntax error: missing closing '${openers[item.char]}' for '${item.char}'.` });
    }

    return this.dedupeIssues(issues);
  }

  private validateAlgorithmLogic(code: string, key: VisualizationKey): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const compact = code.replace(/\s+/g, ' ');

    if (key === 'selectionSort' && this.selectionUsesDescendingComparator(code)) {
      issues.push({ line: this.findLine(code, /arr\s*\[\s*j\s*\]\s*>\s*arr\s*\[\s*min/i), severity: 'error', message: 'Logic error: this comparison selects the maximum value, so it sorts descending. The animation will follow this wrong logic exactly.' });
    }

    if (key === 'bubbleSort' && this.bubbleUsesDescendingComparator(code)) {
      issues.push({ line: this.findLine(code, /arr\s*\[\s*j\s*\]\s*<\s*arr\s*\[\s*j\s*\+\s*1/i), severity: 'error', message: 'Logic error: this swaps when the left value is smaller, so Bubble Sort becomes descending. The animation will follow it as entered.' });
    }

    if (key === 'insertionSort' && this.insertionUsesDescendingComparator(code)) {
      issues.push({ line: this.findLine(code, /while.*arr\s*\[\s*j\s*\]\s*<\s*key/i), severity: 'error', message: 'Logic error: this while condition shifts smaller values, so Insertion Sort becomes descending. The animation will follow it as entered.' });
    }

    if (key === 'linearSearch' && /arr\s*\[\s*i\s*\]\s*!=\s*target|arr\s*\[\s*i\s*\]\s*!==\s*target/.test(compact)) {
      issues.push({ line: this.findLine(code, /arr\s*\[\s*i\s*\]\s*!=\s*target|arr\s*\[\s*i\s*\]\s*!==\s*target/i), severity: 'error', message: 'Logic error: this condition returns when the value is NOT the target. The search visualization will follow this wrong condition.' });
    }

    return this.dedupeIssues(issues);
  }

  private dedupeIssues(issues: CodeIssue[]): CodeIssue[] {
    const seen = new Set<string>();
    return issues.filter((issue) => {
      const key = `${issue.line}-${issue.severity}-${issue.message}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private selectionUsesDescendingComparator(code: string): boolean {
    return /arr\s*\[\s*j\s*\]\s*>\s*arr\s*\[\s*(?:min_idx|minindex|minimum_index)\s*\]/i.test(code);
  }

  private bubbleUsesDescendingComparator(code: string): boolean {
    return /arr\s*\[\s*j\s*\]\s*<\s*arr\s*\[\s*j\s*\+\s*1\s*\]/i.test(code);
  }

  private insertionUsesDescendingComparator(code: string): boolean {
    return /while[^\n]*arr\s*\[\s*j\s*\]\s*<\s*key/i.test(code);
  }

  private linearSearchUsesNotEquals(code: string): boolean {
    return /arr\s*\[\s*i\s*\]\s*!=\s*target|arr\s*\[\s*i\s*\]\s*!==\s*target/i.test(code.replace(/\s+/g, ' '));
  }

  private detectLanguage(code: string): Language {
    const text = code.trim();
    if (/\bdef\s+\w+\s*\(|\bclass\s+\w+\s*:|\bprint\s*\(|\brange\s*\(/.test(text)) return 'Python';
    if (/\bfunction\s+\w+\s*\(|=>|console\.log|\blet\s+|\bconst\s+|\bvar\s+|\.push\s*\(/.test(text)) return 'JavaScript';
    return 'Unknown';
  }

  private detectVisualization(code: string): VisualizationKey {
    const text = code.toLowerCase();
    const compact = text.replace(/\s+/g, ' ');

    if ((/\bleft\b/.test(text) && /\bright\b/.test(text) && /\broot\b/.test(text)) || /\bbst\b|binary_search_tree|inorder|preorder|postorder/.test(text)) {
      return 'binaryTree';
    }
    if (/self\.next|\.next\s*=|\bhead\b|linked\s*list|linkedlist/.test(text)) {
      return 'linkedList';
    }
    if (/\bqueue\b|enqueue\s*\(|dequeue\s*\(|popleft\s*\(|pop\s*\(\s*0\s*\)/.test(text)) {
      return 'queue';
    }
    if (/\bstack\b|push\s*\(|peek\s*\(|stack\.append\s*\(|stack\.pop\s*\(/.test(text)) {
      return 'stack';
    }
    if (/selection_sort|min_idx|minindex|minimum_index/.test(text)) return 'selectionSort';
    if (/bubble_sort/.test(text) || /arr\s*\[\s*j\s*\]\s*[<>]\s*arr\s*\[\s*j\s*\+\s*1\s*\]/.test(compact)) return 'bubbleSort';
    if (/insertion_sort|key\s*=\s*arr\s*\[\s*i\s*\]|arr\s*\[\s*j\s*\+\s*1\s*\]\s*=\s*arr\s*\[\s*j\s*\]/.test(compact)) return 'insertionSort';
    if (/binary_search/.test(text) || (/\bleft\b/.test(text) && /\bright\b/.test(text) && /\bmid\b/.test(text) && /\btarget\b/.test(text))) return 'binarySearch';
    if (/linear_search/.test(text) || (/\btarget\b/.test(text) && /arr\s*\[\s*i\s*\]\s*(?:==|!=|===|!==)\s*target/.test(compact))) return 'linearSearch';
    return 'unknown';
  }

  private makeDetectedInfo(language: Language, key: VisualizationKey, arr: number[], target: number | null, operations: string[]): DetectedInfo {
    const lookup = this.supportedVisualizations.find((item) => item.key === key);
    const title = lookup?.title ?? 'Unsupported / Unknown Code';
    const category = lookup?.category ?? 'Not supported';
    const extractedData: string[] = [];

    if (arr.length) extractedData.push(`Numbers detected: [${arr.join(', ')}]`);
    if (target !== null) extractedData.push(`Target detected: ${target}`);
    if (operations.length) extractedData.push(`Operations detected: ${operations.join(' → ')}`);
    if (!extractedData.length) extractedData.push('No numeric data or supported operations were extracted yet.');

    return {
      language,
      key,
      title,
      category,
      whatUserEntered:
        key === 'unknown'
          ? 'The user entered code, but it is outside the supported visualization set.'
          : `The user entered ${title} code from the ${category} category.`,
      extractedData,
      nextAction:
        key === 'unknown'
          ? 'Try one of the supported patterns: sorting, searching, stack, queue, linked list, or binary tree/BST.'
          : `The system will visualize ${title} step by step using the extracted values and operations.`,
    };
  }

  private extractNumberList(code: string): number[] {
    const namedArray = code.match(/(?:arr|array|nums|list|values|data|items|nodes)\s*=\s*\[([^\]]+)\]/i);
    const anyArray = code.match(/\[\s*-?\d+(?:(?:\s*,\s*|\s+)-?\d+)+\s*\]/);
    const raw = namedArray?.[1] ?? anyArray?.[0].replace(/[\[\]]/g, '') ?? '';
    if (!raw) return [];

    // Normal path: comma-separated arrays. Recovery path: whitespace-separated numbers
    // so a syntax error like arr = [5 3 1] can still be visualized as the user intended.
    const tokens = raw.includes(',') ? raw.split(',') : raw.trim().split(/\s+/);
    return tokens
      .map((item) => Number(item.trim()))
      .filter((value) => Number.isFinite(value));
  }

  private extractTarget(code: string): number | null {
    const targetDeclaration = code.match(/target\s*=\s*(-?\d+)/i);
    if (targetDeclaration) return Number(targetDeclaration[1]);

    const searchCall = code.match(/search\s*\([^\)]*?,\s*(-?\d+)\s*\)/i) ?? code.match(/search\s*\(\s*(-?\d+)\s*\)/i);
    if (searchCall) return Number(searchCall[1]);
    return null;
  }

  private operationsForSummary(code: string, key: VisualizationKey): string[] {
    if (key === 'stack') return this.parseStackOperations(code).map((op) => op.value !== undefined ? `${op.type}(${op.value})` : `${op.type}()`);
    if (key === 'queue') return this.parseQueueOperations(code).map((op) => op.value !== undefined ? `${op.type}(${op.value})` : `${op.type}()`);
    if (key === 'linkedList') return this.parseLinkedListOperations(code).map((op) => op.value !== undefined ? `${op.type}(${op.value})` : `${op.type}()`);
    if (key === 'binaryTree') return this.parseTreeInsertions(code).map((value) => `insert(${value})`);
    return [];
  }

  private generateSortingSteps(code: string, key: VisualizationKey, values: number[]): VisualStep[] {
    switch (key) {
      case 'selectionSort':
        return this.selectionSortSteps(code, values);
      case 'bubbleSort':
        return this.bubbleSortSteps(code, values);
      case 'insertionSort':
        return this.insertionSortSteps(code, values);
      default:
        return [];
    }
  }

  private generateSearchSteps(code: string, key: VisualizationKey, values: number[], target: number): VisualStep[] {
    return key === 'binarySearch' ? this.binarySearchSteps(code, values, target) : this.linearSearchSteps(code, values, target);
  }

  private selectionSortSteps(code: string, values: number[]): VisualStep[] {
    const arr = [...values];
    const descending = this.selectionUsesDescendingComparator(code);
    const selectedWord = descending ? 'maximum' : 'minimum';
    const steps: VisualStep[] = [this.step({ view: 'bars', bars: this.bars(arr), description: `Start Selection Sort on [${arr.join(', ')}]. Direction detected from your comparison: ${descending ? 'descending / wrong for ascending sort' : 'ascending'}.`, line: this.findLine(code, /selection_sort|for\s+i/i) })];
    const compareLine = this.findLine(code, /arr\s*\[\s*j\s*\]\s*[<>]\s*arr\s*\[\s*(?:min_idx|minindex|minimum_index)/i);
    const swapLine = this.findLine(code, /arr\s*\[\s*i\s*\]\s*,\s*arr\s*\[\s*min/i);

    for (let i = 0; i < arr.length; i++) {
      let selectedIdx = i;
      steps.push(this.step({ view: 'bars', bars: this.bars(arr, { [i]: 'active' }), vars: { i, min_idx: selectedIdx }, description: `Assume index ${i} is the current ${selectedWord}.`, line: this.findLine(code, /min_idx\s*=\s*i/i) }));
      for (let j = i + 1; j < arr.length; j++) {
        steps.push(this.step({ view: 'bars', bars: this.bars(arr, { [j]: 'compare', [selectedIdx]: 'active' }), vars: { i, j, min_idx: selectedIdx }, description: `Compare arr[${j}] = ${arr[j]} with current ${selectedWord} arr[${selectedIdx}] = ${arr[selectedIdx]}.`, line: compareLine }));
        const shouldSelect = descending ? arr[j] > arr[selectedIdx] : arr[j] < arr[selectedIdx];
        if (shouldSelect) {
          selectedIdx = j;
          steps.push(this.step({ view: 'bars', bars: this.bars(arr, { [selectedIdx]: 'found', [i]: 'active' }), vars: { i, j, min_idx: selectedIdx }, description: `New ${selectedWord} found at index ${selectedIdx}.`, line: this.findLine(code, /min_idx\s*=\s*j/i) }));
        }
      }
      [arr[i], arr[selectedIdx]] = [arr[selectedIdx], arr[i]];
      steps.push(this.step({ view: 'bars', bars: this.bars(arr, { [i]: 'sorted', [selectedIdx]: 'swap' }), vars: { i, min_idx: selectedIdx }, description: `Swap index ${i} with selected ${selectedWord} index ${selectedIdx}.`, line: swapLine }));
    }

    steps.push(this.step({ view: 'bars', bars: this.bars(arr, {}, true), description: `Done according to the entered code. Final array is [${arr.join(', ')}].`, line: Math.max(1, code.split('\n').length) }));
    return steps;
  }

  private bubbleSortSteps(code: string, values: number[]): VisualStep[] {
    const arr = [...values];
    const descending = this.bubbleUsesDescendingComparator(code);
    const steps: VisualStep[] = [this.step({ view: 'bars', bars: this.bars(arr), description: `Start Bubble Sort on [${arr.join(', ')}]. Direction detected from your comparison: ${descending ? 'descending / wrong for ascending sort' : 'ascending'}.`, line: this.findLine(code, /bubble_sort|for\s+i/i) })];
    const compareLine = this.findLine(code, /arr\s*\[\s*j\s*\]\s*[<>]\s*arr\s*\[\s*j\s*\+\s*1/i);
    const swapLine = this.findLine(code, /arr\s*\[\s*j\s*\]\s*,\s*arr\s*\[\s*j\s*\+\s*1/i);

    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        steps.push(this.step({ view: 'bars', bars: this.bars(arr, { [j]: 'compare', [j + 1]: 'compare' }), vars: { i, j }, description: `Compare adjacent values ${arr[j]} and ${arr[j + 1]}.`, line: compareLine }));
        const shouldSwap = descending ? arr[j] < arr[j + 1] : arr[j] > arr[j + 1];
        if (shouldSwap) {
          const leftBefore = arr[j];
          const rightBefore = arr[j + 1];
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          steps.push(this.step({ view: 'bars', bars: this.bars(arr, { [j]: 'swap', [j + 1]: 'swap' }), vars: { i, j }, description: `Swap because the entered condition is true: ${leftBefore} ${descending ? '<' : '>'} ${rightBefore}.`, line: swapLine }));
        }
      }
      steps.push(this.step({ view: 'bars', bars: this.bars(arr, { [arr.length - i - 1]: 'sorted' }), vars: { i }, description: `${descending ? 'Smallest' : 'Largest'} remaining value moved according to the entered code.`, line: compareLine }));
    }

    steps.push(this.step({ view: 'bars', bars: this.bars(arr, {}, true), description: `Done according to the entered code. Final array is [${arr.join(', ')}].`, line: Math.max(1, code.split('\n').length) }));
    return steps;
  }

  private insertionSortSteps(code: string, values: number[]): VisualStep[] {
    const arr = [...values];
    const descending = this.insertionUsesDescendingComparator(code);
    const steps: VisualStep[] = [this.step({ view: 'bars', bars: this.bars(arr), description: `Start Insertion Sort on [${arr.join(', ')}]. Direction detected from your while condition: ${descending ? 'descending / wrong for ascending sort' : 'ascending'}.`, line: this.findLine(code, /insertion_sort|for\s+i/i) })];
    const keyLine = this.findLine(code, /key\s*=\s*arr\s*\[\s*i\s*\]/i);
    const whileLine = this.findLine(code, /while\s+j\s*>=\s*0/i);
    const writeLine = this.findLine(code, /arr\s*\[\s*j\s*\+\s*1\s*\]\s*=\s*key/i);

    for (let i = 1; i < arr.length; i++) {
      const keyValue = arr[i];
      let j = i - 1;
      steps.push(this.step({ view: 'bars', bars: this.bars(arr, { [i]: 'active' }), vars: { i, key: keyValue }, description: `Take key = ${keyValue} from index ${i}.`, line: keyLine }));
      while (j >= 0 && (descending ? arr[j] < keyValue : arr[j] > keyValue)) {
        const shifted = arr[j];
        arr[j + 1] = arr[j];
        steps.push(this.step({ view: 'bars', bars: this.bars(arr, { [j]: 'compare', [j + 1]: 'swap' }), vars: { i, j, key: keyValue }, description: `Shift ${shifted} one position to the right because ${shifted} ${descending ? '<' : '>'} key ${keyValue}.`, line: whileLine }));
        j--;
      }
      arr[j + 1] = keyValue;
      steps.push(this.step({ view: 'bars', bars: this.bars(arr, { [j + 1]: 'found' }), vars: { i, j: j + 1, key: keyValue }, description: `Insert key ${keyValue} at index ${j + 1}.`, line: writeLine }));
    }

    steps.push(this.step({ view: 'bars', bars: this.bars(arr, {}, true), description: `Done according to the entered code. Final array is [${arr.join(', ')}].`, line: Math.max(1, code.split('\n').length) }));
    return steps;
  }

  private linearSearchSteps(code: string, values: number[], target: number): VisualStep[] {
    const useNotEquals = this.linearSearchUsesNotEquals(code);
    const steps: VisualStep[] = [this.step({ view: 'bars', bars: this.bars(values), description: `Start Linear Search for target ${target}. Condition detected: arr[i] ${useNotEquals ? '!=' : '=='} target.`, line: this.findLine(code, /linear_search|for\s+i/i) })];
    const compareLine = this.findLine(code, /arr\s*\[\s*i\s*\]\s*(?:==|!=|===|!==)\s*target|(?:==|!=|===|!==)\s*target/i);

    for (let i = 0; i < values.length; i++) {
      const conditionTrue = useNotEquals ? values[i] !== target : values[i] === target;
      steps.push(this.step({ view: 'bars', bars: this.bars(values, { [i]: conditionTrue ? 'found' : 'compare' }), vars: { i, target }, description: conditionTrue ? `Condition is true at index ${i} (${values[i]} ${useNotEquals ? '!=' : '=='} ${target}). The entered code would stop here.` : `Condition is false at index ${i}; continue scanning.`, line: compareLine }));
      if (conditionTrue) return steps;
    }

    steps.push(this.step({ view: 'bars', bars: this.bars(values), vars: { target }, description: `The entered search condition never became true.`, line: Math.max(1, code.split('\n').length) }));
    return steps;
  }

  private binarySearchSteps(code: string, values: number[], target: number): VisualStep[] {
    const arr = [...values];
    const steps: VisualStep[] = [this.step({ view: 'bars', bars: this.bars(arr), vars: { target }, description: `Start Binary Search for target ${target}.`, line: this.findLine(code, /binary_search|left\s*=\s*0/i) })];
    const midLine = this.findLine(code, /mid\s*=|middle/i);
    const compareLine = this.findLine(code, /arr\s*\[\s*mid\s*\]|target/i);
    let left = 0;
    let right = arr.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const rangeHighlights: Record<number, VisualState> = {};
      for (let i = left; i <= right; i++) rangeHighlights[i] = 'active';
      rangeHighlights[mid] = arr[mid] === target ? 'found' : 'compare';
      steps.push(this.step({ view: 'bars', bars: this.bars(arr, rangeHighlights), vars: { left, right, mid, target }, description: `Middle index is ${mid}; compare arr[${mid}] = ${arr[mid]} with target ${target}.`, line: midLine || compareLine }));

      if (arr[mid] === target) {
        steps.push(this.step({ view: 'bars', bars: this.bars(arr, { [mid]: 'found' }), vars: { left, right, mid, target }, description: `Found target ${target} at index ${mid}.`, line: compareLine }));
        return steps;
      }

      if (arr[mid] < target) {
        left = mid + 1;
        steps.push(this.step({ view: 'bars', bars: this.bars(arr, { [mid]: 'visited' }), vars: { left, right, mid, target }, description: `${arr[mid]} is smaller than ${target}, so search the right half.`, line: this.findLine(code, /left\s*=\s*mid\s*\+\s*1/i) }));
      } else {
        right = mid - 1;
        steps.push(this.step({ view: 'bars', bars: this.bars(arr, { [mid]: 'visited' }), vars: { left, right, mid, target }, description: `${arr[mid]} is greater than ${target}, so search the left half.`, line: this.findLine(code, /right\s*=\s*mid\s*-\s*1/i) }));
      }
    }

    steps.push(this.step({ view: 'bars', bars: this.bars(arr), vars: { target }, description: `Target ${target} was not found.`, line: Math.max(1, code.split('\n').length) }));
    return steps;
  }

  private generateStackSteps(code: string): VisualStep[] {
    const initial = this.extractNamedArray(code, 'stack');
    const stack = initial.map((value) => String(value));
    const operations = this.parseStackOperations(code);
    const steps: VisualStep[] = [];

    if (stack.length || operations.length) {
      steps.push(this.step({ view: 'stack', stack: this.stackCells(stack), description: stack.length ? `Initial stack has ${stack.length} item(s).` : 'Start with an empty stack.', line: this.findLine(code, /stack\s*=|\[\]/i) }));
    }

    for (const op of operations) {
      if (op.type === 'push' && op.value !== undefined) {
        stack.push(String(op.value));
        steps.push(this.step({ view: 'stack', stack: this.stackCells(stack, stack.length - 1, 'new'), description: `Push ${op.value}. It becomes the TOP item.`, line: op.line }));
      } else if (op.type === 'pop') {
        const removed = stack.pop();
        steps.push(this.step({ view: 'stack', stack: this.stackCells(stack), description: removed !== undefined ? `Pop removes ${removed} from the TOP.` : 'Pop called on an empty stack.', line: op.line }));
      } else if (op.type === 'peek') {
        steps.push(this.step({ view: 'stack', stack: this.stackCells(stack, stack.length - 1, 'found'), description: stack.length ? `Peek reads the TOP item: ${stack[stack.length - 1]}.` : 'Peek called on an empty stack.', line: op.line }));
      }
    }

    return steps;
  }

  private generateQueueSteps(code: string): VisualStep[] {
    const initial = this.extractNamedArray(code, 'queue');
    const queue = initial.map((value) => String(value));
    const operations = this.parseQueueOperations(code);
    const steps: VisualStep[] = [];

    if (queue.length || operations.length) {
      steps.push(this.step({ view: 'queue', queue: this.queueCells(queue), description: queue.length ? `Initial queue has ${queue.length} item(s).` : 'Start with an empty queue.', line: this.findLine(code, /queue\s*=|\[\]/i) }));
    }

    for (const op of operations) {
      if (op.type === 'enqueue' && op.value !== undefined) {
        queue.push(String(op.value));
        steps.push(this.step({ view: 'queue', queue: this.queueCells(queue, queue.length - 1, 'new'), description: `Enqueue ${op.value}. It enters from the REAR.`, line: op.line }));
      } else if (op.type === 'dequeue') {
        const removed = queue.shift();
        steps.push(this.step({ view: 'queue', queue: this.queueCells(queue, 0, 'active'), description: removed !== undefined ? `Dequeue removes ${removed} from the FRONT.` : 'Dequeue called on an empty queue.', line: op.line }));
      }
    }

    return steps;
  }

  private generateLinkedListSteps(code: string, values: number[], target: number | null): VisualStep[] {
    const operations = this.parseLinkedListOperations(code);
    const initialValues = values.length ? values : operations.filter((op) => ['append', 'prepend', 'insert'].includes(op.type) && op.value !== undefined).map((op) => op.value as number);
    const list: string[] = [];
    const steps: VisualStep[] = [];
    const appendLine = this.findLine(code, /append\s*\(|insert_at_end|values\s*=/i);

    if (!initialValues.length && !operations.length) return [];
    steps.push(this.step({ view: 'linkedList', list: this.listCells(list), description: 'Start with head = null.', line: this.findLine(code, /head|values\s*=|class\s+node/i) }));

    if (values.length) {
      for (const value of values) {
        list.push(String(value));
        steps.push(this.step({ view: 'linkedList', list: this.listCells(list, list.length - 1, 'new'), description: `Append node ${value}. The previous tail now points to it.`, line: appendLine }));
      }
    }

    for (const op of operations) {
      if (!values.length && ['append', 'insert'].includes(op.type) && op.value !== undefined) {
        list.push(String(op.value));
        steps.push(this.step({ view: 'linkedList', list: this.listCells(list, list.length - 1, 'new'), description: `Append node ${op.value}.`, line: op.line }));
      }
      if (op.type === 'prepend' && op.value !== undefined) {
        list.unshift(String(op.value));
        steps.push(this.step({ view: 'linkedList', list: this.listCells(list, 0, 'new'), description: `Insert ${op.value} at the beginning. New node becomes head.`, line: op.line }));
      }
      if (op.type === 'search') {
        const wanted = op.value ?? target;
        if (wanted !== null && wanted !== undefined) {
          for (let index = 0; index < list.length; index++) {
            const found = Number(list[index]) === wanted;
            steps.push(this.step({ view: 'linkedList', list: this.listCells(list, index, found ? 'found' : 'compare'), description: found ? `Found node ${wanted} at position ${index}.` : `Visit node ${list[index]}; keep moving next.`, line: op.line }));
            if (found) break;
          }
        }
      }
      if (op.type === 'delete' && op.value !== undefined) {
        const index = list.findIndex((item) => Number(item) === op.value);
        if (index >= 0) {
          steps.push(this.step({ view: 'linkedList', list: this.listCells(list, index, 'removed'), description: `Delete node ${op.value}. The previous node will skip it.`, line: op.line }));
          list.splice(index, 1);
          steps.push(this.step({ view: 'linkedList', list: this.listCells(list), description: `Node ${op.value} removed and links updated.`, line: op.line }));
        }
      }
      if (op.type === 'reverse') {
        steps.push(this.step({ view: 'linkedList', list: this.listCells(list, -1, 'active'), description: 'Reverse starts: each next pointer will be redirected backward.', line: op.line }));
        list.reverse();
        steps.push(this.step({ view: 'linkedList', list: this.listCells(list, 0, 'found'), description: `Reverse done. New head is ${list[0] ?? 'null'}.`, line: op.line }));
      }
    }

    return steps;
  }

  private generateTreeSteps(code: string, values: number[], target: number | null): VisualStep[] {
    const explicitInsertValues = this.parseTreeInsertions(code);
    const insertValues = values.length ? values : explicitInsertValues;
    if (!insertValues.length) return [];

    this.treeIdCounter = 0;
    let root: TreeNodeModel | null = null;
    const steps: VisualStep[] = [this.step({ view: 'tree', description: 'Start with root = null.', line: this.findLine(code, /root|values\s*=|class\s+node/i) })];

    for (const value of insertValues) {
      const insertion = this.insertIntoTree(root, value);
      root = insertion.root;
      for (const pathNode of insertion.path) {
        steps.push(this.treeStep(root, `Compare ${value} with node ${pathNode.value}. Go ${value < pathNode.value ? 'left' : 'right'}.`, this.findLine(code, /insert|left|right/i), pathNode.id, 'compare'));
      }
      steps.push(this.treeStep(root, `Insert ${value} into the tree.`, this.findLine(code, /insert|values\s*=/i), insertion.insertedId, 'new'));
    }

    const searchTarget = target;
    if (searchTarget !== null && /search\s*\(|find\s*\(/i.test(code)) {
      const path = this.findTreePath(root, searchTarget);
      for (const item of path) {
        steps.push(this.treeStep(root, item.value === searchTarget ? `Found ${searchTarget} in the tree.` : `Visit ${item.value}; ${searchTarget} is ${searchTarget < item.value ? 'smaller' : 'larger'}, continue.`, this.findLine(code, /search|find/i), item.id, item.value === searchTarget ? 'found' : 'visited'));
        if (item.value === searchTarget) break;
      }
    }

    if (/inorder/i.test(code)) {
      const order = this.inorder(root);
      for (const node of order) {
        steps.push(this.treeStep(root, `Inorder traversal visits ${node.value}.`, this.findLine(code, /inorder/i), node.id, 'found'));
      }
    }

    return steps;
  }

  private parseStackOperations(code: string): ParsedOperation[] {
    return code.split('\n').flatMap((line, index) => {
      const lineNumber = index + 1;
      const trimmed = line.trim();
      const push = trimmed.match(/(?:stack\.append|stack\.push|push)\s*\(\s*(-?\d+)\s*\)/i);
      if (push) return [{ type: 'push', value: Number(push[1]), line: lineNumber } as ParsedOperation];
      if (/stack\.pop\s*\(\s*\)|\bpop\s*\(\s*\)/i.test(trimmed) && !/pop\s*\(\s*0\s*\)/i.test(trimmed)) return [{ type: 'pop', line: lineNumber } as ParsedOperation];
      if (/peek\s*\(|stack\s*\[\s*-1\s*\]/i.test(trimmed)) return [{ type: 'peek', line: lineNumber } as ParsedOperation];
      return [];
    });
  }

  private parseQueueOperations(code: string): ParsedOperation[] {
    return code.split('\n').flatMap((line, index) => {
      const lineNumber = index + 1;
      const trimmed = line.trim();
      const enqueue = trimmed.match(/(?:queue\.append|queue\.push|enqueue|q\.put)\s*\(\s*(-?\d+)\s*\)/i);
      if (enqueue) return [{ type: 'enqueue', value: Number(enqueue[1]), line: lineNumber } as ParsedOperation];
      if (/queue\.pop\s*\(\s*0\s*\)|dequeue\s*\(\s*\)|popleft\s*\(\s*\)|q\.get\s*\(\s*\)/i.test(trimmed)) return [{ type: 'dequeue', line: lineNumber } as ParsedOperation];
      return [];
    });
  }

  private parseLinkedListOperations(code: string): ParsedOperation[] {
    return code.split('\n').flatMap((line, index) => {
      const lineNumber = index + 1;
      const trimmed = line.trim();
      const prepend = trimmed.match(/(?:prepend|insert_at_beginning|push_front)\s*\(\s*(-?\d+)\s*\)/i);
      if (prepend) return [{ type: 'prepend', value: Number(prepend[1]), line: lineNumber } as ParsedOperation];
      const append = trimmed.match(/(?:linked_list\.|ll\.)?(?:append|insert_at_end|add)\s*\(\s*(-?\d+)\s*\)/i);
      if (append) return [{ type: 'append', value: Number(append[1]), line: lineNumber } as ParsedOperation];
      const insert = trimmed.match(/(?:insert)\s*\(\s*(-?\d+)\s*\)/i);
      if (insert && !/root|tree/i.test(trimmed)) return [{ type: 'insert', value: Number(insert[1]), line: lineNumber } as ParsedOperation];
      const del = trimmed.match(/(?:delete|remove)\s*\(\s*(-?\d+)\s*\)/i);
      if (del) return [{ type: 'delete', value: Number(del[1]), line: lineNumber } as ParsedOperation];
      const search = trimmed.match(/search\s*\(\s*(-?\d+|target)\s*\)/i);
      if (search) return [{ type: 'search', value: search[1].toLowerCase() === 'target' ? undefined : Number(search[1]), line: lineNumber } as ParsedOperation];
      if (/reverse\s*\(/i.test(trimmed)) return [{ type: 'reverse', line: lineNumber } as ParsedOperation];
      return [];
    });
  }

  private parseTreeInsertions(code: string): number[] {
    const values: number[] = [];
    for (const line of code.split('\n')) {
      const insertRoot = line.match(/insert\s*\(\s*(?:root|tree|bst)[^,]*,\s*(-?\d+)\s*\)/i);
      const methodInsert = line.match(/(?:tree|bst|root)\.insert\s*\(\s*(-?\d+)\s*\)/i);
      if (insertRoot) values.push(Number(insertRoot[1]));
      else if (methodInsert) values.push(Number(methodInsert[1]));
    }
    return values;
  }

  private extractNamedArray(code: string, name: string): number[] {
    const match = code.match(new RegExp(`${name}\\s*=\\s*\\[([^\\]]*)\\]`, 'i'));
    if (!match || !match[1].trim()) return [];
    return match[1]
      .split(',')
      .map((item) => Number(item.trim()))
      .filter((value) => Number.isFinite(value));
  }

  private bars(values: number[], highlights: Record<number, VisualState> = {}, allSorted = false): VisualBar[] {
    return values.map((value, index) => ({ value, state: allSorted ? 'sorted' : highlights[index] ?? 'normal' }));
  }

  private stackCells(values: string[], activeIndex = -1, activeState: VisualState = 'active'): StructureCell[] {
    return values.map((value, index) => ({
      value,
      state: index === activeIndex ? activeState : 'normal',
      label: index === values.length - 1 ? 'TOP' : undefined,
    })).reverse();
  }

  private queueCells(values: string[], activeIndex = -1, activeState: VisualState = 'active'): StructureCell[] {
    return values.map((value, index) => ({
      value,
      state: index === activeIndex ? activeState : 'normal',
      label: index === 0 ? 'FRONT' : index === values.length - 1 ? 'REAR' : undefined,
    }));
  }

  private listCells(values: string[], activeIndex = -1, activeState: VisualState = 'active'): StructureCell[] {
    return values.map((value, index) => ({
      value,
      state: index === activeIndex ? activeState : 'normal',
      label: index === 0 ? 'HEAD' : index === values.length - 1 ? 'TAIL' : undefined,
    }));
  }

  private step(partial: Partial<VisualStep>): VisualStep {
    return {
      line: partial.line ?? 1,
      view: partial.view ?? 'empty',
      description: partial.description ?? '',
      bars: partial.bars ?? [],
      stack: partial.stack ?? [],
      queue: partial.queue ?? [],
      list: partial.list ?? [],
      treeNodes: partial.treeNodes ?? [],
      treeEdges: partial.treeEdges ?? [],
      vars: partial.vars ?? {},
    };
  }

  private treeStep(root: TreeNodeModel | null, description: string, line: number, activeId?: string, state: VisualState = 'active'): VisualStep {
    const layout = this.layoutTree(root, activeId, state);
    return this.step({ view: 'tree', treeNodes: layout.nodes, treeEdges: layout.edges, description, line });
  }

  private insertIntoTree(root: TreeNodeModel | null, value: number): { root: TreeNodeModel; path: TreeNodeModel[]; insertedId: string } {
    const newNode = this.makeTreeNode(value);
    if (!root) return { root: newNode, path: [], insertedId: newNode.id };

    const path: TreeNodeModel[] = [];
    let current = root;
    while (true) {
      path.push(current);
      if (value < current.value) {
        if (!current.left) {
          current.left = newNode;
          break;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = newNode;
          break;
        }
        current = current.right;
      }
    }

    return { root, path, insertedId: newNode.id };
  }

  private makeTreeNode(value: number): TreeNodeModel {
    this.treeIdCounter += 1;
    return { id: `node-${this.treeIdCounter}`, value, left: null, right: null };
  }

  private findTreePath(root: TreeNodeModel | null, target: number): TreeNodeModel[] {
    const path: TreeNodeModel[] = [];
    let current = root;
    while (current) {
      path.push(current);
      if (current.value === target) break;
      current = target < current.value ? current.left : current.right;
    }
    return path;
  }

  private inorder(root: TreeNodeModel | null): TreeNodeModel[] {
    if (!root) return [];
    return [...this.inorder(root.left), root, ...this.inorder(root.right)];
  }

  private layoutTree(root: TreeNodeModel | null, activeId?: string, activeState: VisualState = 'active'): { nodes: TreeNodeVisual[]; edges: TreeEdgeVisual[] } {
    const nodes: TreeNodeVisual[] = [];
    const edges: TreeEdgeVisual[] = [];
    if (!root) return { nodes, edges };

    const ordered = this.inorder(root);
    const xMap = new Map<string, number>();
    ordered.forEach((node, index) => {
      xMap.set(node.id, ((index + 1) / (ordered.length + 1)) * 100);
    });

    const visit = (node: TreeNodeModel, depth: number): void => {
      const x = xMap.get(node.id) ?? 50;
      const y = 36 + depth * 78;
      nodes.push({ id: node.id, value: node.value, x, y, state: node.id === activeId ? activeState : 'normal' });
      for (const child of [node.left, node.right]) {
        if (child) {
          const childX = xMap.get(child.id) ?? x;
          const childY = 36 + (depth + 1) * 78;
          edges.push({ fromX: x, fromY: y + 22, toX: childX, toY: childY - 22 });
          visit(child, depth + 1);
        }
      }
    };

    visit(root, 0);
    return { nodes, edges };
  }

  private findLine(code: string, pattern: RegExp): number {
    const lines = code.split('\n');
    const index = lines.findIndex((line) => pattern.test(line));
    return index >= 0 ? index + 1 : 1;
  }

  private isSortedAscending(values: number[]): boolean {
    return values.every((value, index) => index === 0 || values[index - 1] <= value);
  }
}
