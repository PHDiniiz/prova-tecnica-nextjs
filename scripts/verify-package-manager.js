#!/usr/bin/env node

/**
 * Script de verificação de gerenciador de pacotes
 * Garante que apenas yarn seja usado no projeto
 */

const fs = require('fs');
const path = require('path');

const FORBIDDEN_LOCK_FILES = ['package-lock.json', 'pnpm-lock.yaml'];
const REQUIRED_LOCK_FILE = 'yarn.lock';
const PROJECT_ROOT = path.resolve(__dirname, '..');

let hasErrors = false;
const errors = [];

// Verificar se yarn está instalado
function checkYarnInstalled() {
  try {
    const { execSync } = require('child_process');
    execSync('yarn --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Verificar arquivos de lock proibidos
function checkForbiddenLockFiles() {
  FORBIDDEN_LOCK_FILES.forEach((lockFile) => {
    const lockFilePath = path.join(PROJECT_ROOT, lockFile);
    if (fs.existsSync(lockFilePath)) {
      hasErrors = true;
      errors.push(
        `❌ Arquivo proibido encontrado: ${lockFile}\n` +
        `   Este projeto usa apenas yarn. Remova este arquivo e use 'yarn install' em vez de npm/pnpm.`
      );
    }
  });
}

// Verificar se yarn.lock existe
function checkYarnLockExists() {
  const yarnLockPath = path.join(PROJECT_ROOT, REQUIRED_LOCK_FILE);
  if (!fs.existsSync(yarnLockPath)) {
    hasErrors = true;
    errors.push(
      `❌ Arquivo ${REQUIRED_LOCK_FILE} não encontrado.\n` +
      `   Execute 'yarn install' para gerar o arquivo de lock.`
    );
  }
}

// Verificar packageManager no package.json
function checkPackageManagerField() {
  const packageJsonPath = path.join(PROJECT_ROOT, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      if (!packageJson.packageManager || !packageJson.packageManager.startsWith('yarn@')) {
        hasErrors = true;
        errors.push(
          `❌ Campo 'packageManager' não configurado corretamente no package.json.\n` +
          `   Deve ser: "packageManager": "yarn@1.22.22"`
        );
      }
    } catch (error) {
      errors.push(`❌ Erro ao ler package.json: ${error.message}`);
      hasErrors = true;
    }
  }
}

// Executar todas as verificações
function runChecks() {
  console.log('🔍 Verificando gerenciador de pacotes...\n');

  // Verificar se yarn está instalado
  if (!checkYarnInstalled()) {
    errors.push(
      `❌ Yarn não está instalado.\n` +
      `   Instale o yarn: npm install -g yarn`
    );
    hasErrors = true;
  } else {
    console.log('✅ Yarn está instalado');
  }

  // Verificar arquivos de lock proibidos
  checkForbiddenLockFiles();

  // Verificar yarn.lock
  checkYarnLockExists();
  if (fs.existsSync(path.join(PROJECT_ROOT, REQUIRED_LOCK_FILE))) {
    console.log(`✅ ${REQUIRED_LOCK_FILE} encontrado`);
  }

  // Verificar packageManager
  checkPackageManagerField();
  const packageJsonPath = path.join(PROJECT_ROOT, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      if (packageJson.packageManager && packageJson.packageManager.startsWith('yarn@')) {
        console.log('✅ packageManager configurado corretamente');
      }
    } catch (error) {
      // Já foi tratado em checkPackageManagerField
    }
  }

  // Exibir erros
  if (hasErrors) {
    console.log('\n❌ Erros encontrados:\n');
    errors.forEach((error) => console.log(error));
    console.log('\n');
    process.exit(1);
  } else {
    console.log('\n✅ Todas as verificações passaram!');
    process.exit(0);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runChecks();
}

module.exports = { runChecks, checkYarnInstalled, checkForbiddenLockFiles };

