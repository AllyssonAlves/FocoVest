/**
 * Script para Popular Banco de Dados - FocoVest
 * Executa seeding de questões reais e dados iniciais
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { QuestaoSeederService } from '../services/QuestaoSeederService';

// Configurar variáveis de ambiente
dotenv.config();

async function connectToDatabase(): Promise<void> {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/focovest';
    
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado ao MongoDB:', mongoUri);
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error);
    process.exit(1);
  }
}

async function runSeeding(): Promise<void> {
  console.log('🌱 INICIANDO POPULAÇÃO DO BANCO DE DADOS - FOCOVEST');
  console.log('================================================');

  try {
    // 1. Verificar se seeding é necessário
    const needsSeeding = await QuestaoSeederService.checkIfSeedingNeeded();
    
    if (!needsSeeding) {
      console.log('ℹ️ Banco já possui questões suficientes. Use --force para recriar.');
      const forceMode = process.argv.includes('--force');
      
      if (!forceMode) {
        await QuestaoSeederService.getStats();
        return;
      }
      
      console.log('🗑️ Modo força ativado - removendo questões existentes...');
      await QuestaoSeederService.clearAllQuestions();
    }

    // 2. Popular com questões reais
    console.log('\n📚 Populando banco com questões reais...');
    await QuestaoSeederService.seedRealQuestions();

    // 3. Exibir estatísticas finais
    console.log('\n📊 Estatísticas finais:');
    await QuestaoSeederService.getStats();

    console.log('\n🎉 SEEDING CONCLUÍDO COM SUCESSO!');
    console.log('🚀 Banco de dados pronto para uso em produção');

  } catch (error) {
    console.error('❌ Erro durante o seeding:', error);
    throw error;
  }
}

async function main(): Promise<void> {
  try {
    await connectToDatabase();
    await runSeeding();
  } catch (error) {
    console.error('💥 Falha crítica no script de seeding:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado do MongoDB');
    process.exit(0);
  }
}

// Verificar argumentos da linha de comando
const showHelp = process.argv.includes('--help') || process.argv.includes('-h');

if (showHelp) {
  console.log(`
🌱 Script de Seeding - FocoVest Database

USO:
  npm run seed              # Popula apenas se necessário
  npm run seed -- --force   # Força recriação completa
  npm run seed -- --help    # Exibe esta ajuda

OPÇÕES:
  --force    Remove dados existentes e recria tudo
  --help     Exibe informações de uso

EXEMPLOS:
  # Primeira execução (dados iniciais)
  npm run seed
  
  # Recriar banco completo
  npm run seed -- --force
  
  # Verificar estrutura atual
  npm run seed
`);
  process.exit(0);
}

// Executar script
main().catch(console.error);