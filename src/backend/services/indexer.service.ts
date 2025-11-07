import * as fs from 'fs/promises';
import * as path from 'path';

interface FileIndex {
  path: string;
  content: string;
  language: string;
  functions: string[];
  classes: string[];
  exports: string[];
  imports: string[];
}

interface SearchResult {
  file: string;
  matches: string[];
  score: number;
}

export class IndexerService {
  private index: Map<string, FileIndex> = new Map();
  private indexedProjects: Set<string> = new Set();

  async indexProject(projectPath: string): Promise<void> {
    console.log(`Indexing project: ${projectPath}`);
    this.indexedProjects.add(projectPath);
    await this.indexDirectory(projectPath);
    console.log(`Indexed ${this.index.size} files`);
  }

  private async indexDirectory(dir: string): Promise<void> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (this.shouldIgnore(entry.name)) {
          continue;
        }

        if (entry.isDirectory()) {
          await this.indexDirectory(fullPath);
        } else if (entry.isFile() && this.isSupportedFile(entry.name)) {
          await this.indexFile(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error indexing directory ${dir}:`, error);
    }
  }

  private async indexFile(filePath: string): Promise<void> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const language = this.detectLanguage(filePath);

      const fileIndex: FileIndex = {
        path: filePath,
        content,
        language,
        functions: this.extractFunctions(content, language),
        classes: this.extractClasses(content, language),
        exports: this.extractExports(content, language),
        imports: this.extractImports(content, language),
      };

      this.index.set(filePath, fileIndex);
    } catch (error) {
      console.error(`Error indexing file ${filePath}:`, error);
    }
  }

  private extractFunctions(content: string, language: string): string[] {
    const functions: string[] = [];

    if (language === 'javascript' || language === 'typescript') {
      const functionRegex = /(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(|(\w+)\s*:\s*(?:async\s*)?\()/g;
      let match;
      while ((match = functionRegex.exec(content)) !== null) {
        const funcName = match[1] || match[2] || match[3];
        if (funcName) {
          functions.push(funcName);
        }
      }
    }

    return functions;
  }

  private extractClasses(content: string, language: string): string[] {
    const classes: string[] = [];

    if (language === 'javascript' || language === 'typescript') {
      const classRegex = /class\s+(\w+)/g;
      let match;
      while ((match = classRegex.exec(content)) !== null) {
        classes.push(match[1]);
      }
    }

    return classes;
  }

  private extractExports(content: string, language: string): string[] {
    const exports: string[] = [];

    if (language === 'javascript' || language === 'typescript') {
      const exportRegex = /export\s+(?:default\s+)?(?:class|function|const|let|var)?\s*(\w+)/g;
      let match;
      while ((match = exportRegex.exec(content)) !== null) {
        exports.push(match[1]);
      }
    }

    return exports;
  }

  private extractImports(content: string, language: string): string[] {
    const imports: string[] = [];

    if (language === 'javascript' || language === 'typescript') {
      const importRegex = /import\s+.*\s+from\s+['"](.+)['"]/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        imports.push(match[1]);
      }
    }

    return imports;
  }

  async search(query: string, projectPath?: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const queryLower = query.toLowerCase();

    for (const [filePath, fileIndex] of this.index.entries()) {
      if (projectPath && !filePath.startsWith(projectPath)) {
        continue;
      }

      const matches: string[] = [];
      let score = 0;

      if (fileIndex.functions.some(f => f.toLowerCase().includes(queryLower))) {
        matches.push('functions');
        score += 10;
      }

      if (fileIndex.classes.some(c => c.toLowerCase().includes(queryLower))) {
        matches.push('classes');
        score += 10;
      }

      if (fileIndex.content.toLowerCase().includes(queryLower)) {
        matches.push('content');
        score += 5;
      }

      if (matches.length > 0) {
        results.push({
          file: filePath,
          matches,
          score,
        });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  async getFilesContext(files: string[]): Promise<string> {
    let context = '';

    for (const file of files) {
      const fileIndex = this.index.get(file);
      if (fileIndex) {
        context += `\n\n// File: ${file}\n${fileIndex.content}\n`;
      }
    }

    return context;
  }

  getFileIndex(filePath: string): FileIndex | undefined {
    return this.index.get(filePath);
  }

  private detectLanguage(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const languageMap: Record<string, string> = {
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.py': 'python',
      '.html': 'html',
      '.css': 'css',
      '.json': 'json',
      '.md': 'markdown',
    };

    return languageMap[ext] || 'text';
  }

  private isSupportedFile(fileName: string): boolean {
    const ext = path.extname(fileName).toLowerCase();
    return ['.js', '.jsx', '.ts', '.tsx', '.py', '.html', '.css', '.json', '.md'].includes(ext);
  }

  private shouldIgnore(name: string): boolean {
    const ignoreList = [
      'node_modules',
      '.git',
      'dist',
      'build',
      '.next',
      '.cache',
      'coverage',
      '.vscode',
      '.idea',
    ];
    return ignoreList.includes(name);
  }
}
