# 🌙 Sistema de Modo Escuro - FocoVest

## 📋 Visão Geral

Este documento descreve a implementação completa do sistema de modo escuro na plataforma FocoVest, incluindo configuração, componentes e diretrizes de uso.

## 🚀 Funcionalidades Implementadas

### ✅ Core Components
- [x] **ThemeContext**: Context Provider para gerenciamento de tema
- [x] **ThemeToggle**: Componente de alternância de tema com múltiplas variações
- [x] **Configuração Tailwind**: Suporte completo ao modo escuro com classe
- [x] **CSS Global**: Estilos base e componentes adaptados

### ✅ Layout Components
- [x] **Navbar**: Navegação principal com suporte completo ao modo escuro
- [x] **App Container**: Layout principal com transições suaves
- [x] **Toaster**: Notificações com tema dinâmico

### ✅ Páginas Convertidas
- [x] **RankingPageImproved**: Exemplo completo de página com modo escuro
- [ ] **HomePage**: Em desenvolvimento
- [ ] **DashboardPage**: Pendente
- [ ] **LoginPage**: Pendente
- [ ] **ProfilePage**: Pendente

## 🔧 Configuração

### 1. Tailwind CSS
```javascript
// tailwind.config.js
{
  darkMode: 'class', // Ativa modo escuro baseado em classe
  // ... resto da configuração
}
```

### 2. Theme Provider
```tsx
// App.tsx
<ThemeProvider defaultTheme="system">
  <AuthProvider>
    {/* Sua aplicação */}
  </AuthProvider>
</ThemeProvider>
```

### 3. CSS Global
```css
/* index.css */
@layer base {
  body {
    @apply bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200;
  }
}
```

## 🎨 Componentes de Tema

### ThemeToggle
Componente principal para alternância de tema com três variações:

```tsx
// Botão com ícones (padrão)
<ThemeToggle variant="button" showLabel />

// Apenas ícone
<ThemeToggleIcon />

// Dropdown
<ThemeDropdown />
```

**Props:**
- `variant`: 'button' | 'dropdown' | 'icon'
- `showLabel`: boolean (mostrar labels nos botões)
- `size`: 'sm' | 'md' | 'lg'
- `className`: string

### ThemeContext
Hook para acesso ao contexto de tema:

```tsx
import { useTheme } from '../contexts/ThemeContext'

function MyComponent() {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme()
  
  return (
    <div className={`p-4 ${resolvedTheme === 'dark' ? 'dark-specific-class' : ''}`}>
      Tema atual: {resolvedTheme}
    </div>
  )
}
```

## 🎯 Diretrizes de Uso

### Classes Tailwind Recomendadas

#### Texto
```css
/* Texto principal */
text-gray-900 dark:text-gray-100

/* Texto secundário */
text-gray-600 dark:text-gray-300

/* Texto muted */
text-gray-500 dark:text-gray-400
```

#### Backgrounds
```css
/* Background principal */
bg-white dark:bg-gray-800

/* Background da página */
bg-gray-50 dark:bg-gray-900

/* Background de cards */
bg-white dark:bg-gray-800

/* Background de hover */
hover:bg-gray-50 dark:hover:bg-gray-700
```

#### Bordas
```css
/* Bordas padrão */
border-gray-200 dark:border-gray-700

/* Bordas de input */
border-gray-300 dark:border-gray-600
```

#### Cores Primárias
```css
/* Cores que se adaptam ao tema */
text-primary-600 dark:text-primary-400
bg-primary-600 dark:bg-primary-500
```

### Classes Utilitárias Customizadas

```css
/* Definidas no index.css */
.text-primary-light   /* text-primary-600 dark:text-primary-400 */
.bg-card             /* bg-white dark:bg-gray-800 */
.border-card         /* border-gray-200 dark:border-gray-700 */
.text-muted          /* text-gray-600 dark:text-gray-400 */
.hover-card          /* hover:bg-gray-50 dark:hover:bg-gray-700 */
```

## 📝 Padrões de Implementação

### 1. Estrutura Básica de Página
```tsx
function MyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Título da Página
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          {/* Conteúdo */}
        </div>
      </div>
    </div>
  )
}
```

### 2. Cards e Componentes
```tsx
function Card({ children }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
      {children}
    </div>
  )
}
```

### 3. Botões e Interações
```tsx
function Button({ children, variant = 'primary' }) {
  const baseClasses = "px-4 py-2 rounded-lg font-medium transition-colors duration-200"
  const variants = {
    primary: "bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100"
  }
  
  return (
    <button className={`${baseClasses} ${variants[variant]}`}>
      {children}
    </button>
  )
}
```

## 🔄 Transições

### Duração Recomendada
- **Rápidas** (200ms): Hover, foco, interações
- **Normais** (300ms): Mudanças de estado
- **Lentas** (500ms): Mudanças de tema

### Classes de Transição
```css
transition-colors duration-200  /* Para cores */
transition-all duration-200     /* Para múltiplas propriedades */
```

## 📱 Responsividade

O sistema de modo escuro funciona automaticamente em todos os breakpoints:

```css
/* Sempre inclua dark: para cada breakpoint se necessário */
sm:bg-white sm:dark:bg-gray-800
md:text-gray-900 md:dark:text-gray-100
lg:border-gray-200 lg:dark:border-gray-700
```

## 🧪 Testando o Modo Escuro

### Métodos de Teste
1. **Toggle Manual**: Use os botões de tema na interface
2. **Preferência do Sistema**: Configure seu SO para modo escuro
3. **DevTools**: Simule modo escuro no navegador
4. **localStorage**: Inspecione `focovest_theme`

### Checklist de Teste
- [ ] Toggle funciona corretamente
- [ ] Preserva preferência após reload
- [ ] Todas as páginas respondem ao tema
- [ ] Contraste adequado em ambos os modos
- [ ] Ícones e imagens se adaptam
- [ ] Estados de hover/focus visíveis
- [ ] Componentes de terceiros se adaptam

## 🚧 Próximos Passos

### Páginas Pendentes
- [ ] **HomePage**: Hero section, features, footer
- [ ] **DashboardPage**: Cards de estatísticas, gráficos
- [ ] **LoginPage**: Formulários, backgrounds
- [ ] **RegisterPage**: Formulários, validações
- [ ] **ProfilePage**: Avatar, estatísticas, formulários
- [ ] **SimulationPage**: Interface de questões, timer
- [ ] **QuestionsPage**: Lista de questões, filtros

### Componentes Avançados
- [ ] **Charts/Gráficos**: Adaptação de cores para bibliotecas
- [ ] **Modals**: Overlay e backdrop
- [ ] **Tooltips**: Fundo e texto
- [ ] **Loading States**: Skeletons e spinners
- [ ] **Forms**: Estados de erro e sucesso

### Melhorias
- [ ] **Animações**: Transições mais suaves
- [ ] **Performance**: Lazy loading de estilos
- [ ] **Acessibilidade**: Testes com screen readers
- [ ] **Auto-detecção**: Mudança automática baseada no horário

## 📚 Recursos

### Documentação
- [Tailwind Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [Web Accessibility](https://www.w3.org/WAI/WCAG21/quickref/)

### Ferramentas
- [Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/)
- [Dark Mode Design System](https://www.figma.com/community/file/1020079617912031166)

---

**Implementado por**: GitHub Copilot  
**Data**: 20 de Outubro de 2025  
**Status**: ✅ Core implementado, 🚧 Páginas em andamento