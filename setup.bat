@echo off
echo ================================
echo    FOCOVEST - SETUP RAPIDO
echo ================================
echo.

echo [1/4] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js nao encontrado! 
    echo    Por favor, instale o Node.js 18+ de: https://nodejs.org
    pause
    exit /b 1
)
echo ✅ Node.js encontrado!

echo.
echo [2/4] Instalando dependencias...
call npm run install:all
if %errorlevel% neq 0 (
    echo ❌ Erro na instalacao das dependencias
    pause
    exit /b 1
)

echo.
echo [3/4] Construindo projeto...
call npm run build:shared
if %errorlevel% neq 0 (
    echo ❌ Erro no build do shared
    pause
    exit /b 1
)

echo.
echo [4/4] Iniciando servidores...
echo.
echo ================================
echo    PROJETO FOCOVEST PRONTO!
echo ================================
echo.
echo 🌐 Frontend: http://localhost:5173
echo 🔧 Backend:  http://localhost:5000/api
echo.
echo 🔑 Credenciais de teste:
echo    📧 joao@teste.com (senha: 123456)
echo    📧 maria@teste.com (senha: senha123)
echo.
echo ⚠️  Mantenha este terminal aberto!
echo    Pressione Ctrl+C para parar os servidores
echo.

REM Iniciar os servidores
call npm run dev

pause