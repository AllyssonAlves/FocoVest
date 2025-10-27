/**
 * Script de Análise e Otimização de Qualidade de Código
 * Verifica imports não utilizados, código morto, e otimizações
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

interface QualityReport {
  files: number
  linesOfCode: number
  unusedImports: string[]
  largeFiles: Array<{ file: string; lines: number }>
  duplicatedCode: string[]
  complexFunctions: Array<{ file: string; function: string; complexity: number }>
  suggestions: string[]
}

class CodeQualityAnalyzer {
  private srcDir = './src'
  private report: QualityReport = {
    files: 0,
    linesOfCode: 0,
    unusedImports: [],
    largeFiles: [],
    duplicatedCode: [],
    complexFunctions: [],
    suggestions: []
  }

  async analyze(): Promise<QualityReport> {
    console.log('🔍 Analisando qualidade do código...\n')

    await this.countFiles()
    await this.checkFileSize()
    await this.analyzeImports()
    await this.generateSuggestions()

    return this.report
  }

  private async countFiles(): Promise<void> {
    const files = this.getAllTSFiles()
    this.report.files = files.length

    let totalLines = 0
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8')
      const lines = content.split('\n').length
      totalLines += lines

      // Identificar arquivos grandes (> 500 linhas)
      if (lines > 500) {
        this.report.largeFiles.push({
          file: path.relative(process.cwd(), file),
          lines
        })
      }
    })

    this.report.linesOfCode = totalLines
  }

  private async checkFileSize(): Promise<void> {
    if (this.report.largeFiles.length > 0) {
      this.report.suggestions.push(
        `📁 ${this.report.largeFiles.length} arquivo(s) grande(s) detectado(s). Considere dividir em módulos menores.`
      )
    }
  }

  private async analyzeImports(): Promise<void> {
    const files = this.getAllTSFiles()
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8')
      const imports = this.extractImports(content)
      const usedSymbols = this.extractUsedSymbols(content)

      for (const imp of imports) {
        const unusedSymbols = imp.symbols.filter(symbol => 
          !usedSymbols.includes(symbol)
        )

        if (unusedSymbols.length > 0) {
          this.report.unusedImports.push(
            `${path.relative(process.cwd(), file)}: ${unusedSymbols.join(', ')} from '${imp.module}'`
          )
        }
      }
    }
  }

  private extractImports(content: string): Array<{ module: string; symbols: string[] }> {
    const imports: Array<{ module: string; symbols: string[] }> = []
    const importRegex = /import\s*{([^}]+)}\s*from\s*['"]([^'"]+)['"]/g
    let match

    while ((match = importRegex.exec(content)) !== null) {
      const symbols = match[1]
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0)

      imports.push({
        module: match[2],
        symbols
      })
    }

    return imports
  }

  private extractUsedSymbols(content: string): string[] {
    // Simpificado: procura por palavras que podem ser símbolos
    const words = content.match(/\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/g) || []
    return [...new Set(words)]
  }

  private getAllTSFiles(): string[] {
    const files: string[] = []
    
    const walkDir = (dir: string) => {
      const items = fs.readdirSync(dir)
      
      for (const item of items) {
        const itemPath = path.join(dir, item)
        const stat = fs.statSync(itemPath)
        
        if (stat.isDirectory() && item !== 'node_modules' && item !== 'dist') {
          walkDir(itemPath)
        } else if (item.endsWith('.ts') && !item.endsWith('.d.ts')) {
          files.push(itemPath)
        }
      }
    }

    walkDir(this.srcDir)
    return files
  }

  private async generateSuggestions(): Promise<void> {
    // Sugestões baseadas no tamanho do projeto
    if (this.report.files > 50) {
      this.report.suggestions.push(
        '📦 Projeto grande detectado. Considere implementar arquitetura modular com barrels (index.ts).'
      )
    }

    if (this.report.linesOfCode > 10000) {
      this.report.suggestions.push(
        '🏗️ Código extenso. Considere dividir em microserviços ou módulos independentes.'
      )
    }

    if (this.report.unusedImports.length > 0) {
      this.report.suggestions.push(
        `🧹 ${this.report.unusedImports.length} import(s) não utilizado(s) encontrado(s). Execute linting para limpeza.`
      )
    }

    // Sugestões de otimização sempre relevantes
    this.report.suggestions.push(
      '⚡ Configure tree-shaking no bundler para reduzir tamanho do bundle.',
      '🔧 Use ESLint com regras strict para manter qualidade de código.',
      '📊 Configure análise de bundle size para monitorar crescimento.',
      '🎯 Implemente code splitting para melhor performance.',
      '🧪 Mantenha cobertura de testes > 80%.'
    )
  }
}

// Script principal
async function main() {
  try {
    const analyzer = new CodeQualityAnalyzer()
    const report = await analyzer.analyze()

    console.log('📊 RELATÓRIO DE QUALIDADE DE CÓDIGO')
    console.log('=' .repeat(50))
    console.log(`📁 Total de arquivos: ${report.files}`)
    console.log(`📄 Total de linhas: ${report.linesOfCode}`)
    console.log()

    if (report.largeFiles.length > 0) {
      console.log('📁 ARQUIVOS GRANDES:')
      report.largeFiles.forEach(file => {
        console.log(`  • ${file.file} (${file.lines} linhas)`)
      })
      console.log()
    }

    if (report.unusedImports.length > 0) {
      console.log('🧹 IMPORTS NÃO UTILIZADOS:')
      report.unusedImports.slice(0, 10).forEach(imp => {
        console.log(`  • ${imp}`)
      })
      if (report.unusedImports.length > 10) {
        console.log(`  ... e mais ${report.unusedImports.length - 10}`)
      }
      console.log()
    }

    console.log('💡 SUGESTÕES DE MELHORIA:')
    report.suggestions.forEach(suggestion => {
      console.log(`  ${suggestion}`)
    })
    console.log()

    console.log('✅ Análise concluída!')

  } catch (error) {
    console.error('❌ Erro na análise:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

export { CodeQualityAnalyzer }
export type { QualityReport }