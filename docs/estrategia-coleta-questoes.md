# Estratégia de Coleta de Questões das Universidades Cearenses

## Universidades Alvo
- **UVA** - Universidade Veiga de Almeida
- **UECE** - Universidade Estadual do Ceará  
- **UFC** - Universidade Federal do Ceará
- **URCA** - Universidade Regional do Cariri
- **IFCE** - Instituto Federal de Educação, Ciência e Tecnologia do Ceará

## Fontes Identificadas

### 1. Portais Oficiais das Universidades
- **URCA**: cev.urca.br (Comissão Executiva do Vestibular)
- **UVA**: www.uva.br (Seção de vestibular/seleção)
- **UECE**: www.uece.br (CEV - Comissão Executiva de Vestibular)
- **UFC**: www.ufc.br (Portal do vestibular)
- **IFCE**: www.ifce.edu.br (Processos seletivos)

### 2. Plataformas de Questões Existentes
- **QConcursos**: www.qconcursos.com (28+ milhões de usuários)
- **Estude Grátis**: www.estudegratis.com.br (Desde 2011)
- **Estratégia Concursos**: www.estrategiaconcursos.com.br
- **Toda Matéria**: www.todamateria.com.br (6M+ usuários)

### 3. Repositórios Acadêmicos
- **Redalyc**: www.redalyc.org (748,230 artigos científicos)
- **SciELO**: www.scielo.br (Biblioteca científica eletrônica)

## Estratégia de Coleta

### Fase 1: Coleta Manual Direcionada
1. **Acessar vestibulares anteriores** nos sites oficiais
2. **Baixar PDFs** de provas de anos anteriores (2019-2024)
3. **Catalogar por universidade e ano**
4. **Extrair questões** e categorizar por matéria

### Fase 2: Web Scraping Automatizado
1. **Desenvolver scrapers** para cada universidade
2. **Monitorar releases** de novas provas
3. **Automatizar extração** de questões
4. **Validar qualidade** dos dados coletados

### Fase 3: Parcerias e APIs
1. **Contatar universidades** para acesso direto
2. **Verificar APIs** disponíveis
3. **Estabelecer parcerias** para dados oficiais

## Estrutura de Dados Proposta

```javascript
{
  "_id": "ObjectId",
  "universidade": "UECE|UFC|UVA|URCA|IFCE",
  "ano": 2024,
  "semestre": "2024.1",
  "materia": "Matemática|Português|História|...",
  "assunto": "Álgebra|Geometria|Interpretação|...",
  "tipo": "multipla_escolha|discursiva|verdadeiro_falso",
  "dificuldade": "facil|medio|dificil",
  "enunciado": "Texto da questão...",
  "alternativas": [
    {"letra": "A", "texto": "..."},
    {"letra": "B", "texto": "..."},
    // ...
  ],
  "gabarito": "A",
  "explicacao": "Explicação da resolução...",
  "tags": ["vestibular", "2024", "funcoes"],
  "fonte": "Vestibular UECE 2024.1",
  "criado_em": "2025-01-01T00:00:00Z",
  "verificado": true
}
```

## Cronograma de Implementação

### Semana 1-2: Setup Inicial
- Configurar ambiente de coleta
- Desenvolver estrutura de dados
- Implementar scrapers básicos

### Semana 3-4: Coleta Intensiva
- Executar coleta manual
- Testar scrapers automatizados
- Validar qualidade dos dados

### Semana 5-6: Processamento e IA
- Processar questões coletadas
- Implementar sistema de IA generativa
- Treinar modelos com questões reais

### Semana 7-8: Integração
- Integrar com plataforma FocoVest
- Testes e validação
- Deploy e monitoramento

## Métricas de Sucesso
- **1000+ questões** por universidade
- **5+ anos** de histórico de provas
- **95%+ precisão** na categorização
- **Geração automática** de 100+ questões/dia
- **Integração completa** com simulados existentes

## Considerações Legais
- Respeitar direitos autorais
- Usar apenas questões de domínio público
- Citar fontes adequadamente
- Seguir termos de uso dos sites

## Próximos Passos Imediatos
1. Iniciar coleta manual do URCA (fonte já identificada)
2. Desenvolver estrutura de banco de dados
3. Implementar primeiro scraper (URCA)
4. Expandir para outras universidades