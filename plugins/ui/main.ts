import { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { renderToString } from 'react-dom/server';
import { createElement } from 'react';
import ts from 'typescript';

export function ui(): Plugin {
  return {
    name: 'vite-plugin-ui-components',
    configureServer(server) {
      server.middlewares.use('/ui', async (_, res) => {
        const files = getFiles('app');
        const elementsPromises = files.map(async (file) => {
          const module_ = await server.ssrLoadModule(file.replace('/Users/niconiahi/Documents/repos/olga/', ''));
          return Object.entries(module_)
            .filter(([name]) => name !== 'default' && name[0] === name[0].toUpperCase())
            .map(([name, Component]) => ({
              element: createElement(Component),
              props: getComponentProps(file, name)
            }));
        });

        const elementsWithProps = (await Promise.all(elementsPromises)).flat();

        elementsWithProps.forEach(({ element, props }) => {
          console.log('element', element);
          console.log('props', props);
        });

        const parent = createElement(
          'main',
          null,
          ...elementsWithProps.map(({ element }) => element)
        );
        const html = renderToString(parent);
        res.setHeader('Content-Type', 'text/html');
        res.end(html);
      });
    }
  };
}

function getFiles(directory: string): string[] {
  const _files = glob.sync(path.resolve(directory, '**/*.tsx'));

  let files: string[] = [];
  _files.forEach((file) => {
    const content = fs.readFileSync(file, 'utf-8');
    if (content.includes('// @component')) {
      files.push(file);
    }
  });

  return files;
}

function getComponentProps(filePath: string, componentName: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);

  let props = [];

  functio: visit(node) {
    if (
      ts.isFunctionDeclaration(node) &&
      node.name &&
      node.name.text === componentName &&
      node.parameters.length > 0
    ) {
      const param = node.parameters[0];
      if (param && param.type) {
        const type = param.type;
        if (ts.isTypeLiteralNode(type) || ts.isTypeReferenceNode(type)) {
          type.members.forEach((member) => {
            if (ts.isPropertySignature(member) && member.name) {
              const propName = member.name.getText();
              const propType = member.type.getText();
              props.push({ propName, propType });
            }
          });
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return props;
}

