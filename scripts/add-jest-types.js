// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

// Função para encontrar arquivos recursivamente
function findTestFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findTestFiles(filePath, fileList);
    } else if (file.match(/\.test\.(ts|tsx)$/)) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Encontra todos os arquivos de teste
const testFiles = findTestFiles(path.join(__dirname, '..', 'src'));

const jestTypesReference = '/// <reference types="jest" />\n/// <reference types="@testing-library/jest-dom" />\n\n';

testFiles.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');
  
  // Verifica se já tem a referência
  if (content.includes('/// <reference types="jest" />')) {
    return;
  }
  
  // Adiciona a referência no início do arquivo
  const newContent = jestTypesReference + content;
  fs.writeFileSync(file, newContent, 'utf8');
  console.log(`Adicionado referência de tipos do Jest em: ${file}`);
});

console.log(`Processados ${testFiles.length} arquivos de teste.`);

