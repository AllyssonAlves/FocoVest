@echo off
REM 🚀 Script de Deploy para Windows - GitHub Pages
REM Usage: scripts\deploy.bat

echo.
echo 🚀 Iniciando processo de deploy para GitHub Pages...
echo.

REM Verificar se estamos na pasta correta
if not exist "package.json" (
    echo ❌ package.json não encontrado. Execute este script na raiz do projeto.
    pause
    exit /b 1
)

REM Verificar se é um repositório Git
git rev-parse --git-dir >nul 2>&1
if errorlevel 1 (
    echo ❌ Este não é um repositório Git. Execute 'git init' primeiro.
    pause
    exit /b 1
)

echo ✅ 1/8 Verificando dependências...
if not exist "node_modules" (
    echo 📦 Instalando dependências...
    call npm ci
    if errorlevel 1 (
        echo ❌ Falha ao instalar dependências
        pause
        exit /b 1
    )
)

echo ✅ 2/8 Executando auditoria de segurança...
call npm audit --audit-level high
if errorlevel 1 (
    echo ⚠️  Vulnerabilidades encontradas, mas continuando...
)

echo ✅ 3/8 Executando testes...
call npm test -- --passWithNoTests --watchAll=false
if errorlevel 1 (
    echo ❌ Testes falharam
    pause
    exit /b 1
)

echo ✅ 4/8 Executando lint...
call npm run lint
if errorlevel 1 (
    echo ⚠️  Problemas de lint encontrados, mas continuando...
)

echo ✅ 5/8 Verificando tipos TypeScript...
call npx tsc --noEmit
if errorlevel 1 (
    echo ❌ Erros de tipo encontrados
    pause
    exit /b 1
)

echo ✅ 6/8 Gerando build de produção...
call npm run build
if errorlevel 1 (
    echo ❌ Build falhou
    pause
    exit /b 1
)

echo ✅ 7/8 Verificando build...
if not exist "dist" (
    echo ❌ Pasta dist não foi criada
    pause
    exit /b 1
)

if not exist "dist\index.html" (
    echo ❌ index.html não encontrado na pasta dist
    pause
    exit /b 1
)

echo ✅ 8/8 Commitando mudanças e fazendo push...
git add .
git commit -m "🚀 Ready for deployment"
git push origin main
if errorlevel 1 (
    echo ❌ Push falhou
    pause
    exit /b 1
)

echo.
echo 🎉 Deploy iniciado com sucesso!
echo.
echo 🔗 Acompanhe o progresso em:
echo    GitHub Actions: https://github.com/SEU_USERNAME/focovest/actions
echo.
echo 📱 Sua aplicação estará disponível em:
echo    https://SEU_USERNAME.github.io/focovest/
echo.
echo ⏱️  O deploy geralmente leva 2-3 minutos para completar.
echo.
echo ✅ Deploy concluído!
pause